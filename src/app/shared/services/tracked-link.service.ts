import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const API_URL = environment.config.API_URL;
const PH_HOSTS = ['prompthealth.ca', 'www.prompthealth.ca'];

export interface ITrackedResolve {
  code: string;
  url: string;
}

/* Built-in link tracker helper: resolve an external URL to a /out/<code> short link.
 * Profile website/booking already arrive server-embedded (trackedWebsite/trackedBookingUrl);
 * this service is used for content-card / arbitrary external links. Browser-only (SSR-safe).
 * Naming avoids collision with existing CanonicalLinkService in link.service.ts. */
@Injectable({ providedIn: 'root' })
export class TrackedLinkService {

  private cache = new Map<string, Observable<ITrackedResolve>>();

  constructor(private http: HttpClient) {}

  /* Aligned with backend isExternal: excludes prompthealth.ca + all subdomains (fix M5). */
  isExternal(url: string | null | undefined): boolean {
    if (!url) return false;
    try {
      const u = new URL(url.startsWith('http') ? url : `http://${url}`);
      const host = u.hostname;
      return !PH_HOSTS.includes(host) && !host.endsWith('.prompthealth.ca');
    } catch (e) {
      return false;
    }
  }

  /* Get a /out/<code> for an external URL (cached). Falls back to raw URL on error (fix M4). */
  trackedHref(url: string | null | undefined, slugType?: string): Observable<string> {
    const fallback = of(url || '');
    if (!this.isExternal(url)) {
      return fallback;
    }
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    const req = this.http.post<any>(`${API_URL}link/resolve`, { url, slugType })
      .pipe(
        map((res: any) => (res && res.data && res.data.url) ? res.data.url : (url || '')),
        catchError(() => fallback),
        shareReplay(1),
      );
    this.cache.set(url, req);
    return req;
  }
}
