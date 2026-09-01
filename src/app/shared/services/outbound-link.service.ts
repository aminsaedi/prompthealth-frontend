import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UniversalService } from './universal.service';
import { JourneyService } from './journey.service';

const API_URL = environment.config.API_URL;
const POLICY_CACHE_KEY = 'ph_link_policy';
const POLICY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
/* Upper bound on how long a tagging pass may wait for an idle moment. */
const SWEEP_DEADLINE_MS = 400;

export interface IRouteRule {
  pattern: string;
  campaign: string;
  label?: string;
}

export interface ILinkPolicy {
  enabled: boolean;
  source: string;
  medium: string;
  defaultCampaign: string;
  routeRules: IRouteRule[];
  includeContent: boolean;
  overrideExisting: boolean;
  internalHosts: string[];
  excludeHosts: string[];
  beacon: boolean;
}

/* Mirrors the server default so links are tagged correctly on the very first
 * paint, and stay tagged if the policy request fails. */
const FALLBACK_POLICY: ILinkPolicy = {
  enabled: true,
  source: 'prompthealth',
  medium: 'referral',
  defaultCampaign: 'site',
  routeRules: [
    { pattern: '^/community/profile/|^/profile/', campaign: 'profile' },
    { pattern: '^/community/(article|content)/', campaign: 'article' },
    { pattern: '^/community/event/', campaign: 'event' },
    { pattern: '^/practitioners', campaign: 'directory' },
    { pattern: '^/community', campaign: 'feed' },
    { pattern: '^/dashboard', campaign: 'dashboard' },
    { pattern: '^/$|^/about|^/plans|^/for-practitioners', campaign: 'marketing' },
  ],
  includeContent: true,
  overrideExisting: false,
  internalHosts: ['prompthealth.ca', 'www.prompthealth.ca', 'ocean.prompthealth.ca'],
  excludeHosts: [],
  beacon: true,
};

/* The character set every major analytics tool handles without complaint.
 * Anything outside it arrives percent-encoded in the destination's reports
 * (%E2%80%94 for an em dash), gets split on a delimiter, or is dropped.
 * Mirrors utmSafe in the backend's link service; the two are applied at
 * opposite ends of the same contract, so they must agree. */
const UTM_SAFE = /^[a-z0-9][a-z0-9._~-]*$/;
const UTM_MAX_LENGTH = 100;
const UTM_TRANSLITERATE: [RegExp, string][] = [
  [/[\u2010-\u2015\u2212]/g, '-'],
  [/[\u2018\u2019\u201A\u201B\u2032]/g, ''],
  [/[\u201C\u201D\u201E\u201F\u2033]/g, ''],
  [/[\u2026]/g, '-'],
  [/[&+]/g, '-and-'],
  [/[@]/g, '-at-'],
];

/* Returns '' when nothing usable survives, which callers treat as "do not emit
 * this parameter" rather than emitting an empty one. */
export function utmSafe(value: any, maxLength: number = UTM_MAX_LENGTH): string {
  if (value === null || value === undefined) { return ''; }
  let out = String(value).trim();
  if (!out) { return ''; }
  UTM_TRANSLITERATE.forEach(([pattern, replacement]) => { out = out.replace(pattern, replacement); });
  out = out.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  out = out.toLowerCase();
  out = out.replace(/[^a-z0-9._~-]+/g, '-');
  out = out.replace(/-{2,}/g, '-');
  out = out.replace(/^[-._~]+|[-._~]+$/g, '');
  if (out.length > maxLength) { out = out.slice(0, maxLength).replace(/[-._~]+$/, ''); }
  return UTM_SAFE.test(out) ? out : '';
}

/* A page path as one readable token: /community/profile/abc becomes
 * community-profile-abc. location.pathname is percent-encoded, so emitting it
 * directly produced utm_content=%2Fcommunity%2Ffeed — valid, but unreadable in
 * a partner's reports and liable to be cut mid-escape by a length limit. */
export function utmPathToken(path: string): string {
  return utmSafe(decodePath(path).replace(/^\/+|\/+$/g, '').replace(/\//g, '-')) || 'home';
}

/* A path can carry escapes that are not valid UTF-8, which throws. */
function decodePath(path: string): string {
  try {
    return decodeURIComponent(String(path || ''));
  } catch (e) {
    return String(path || '');
  }
}

/* The href we last wrote, so a later pass can tell our value from one the page
 * changed underneath us. */
const TAGGED_ATTR = 'data-ph-tagged';
/* The author's original href, kept so re-tagging always starts from the source
 * rather than from a URL that already carries last route's parameters. */
const SOURCE_ATTR = 'data-ph-href';

/*
 * Tags every outbound link on the site with UTM parameters and reports the click.
 *
 * One document-level listener replaces the per-component approach this used to
 * take. That matters for two reasons. Coverage: a listener on the document sees
 * links in the feed, in article bodies rendered through innerHTML, in profile
 * pages and in anything added later, without each of those surfaces having to
 * opt in and without any of them being able to forget. Timing: tagging is a
 * local string operation against a cached policy, so the correct href is in
 * place before the browser follows it. The previous design asked the server for
 * a short code per link, which meant a link clicked before its response arrived
 * navigated untagged.
 *
 * The click report is a separate, best-effort concern sent with sendBeacon, so a
 * slow or failed report never delays or blocks navigation.
 */
@Injectable({ providedIn: 'root' })
export class OutboundLinkService implements OnDestroy {

  private policy: ILinkPolicy = FALLBACK_POLICY;
  private compiledRules: { rule: IRouteRule; regex: RegExp }[] = [];
  private installed = false;
  private observer: MutationObserver = null;
  private sweepHandle: any = null;
  private reported = new Set<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private uService: UniversalService,
    private ngZone: NgZone,
    private router: Router,
    private journey: JourneyService,
  ) {
    this.compileRules();
  }

  /* Called once from the app root. Safe to call again; it is idempotent. */
  install(): void {
    if (this.installed || !this.uService.isBrowser) { return; }
    this.installed = true;

    this.loadPolicy();

    /* Outside Angular: these fire on every click and DOM mutation on the page,
     * and none of them touch component state. */
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('click', this.onPointer, true);
      document.addEventListener('auxclick', this.onPointer, true);
      document.addEventListener('contextmenu', this.onPointer, true);

      this.scheduleSweep();
      this.observer = new MutationObserver(() => this.scheduleSweep());
      this.observer.observe(document.body, { childList: true, subtree: true });
    });

    /* utm_content and the campaign rule both depend on the current path, so a
     * client-side navigation invalidates every tag on the page. */
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => this.resetPageState());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (!this.uService.isBrowser || !this.installed) { return; }
    document.removeEventListener('click', this.onPointer, true);
    document.removeEventListener('auxclick', this.onPointer, true);
    document.removeEventListener('contextmenu', this.onPointer, true);
    if (this.observer) { this.observer.disconnect(); this.observer = null; }
  }

  // --------------------------------------------------------------- policy

  private compileRules(): void {
    this.compiledRules = [];
    (this.policy.routeRules || []).forEach(rule => {
      try {
        this.compiledRules.push({ rule, regex: new RegExp(rule.pattern, 'i') });
      } catch (e) {
        /* A malformed pattern must not take tagging down with it. */
      }
    });
  }

  private loadPolicy(): void {
    const cached = this.readCachedPolicy();
    if (cached) {
      this.policy = cached;
      this.compileRules();
    }
    this.http.get<any>(`${API_URL}link/policy`).subscribe(
      res => {
        if (res && res.data) {
          this.policy = { ...FALLBACK_POLICY, ...res.data };
          this.compileRules();
          this.writeCachedPolicy(this.policy);
          this.sweep(true);
        }
      },
      () => { /* keep the cached or fallback policy */ },
    );
  }

  private readCachedPolicy(): ILinkPolicy {
    try {
      const raw = this.uService.localStorage.getItem(POLICY_CACHE_KEY);
      if (!raw) { return null; }
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.at || Date.now() - parsed.at > POLICY_CACHE_TTL_MS) { return null; }
      return { ...FALLBACK_POLICY, ...parsed.policy };
    } catch (e) {
      return null;
    }
  }

  private writeCachedPolicy(policy: ILinkPolicy): void {
    try {
      this.uService.localStorage.setItem(POLICY_CACHE_KEY, JSON.stringify({ at: Date.now(), policy }));
    } catch (e) {
      /* private browsing or a full quota; tagging still works from memory */
    }
  }

  // ----------------------------------------------------------------- urls

  private hostMatches(hostname: string, entry: string): boolean {
    const candidate = (entry || '').toLowerCase().replace(/^\*?\./, '');
    if (!candidate) { return false; }
    return hostname === candidate || hostname.endsWith('.' + candidate);
  }

  /* An outbound link is an http(s) link to a host we do not own and have not
   * excluded. Everything else — in-app routes, anchors, mailto:, tel:,
   * javascript: — is left exactly as the author wrote it. */
  isOutbound(href: string): boolean {
    if (!href) { return false; }
    const trimmed = href.trim();
    if (!trimmed || trimmed.startsWith('#')) { return false; }
    let url: URL;
    try {
      url = new URL(trimmed, document.baseURI);
    } catch (e) {
      return false;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') { return false; }
    const hostname = url.hostname.toLowerCase();
    if ((this.policy.internalHosts || []).some(entry => this.hostMatches(hostname, entry))) { return false; }
    if ((this.policy.excludeHosts || []).some(entry => this.hostMatches(hostname, entry))) { return false; }
    return true;
  }

  private campaignForPath(path: string): string {
    const match = this.compiledRules.find(entry => entry.regex.test(path));
    return match ? match.rule.campaign : this.policy.defaultCampaign;
  }

  /* Returns the tagged URL, or null when nothing needs to change. */
  taggedUrl(href: string, path?: string): string {
    if (!this.policy.enabled || !this.isOutbound(href)) { return null; }
    let url: URL;
    try {
      url = new URL(href.trim(), document.baseURI);
    } catch (e) {
      return null;
    }
    if (!this.policy.overrideExisting && url.searchParams.has('utm_source')) { return null; }

    /* Every value is normalised before it goes out, and an empty result means
     * the parameter is omitted rather than emitted blank. The policy is editable,
     * so nothing here can assume its values are already well formed. */
    const page = path || window.location.pathname;
    const values: [string, string][] = [
      ['utm_source', utmSafe(this.policy.source, 50)],
      ['utm_medium', utmSafe(this.policy.medium, 50)],
      ['utm_campaign', utmSafe(this.campaignForPath(page))],
    ];
    if (this.policy.includeContent) {
      values.push(['utm_content', utmPathToken(page)]);
    }
    const usable = values.filter(([, value]) => !!value);
    if (!usable.length) { return null; }
    usable.forEach(([key, value]) => url.searchParams.set(key, value));

    const tagged = url.toString();
    return tagged === href ? null : tagged;
  }

  // -------------------------------------------------------------- tagging

  private tag(anchor: HTMLAnchorElement, force = false): void {
    const href = anchor.getAttribute('href');
    if (!href) { return; }
    if (!this.isOutbound(href)) {
      anchor.removeAttribute(TAGGED_ATTR);
      anchor.removeAttribute(SOURCE_ATTR);
      return;
    }

    const written = anchor.getAttribute(TAGGED_ATTR);
    const recorded = anchor.getAttribute(SOURCE_ATTR);
    /* If the href is still the one we wrote, the author's URL is the recorded
     * one. If it is not, the page replaced it and that new value is the source. */
    const ours = written !== null && written === href && recorded !== null;
    const source = ours ? recorded : href;
    if (ours && !force) { return; }

    const tagged = this.taggedUrl(source);
    anchor.setAttribute(SOURCE_ATTR, source);
    if (tagged) {
      anchor.setAttribute('href', tagged);
      anchor.setAttribute(TAGGED_ATTR, tagged);
    } else {
      if (href !== source) { anchor.setAttribute('href', source); }
      anchor.setAttribute(TAGGED_ATTR, source);
    }

    /* Outbound links that open in a new tab should not hand the destination a
     * usable window.opener. */
    if (anchor.target === '_blank') {
      const rel = anchor.getAttribute('rel') || '';
      if (!/noopener/.test(rel)) { anchor.setAttribute('rel', (rel + ' noopener').trim()); }
    }
  }

  /* Batched so a burst of DOM mutations costs one pass, not one pass each.
   *
   * The deadline is not optional. An infinite-scroll feed keeps the main thread
   * busy enough that a plain requestIdleCallback can go unserved for as long as
   * the user keeps scrolling, which left inline links in post bodies untagged
   * until they were clicked. A click still tags the link it is about to follow,
   * but the href also has to be right for hover, middle-click and "copy link
   * address", so the pass needs a guaranteed upper bound. */
  private scheduleSweep(): void {
    if (this.sweepHandle !== null) { return; }
    const run = () => {
      this.sweepHandle = null;
      this.sweep();
    };
    const idle = (window as any).requestIdleCallback;
    this.sweepHandle = idle
      ? idle.call(window, run, { timeout: SWEEP_DEADLINE_MS })
      : window.setTimeout(run, 100);
  }

  private sweep(force = false): void {
    let anchors: NodeListOf<Element>;
    try {
      anchors = document.querySelectorAll('a[href]');
    } catch (e) {
      return;
    }
    for (let i = 0; i < anchors.length; i++) {
      try {
        this.tag(anchors[i] as HTMLAnchorElement, force);
      } catch (e) {
        /* one bad anchor must not stop the sweep */
      }
    }
  }

  // --------------------------------------------------------------- clicks

  private onPointer = (event: Event): void => {
    try {
      const target = event.target as Element;
      if (!target || !target.closest) { return; }
      const anchor = target.closest('a[href]') as HTMLAnchorElement;
      if (!anchor) { return; }
      const href = anchor.getAttribute('href');

      /* A managed short link is one of ours, so it is not tagged, but it is the
       * one outbound path where no script of ours runs afterwards: the browser
       * leaves for /out/<code> and the redirect happens on the server. The
       * journey has to travel in the URL or it does not travel at all. */
      if (this.stampShortLink(anchor, href)) { return; }

      if (!this.isOutbound(href)) { return; }

      /* Tag before the browser acts on the click. This is the guarantee that
       * makes the idle sweep an optimisation rather than a requirement. */
      this.tag(anchor);
      if (event.type !== 'contextmenu') {
        /* Report the author's URL, not the one we just tagged. The catalog keys
         * on the destination; reporting our own campaign back would file the
         * same site under a new entry for every page it is linked from. */
        this.report(anchor.getAttribute(SOURCE_ATTR) || href);
      }
    } catch (e) {
      /* never interfere with a navigation */
    }
  };

  /*
   * Appends the visit to a /out/<code> href, immediately before it is followed.
   *
   * The origin check is the point of this method, not a detail of it. Article
   * bodies are raw unsanitised HTML, so an author, or anyone who can get an
   * article approved, can write <a href="//somewhere.example/out/abc">. Matching
   * on the path alone would hand that host a live session token, and with it the
   * ability to write into this reader's visit. Only a link on our own origin,
   * with the shape of a real short code, is stamped.
   */
  private stampShortLink(anchor: HTMLAnchorElement, href: string): boolean {
    if (!href || href.indexOf('/out/') < 0) { return false; }
    let url: URL;
    try {
      url = new URL(href, document.baseURI);
    } catch (e) {
      return false;
    }
    if (url.origin !== window.location.origin) { return false; }
    if (!/^\/out\/[0-9a-z]{3,32}$/.test(url.pathname)) { return false; }

    const session = this.journey.session;
    if (!session) { return true; }
    /* The visitor id is deliberately not sent. The server reads it from the
     * session it already holds, and the pair of the two is what proves a write
     * belongs to this visit: putting both in a URL would make that pair
     * something a reader can copy out of the address bar. */
    url.searchParams.set('s', session);
    url.searchParams.set('t', this.journey.currentType);
    if (this.journey.currentId) { url.searchParams.set('e', this.journey.currentId); }

    const original = anchor.getAttribute('href');
    anchor.setAttribute('href', url.pathname + url.search);
    /* Put the plain href back once the browser has acted on the click. The
     * handler also runs on contextmenu, and leaving the stamped one in place
     * meant "copy link address" handed out a live session token. */
    window.setTimeout(() => {
      if (anchor.getAttribute('href') === url.pathname + url.search) {
        anchor.setAttribute('href', original);
      }
    }, 0);

    /* The reader is about to leave, and this page may never have reported
     * itself. Send it now so the visit it belongs to exists. */
    this.journey.flush();
    return true;
  }

  /* One report per destination per page view. Repeated clicks on the same link
   * in the same view are the same intent and would only inflate the count. */
  private report(url: string): void {
    if (!this.policy.beacon || !url) { return; }
    /* The reader is leaving. If this page has not reported itself yet, send it
     * now, so the click has a visit to belong to. */
    this.journey.flush();
    const path = window.location.pathname;
    const key = `${path}|${url}`;
    if (this.reported.has(key)) { return; }
    this.reported.add(key);

    const body = JSON.stringify({
      url,
      path: path.slice(0, 256),
      utmSource: utmSafe(this.policy.source, 50),
      utmMedium: utmSafe(this.policy.medium, 50),
      utmCampaign: utmSafe(this.campaignForPath(path)),
      utmContent: this.policy.includeContent ? utmPathToken(path) : '',
      /* The visit, and the page the click happened on. The page is sent rather
       * than looked up from the visit afterwards, because sessionStorage is
       * copied into a tab opened from a link: two doctors opened in background
       * tabs share one visit, and whichever finished loading last would
       * otherwise take the credit for a click made in the other. */
      sid: this.journey.session,
      vid: this.journey.visitor,
      etype: this.journey.currentType,
      eid: this.journey.currentId,
    });
    const endpoint = `${API_URL}link/track`;

    try {
      if (navigator.sendBeacon) {
        /* text/plain keeps this a CORS simple request, so it is not held up by
         * a preflight the page is about to navigate away from. */
        navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
        return;
      }
    } catch (e) {
      /* fall through to fetch */
    }
    try {
      fetch(endpoint, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } })
        .catch(() => undefined);
    } catch (e) {
      /* reporting is best effort */
    }
  }

  /* Drops the per-page-view report memo and re-tags, because the campaign and
   * utm_content values are derived from the path that just changed. */
  resetPageState(): void {
    this.reported.clear();
    this.sweep(true);
  }
}
