import { Injectable } from '@angular/core';
import { UniversalService } from './universal.service';

/*
 * GA4 events, through the gtag that index.html defines.
 *
 * gtag is declared for no one in TypeScript, and a page can run without it: an
 * ad blocker removes gtag.js, and the server has no window at all. A reporting
 * call that throws there would take the booking flow down with it, so every
 * call is guarded and swallowed. Callers change their own state first and
 * report second, so nothing a reader sees ever waits on this.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  constructor(private _uService: UniversalService) {}

  event(name: string, params: { [key: string]: any } = {}): void {
    if (!this._uService.isBrowser) { return; }
    try {
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        gtag('event', name, params);
      }
    } catch (e) {
      /* reporting is best effort */
    }
  }
}
