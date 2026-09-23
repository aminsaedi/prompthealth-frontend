import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UniversalService } from './universal.service';
import { JourneyService } from './journey.service';

const PIXEL_ID: string = environment.config.META_PIXEL_ID || '';
const FBEVENTS_SRC = 'https://connect.facebook.net/en_US/fbevents.js';

/*
 * Hedieh's Meta Pixel, on growth landings and their booking flow only.
 *
 * Dormant until environment.META_PIXEL_ID is set: with an empty id nothing is
 * defined, loaded or queued. It is also silent on the server, and for a reader
 * whose browser sends Global Privacy Control or Do Not Track, the same signal
 * JourneyService honours. GA4 and HubSpot are unaffected either way.
 *
 * fbq is never called bare anywhere else. It is undeclared for TypeScript, and
 * undefined whenever the Pixel is dormant.
 */
@Injectable({ providedIn: 'root' })
export class MetaPixelService {

  /* Once per page lifetime. The stub, init and the script tag are all
   * one-shot: a second init would register the id twice. */
  private loaded = false;

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
       * again. Both flags are undocumented; confirm them in Test Events. */
      w.fbq.disablePushState = true;
      w.fbq.allowDuplicatePageViews = true;
      /* No automatic button and form scraping: the only events are the ones
       * this service sends. */
      w.fbq('set', 'autoConfig', false, PIXEL_ID);
      w.fbq('init', PIXEL_ID);
    } catch (e) {
      return;
    }

    const inject = () => {
      try {
        const script = document.createElement('script');
        script.async = true;
        script.src = FBEVENTS_SRC;
        document.head.appendChild(script);
      } catch (e) {
        /* the queue simply never drains */
      }
    };
    if (document.readyState === 'complete') {
      inject();
    } else {
      window.addEventListener('load', inject, { once: true });
    }
  }

  /* Called by each growth landing as it initializes, which is also what loads
   * the Pixel: it runs nowhere else on the site. */
  pageView(): void {
    this.call(['track', 'PageView']);
  }

  /* eventId is Meta's deduplication key (eid). It travels to Meta, so it is
   * public, and must never double as a secret. */
  track(name: string, params: { [key: string]: any } = {}, eventId?: string): void {
    this.call(eventId ? ['track', name, params, { eventID: eventId }] : ['track', name, params]);
  }

  trackCustom(name: string, params: { [key: string]: any } = {}): void {
    this.call(['trackCustom', name, params]);
  }

  private call(args: any[]): void {
    if (!this.enabled) { return; }
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
