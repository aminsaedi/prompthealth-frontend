import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UniversalService } from './universal.service';
import { JourneyService } from './journey.service';

const PIXEL_ID: string = environment.config.META_PIXEL_ID || '';
const FBEVENTS_SRC = 'https://connect.facebook.net/en_US/fbevents.js';

/* The fbq calls that send something to Meta. Anything else in its queue is
 * setup (set, init) and must survive a purge. */
const SENDS = ['track', 'trackCustom', 'trackSingle', 'trackSingleCustom'];

/*
 * Hedieh's Meta Pixel, on growth landings and their booking flow only.
 *
 * Dormant until environment.META_PIXEL_ID is set: with an empty id nothing is
 * defined, loaded or queued. It is also silent on the server, and for a reader
 * whose browser sends Global Privacy Control or Do Not Track, the same signal
 * JourneyService honours. GA4 and HubSpot are unaffected either way.
 *
 * "Only on growth landings" has to be enforced after the reader leaves one,
 * because fbevents.js stays in the tab for the rest of the visit. Each landing
 * calls pageView as it starts and leave as it goes, and in between the Pixel is
 * held shut: see leave.
 *
 * fbq is never called bare anywhere else. It is undeclared for TypeScript, and
 * undefined whenever the Pixel is dormant.
 */
@Injectable({ providedIn: 'root' })
export class MetaPixelService {

  /* Once per page lifetime. The stub and init are one-shot: a second init
   * would register the id twice. */
  private loaded = false;
  /* Whether the script tag has been added. It cannot be taken back once it
   * has, only kept from being added. */
  private injected = false;
  /* Whether a growth landing is on screen now. */
  private onLanding = false;
  /* Whether a consent revoke has been sent to the script, or queued for it. */
  private revoked = false;

  constructor(
    private _uService: UniversalService,
    private _journey: JourneyService,
  ) {}

  private get enabled(): boolean {
    return !!PIXEL_ID && this._uService.isBrowser && this._journey.tracksAcrossVisits();
  }

  /*
   * Defines fbq at once and fetches fbevents.js after the page has loaded.
   *
   * The stub is the standard snippet's: calls made before the script arrives
   * wait in its queue, so an event fired early is delayed, never lost. Only the
   * network request waits, so the Pixel costs the landing nothing on the way to
   * first paint. It waits on readyState rather than on the load event alone,
   * because a reader who arrives in-app (the header link from the homepage)
   * arrives long after load has fired, and a plain listener would never run.
   */
  load(): void {
    if (this.loaded || !this.enabled) { return; }
    this.loaded = true;

    try {
      const w: any = window;
      if (!w.fbq) {
        const n: any = function() {
          if (n.callMethod) {
            n.callMethod.apply(n, arguments);
          } else {
            n.queue.push(arguments);
          }
        };
        w.fbq = n;
        if (!w._fbq) { w._fbq = n; }
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
      }
      /* fbevents.js sends a PageView on every history.pushState unless told
       * not to. This is a single-page app: after one visit to a landing, every
       * later in-app page (profiles, health articles, even this page's own
       * ?modal= navigation) would go to Meta with its address. The landing
       * sends its own PageView instead (pageView below), and
       * allowDuplicatePageViews lets a return to it in the same tab send one
       * again. Both flags are undocumented; confirm them in Test Events.
       * disablePushState does not cover a page restored from the back/forward
       * cache, which fbevents reports whatever the flag says; leave covers
       * that. */
      w.fbq.disablePushState = true;
      w.fbq.allowDuplicatePageViews = true;
      /* Opts out of Meta's automatic event setup, which would otherwise report
       * button clicks and page metadata of its own accord. It does not switch
       * off Automatic Advanced Matching, a separate setting on the pixel in
       * Events Manager: while that is on, fbevents reads the booking form's
       * fields by their autocomplete tokens (name, email, tel, city) and sends
       * them hashed with each event. Nothing in this code can turn that off. */
      w.fbq('set', 'autoConfig', false, PIXEL_ID);
      w.fbq('init', PIXEL_ID);
    } catch (e) {
      return;
    }
    this.armInjection();
  }

  /*
   * Called by each growth landing as it initializes, which is also what loads
   * the Pixel: it runs nowhere else on the site. It reopens the Pixel if an
   * earlier landing in this tab closed it.
   */
  pageView(): void {
    if (!this.enabled) { return; }
    this.onLanding = true;
    this.load();
    this.resume();
    this.call(['track', 'PageView']);
  }

  /*
   * Called by each growth landing as it is destroyed. From here until the next
   * landing starts, nothing reaches Meta, for two reasons.
   *
   * fbevents.js reads the page's address when it sends, not when an event was
   * queued. A PageView still waiting for the script (queued at init, with the
   * script due at window load or still downloading) would go out carrying the
   * address of whatever page the reader had moved on to. So queued sends are
   * dropped, and a script not yet requested is not requested.
   *
   * Once the script has run it sends a PageView of its own whenever a page
   * comes back from the back/forward cache, with that page's address: a
   * reader who went from the landing to a profile, left the site and pressed
   * Back would report the profile. Consent revoke is Meta's own switch for
   * holding everything, and the script honours it for that PageView too.
   *
   * Held is not dropped: the script keeps what arrives while revoked and sends
   * it when consent is granted again, so resume clears that queue first.
   */
  leave(): void {
    this.onLanding = false;
    if (!this.loaded) { return; }
    try {
      const fbq = (window as any).fbq;
      if (typeof fbq !== 'function') { return; }
      if (isLive(fbq)) {
        if (!this.revoked) {
          fbq('consent', 'revoke');
          this.revoked = true;
        }
        return;
      }
      window.removeEventListener('load', this.injectOnLoad);
      dropSends(fbq.queue);
      /* The script is on its way and will run with nobody on the landing.
       * Queued last, so it runs set and init and then shuts. */
      if (this.injected && !this.revoked) {
        fbq('consent', 'revoke');
        this.revoked = true;
      }
    } catch (e) {
      /* reporting is best effort and must never affect the page */
    }
  }

  /* eventId is Meta's deduplication key (eid). It travels to Meta, so it is
   * public, and must never double as a secret. */
  track(name: string, params: { [key: string]: any } = {}, eventId?: string): void {
    this.call(eventId ? ['track', name, params, { eventID: eventId }] : ['track', name, params]);
  }

  trackCustom(name: string, params: { [key: string]: any } = {}): void {
    this.call(['trackCustom', name, params]);
  }

  /*
   * Undoes leave on the next landing.
   *
   * With the script running, consent is granted again, after dropping what it
   * held meanwhile: those are sends from other pages, the back/forward-cache
   * PageViews above, and granting would release them with this page's address.
   *
   * Before the script has run, the revoke is taken back out of the stub's
   * queue rather than followed by a grant. The script works through its queue
   * only while unlocked, so a grant queued behind a revoke would never be
   * reached, and the Pixel would stay shut for the rest of the visit.
   */
  private resume(): void {
    try {
      const fbq = (window as any).fbq;
      if (typeof fbq !== 'function') { return; }
      if (isLive(fbq)) {
        if (this.revoked) {
          dropSends(fbq.queue);
          fbq('consent', 'grant');
          this.revoked = false;
        }
        return;
      }
      dropConsent(fbq.queue);
      this.revoked = false;
      this.armInjection();
    } catch (e) {
      /* reporting is best effort and must never affect the page */
    }
  }

  private armInjection(): void {
    if (this.injected) { return; }
    if (document.readyState === 'complete') {
      this.inject();
    } else {
      window.addEventListener('load', this.injectOnLoad, { once: true });
    }
  }

  /* One function, so leave can remove the listener it added. */
  private readonly injectOnLoad = () => this.inject();

  private inject(): void {
    if (this.injected || !this.onLanding) { return; }
    this.injected = true;
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = FBEVENTS_SRC;
      document.head.appendChild(script);
    } catch (e) {
      /* the queue simply never drains */
    }
  }

  private call(args: any[]): void {
    if (!this.enabled || !this.onLanding) { return; }
    this.load();
    try {
      const fbq = (window as any).fbq;
      if (typeof fbq === 'function') {
        fbq.apply(null, args);
      }
    } catch (e) {
      /* reporting is best effort and must never affect the page */
    }
  }
}

/* fbevents.js sets callMethod when it runs; until then fbq is the stub. */
function isLive(fbq: any): boolean {
  return typeof fbq.callMethod === 'function';
}

/* The queue holds each call's arguments object, stub and script alike. Edited
 * in place, because the script reads it through fbq.queue as it drains. */
function filterQueue(queue: any, keep: (method: any) => boolean): void {
  if (!queue || typeof queue.length !== 'number') { return; }
  const kept = Array.prototype.filter.call(queue, (args: any) => keep(args && args[0]));
  queue.length = 0;
  kept.forEach((args: any) => queue.push(args));
}

function dropSends(queue: any): void {
  filterQueue(queue, method => SENDS.indexOf(method) === -1);
}

function dropConsent(queue: any): void {
  filterQueue(queue, method => method !== 'consent');
}
