import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UniversalService } from './universal.service';

const API_URL = environment.config.API_URL;
const VISITOR_KEY = 'ph_vid';
const SESSION_KEY = 'ph_sid';
const SESSION_SEEN_KEY = 'ph_sid_at';
/* A visit ends after half an hour of doing nothing, which is the convention
 * every analytics tool uses and the one a reader's own sense of "a visit"
 * matches. */
const SESSION_IDLE_MS = 30 * 60 * 1000;
/* How long a page is given to work out what it is before the view is reported
 * anyway. Measured: a practitioner page reached by id takes about two seconds
 * because it waits on the questionnaire, so this has to be generous. */
const ENTITY_DEADLINE_MS = 4000;

export type JourneyEntityType =
  'article' | 'event' | 'practitioner' | 'clinic' | 'directory' | 'feed' | 'home' | 'other';

/*
 * Tracks the path a reader walks through the site, so an outbound click can say
 * what led to it.
 *
 * Two things about this are deliberate and worth knowing before changing it.
 *
 * A page's identity comes from the component that renders it, never from the
 * URL. /practitioners/<slug> is a router redirectTo, so a browser is never
 * actually on it: it ends up at /community/profile/s/<slug>, which is the same
 * address a clinic renders at. No pattern over the path can tell a doctor from
 * a clinic, or find the id of either. ProfileComponent and PageComponent know,
 * so they say.
 *
 * And no path is ever sent. Only a type from a fixed list and, where there is
 * one, an entity id. A URL on this site can carry a password reset token, and
 * the counters this feeds are permanent.
 */
@Injectable({ providedIn: 'root' })
export class JourneyService implements OnDestroy {

  private installed = false;
  private destroy$ = new Subject<void>();

  private visitorId = '';
  private sessionId = '';

  /* What the current page is. Set from the route on navigation, then corrected
   * by the component once it knows. Read by OutboundLinkService, which sends it
   * with every outbound click: the page a click happened on is the one fact the
   * click itself is certain of. */
  private entityType: JourneyEntityType = 'other';
  private entityId = '';

  private pendingTimer: any = null;
  private reportedForThisPage = false;
  private navigationCount = 0;
  /* The part of the address that names the thing being looked at, so a tab
   * change underneath it is recognised as the same page. */
  private entityRootReported = '';

  constructor(
    private uService: UniversalService,
    private ngZone: NgZone,
    private router: Router,
  ) {}

  /* Called once from the app root, browser only. Safe to call again. */
  install(): void {
    if (this.installed || !this.uService.isBrowser) { return; }
    this.installed = true;

    this.visitorId = this.readVisitor();
    this.sessionId = this.readSession();

    this.ngZone.runOutsideAngular(() => {
      this.onNavigated();
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd), takeUntil(this.destroy$))
        .subscribe(() => this.onNavigated());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearTimer();
  }

  // ------------------------------------------------------------ identity

  get session(): string { return this.sessionId; }
  get visitor(): string { return this.visitorId; }
  get currentType(): JourneyEntityType { return this.entityType; }
  get currentId(): string { return this.entityId; }

  /* 128 bits from the platform's random source. A session token is the key a
   * visit is stored under, so a guessable one would let somebody write into
   * somebody else's visit. */
  private token(): string {
    try {
      const buffer = new Uint8Array(16);
      const crypto = (window as any).crypto || (window as any).msCrypto;
      if (crypto && crypto.getRandomValues) {
        crypto.getRandomValues(buffer);
        let out = '';
        for (let i = 0; i < buffer.length; i++) {
          out += ('0' + buffer[i].toString(16)).slice(-2);
        }
        return out;
      }
    } catch (e) {
      /* fall through */
    }
    return (Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))
      .replace(/[^a-z0-9]/g, '').slice(0, 32);
  }

  private read(store: Storage, key: string): string {
    try {
      return store.getItem(key) || '';
    } catch (e) {
      return '';
    }
  }

  private write(store: Storage, key: string, value: string): void {
    try {
      store.setItem(key, value);
    } catch (e) {
      /* private browsing, a full quota, or an embedded webview. The visit is
       * still counted; it just is not linked to any other visit. */
    }
  }

  /* Global Privacy Control and Do Not Track are honoured by not keeping an id
   * that outlives the visit. The visit is still counted, because a count with
   * nothing attached to it is not the thing either signal is about. */
  private tracksAcrossVisits(): boolean {
    try {
      const nav: any = window.navigator;
      if (nav.globalPrivacyControl === true) { return false; }
      if (nav.doNotTrack === '1' || (window as any).doNotTrack === '1' || nav.msDoNotTrack === '1') { return false; }
    } catch (e) {
      /* treat an unreadable navigator as no signal */
    }
    return true;
  }

  private readVisitor(): string {
    if (!this.tracksAcrossVisits()) { return this.token(); }
    let id = this.read(this.uService.localStorage as Storage, VISITOR_KEY);
    if (!/^[a-z0-9]{16,64}$/.test(id)) {
      id = this.token();
      this.write(this.uService.localStorage as Storage, VISITOR_KEY, id);
    }
    return id;
  }

  private readSession(): string {
    const now = Date.now();
    const seenAt = parseInt(this.read(this.uService.localStorage as Storage, SESSION_SEEN_KEY), 10) || 0;
    let id = this.read(this.uService.sessionStorage as Storage, SESSION_KEY);
    if (!/^[a-z0-9]{16,64}$/.test(id) || (seenAt && now - seenAt > SESSION_IDLE_MS)) {
      id = this.token();
      this.write(this.uService.sessionStorage as Storage, SESSION_KEY, id);
    }
    this.write(this.uService.localStorage as Storage, SESSION_SEEN_KEY, String(now));
    return id;
  }

  private touchSession(): void {
    this.write(this.uService.localStorage as Storage, SESSION_SEEN_KEY, String(Date.now()));
  }

  // ---------------------------------------------------------- navigation

  /* The first three segments of a profile or content address, which is as much
   * as identifies the entity: /community/profile/s/<slug>/review and
   * /community/profile/s/<slug> are the same doctor. Returns '' for pages that
   * are not about an entity, which are reported on every navigation. */
  private entityRoot(path: string): string {
    const profile = path.match(/^\/community\/profile\/(s\/)?[^/]+/);
    if (profile) { return profile[0]; }
    const content = path.match(/^\/community\/(article|content|event)\/[^/]+/);
    if (content) { return content[0]; }
    return '';
  }

  /* A first guess from the URL, good enough for pages that are not about an
   * entity. Anything that is about one is corrected by setEntity below. */
  private typeFromPath(path: string): JourneyEntityType {
    if (/^\/community\/(article|content)\//.test(path)) { return 'article'; }
    if (/^\/community\/event\//.test(path)) { return 'event'; }
    if (/^\/community\/profile\//.test(path) || /^\/practitioners\/[^/]/.test(path)) { return 'practitioner'; }
    if (/^\/practitioners/.test(path)) { return 'directory'; }
    if (/^\/community/.test(path)) { return 'feed'; }
    if (path === '/' || path === '') { return 'home'; }
    return 'other';
  }

  private onNavigated(): void {
    this.navigationCount++;
    this.touchSession();
    this.clearTimer();

    let path = '/';
    try {
      path = window.location.pathname;
    } catch (e) {
      path = '/';
    }

    /* About, Service, Feed and Review under a profile are tabs, not pages. The
     * router emits a navigation for each, but the component is reused and never
     * re-announces the profile, so treating them as new pages counted three of
     * a doctor's tab clicks against a nameless bucket and one against the
     * doctor. The entity is carried while the part of the address that names it
     * has not changed. */
    const root = this.entityRoot(path);
    if (root && root === this.entityRootReported) { return; }

    this.entityRootReported = root;
    this.reportedForThisPage = false;
    this.entityId = '';
    this.entityType = this.typeFromPath(path);

    /* A page that is about an entity is not reported until it says which one,
     * or until the deadline. A page that is not about one has nothing to wait
     * for and is reported immediately. */
    if (this.entityType === 'article' || this.entityType === 'event' || this.entityType === 'practitioner') {
      const nav = this.navigationCount;
      this.pendingTimer = window.setTimeout(() => {
        this.pendingTimer = null;
        if (nav === this.navigationCount) { this.report(); }
      }, ENTITY_DEADLINE_MS);
    } else {
      this.report();
    }
  }

  /*
   * Called by the component that renders the page, once it knows what it is
   * showing. This is the authoritative classification: it is the only place
   * that can tell a clinic from a practitioner, because both render through
   * the same component at the same URL.
   */
  setEntity(type: JourneyEntityType, id: string): void {
    if (!this.installed) { return; }
    this.entityType = type;
    this.entityId = /^[a-f0-9]{24}$/i.test(String(id || '')) ? String(id) : '';
    this.clearTimer();
    if (!this.reportedForThisPage) { this.report(); }
  }

  private clearTimer(): void {
    if (this.pendingTimer !== null) {
      window.clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }

  /* Sent before the browser leaves, so a reader who lands and clicks straight
   * out is still a visit that happened. */
  flush(): void {
    if (this.installed && !this.reportedForThisPage) { this.report(); }
  }

  private report(): void {
    if (!this.sessionId) { return; }
    this.reportedForThisPage = true;
    this.clearTimer();

    let ref = '';
    try {
      /* Only an off-site referrer says anything: our own pages are already in
       * the trail, and a same-site referrer is a path we have decided not to
       * store. */
      ref = document.referrer && document.referrer.indexOf(window.location.origin) !== 0 ? document.referrer : '';
    } catch (e) {
      ref = '';
    }

    const entry = this.inboundCampaign();
    const body = JSON.stringify({
      sid: this.sessionId,
      vid: this.visitorId,
      type: this.entityType,
      id: this.entityId,
      ref: ref.slice(0, 512),
      ...entry,
    });

    const endpoint = `${API_URL}track/view`;
    try {
      if (navigator.sendBeacon) {
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
      /* reporting is best effort and must never affect the page */
    }
  }

  /* The campaign that brought the reader to us, read once per visit from the
   * address they arrived on. Only useful on the first page, and harmless after
   * it, because the server keeps whichever arrives first. */
  private inboundCampaign(): { [key: string]: string } {
    const out: { [key: string]: string } = {};
    try {
      const params = new URLSearchParams(window.location.search);
      const map: [string, string][] = [
        ['utm_source', 'utmSource'],
        ['utm_medium', 'utmMedium'],
        ['utm_campaign', 'utmCampaign'],
        ['utm_content', 'utmContent'],
      ];
      map.forEach(([from, to]) => {
        const value = params.get(from);
        if (value) { out[to] = value.slice(0, 200); }
      });
    } catch (e) {
      /* an unparseable query string is not worth a broken pageview */
    }
    return out;
  }
}
