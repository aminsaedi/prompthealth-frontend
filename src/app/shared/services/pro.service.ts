import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UniversalService } from './universal.service';

const API_URL = environment.config.API_URL;

export type ProInterval = 'month' | 'year';

export interface IProMembership {
  status: 'none' | 'incomplete' | 'active' | 'past_due' | 'canceled';
  isPro: boolean;
  interval?: '' | ProInterval;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  teamEmails: string[];
  teamLimit: number;
}

export interface IProLibraryItem {
  slug?: string;
  title: string;
  kind: string;
  summary?: string;
  videoId?: string;
  publishedAt: string;
}

export interface IProDrop extends IProLibraryItem {
  body: string;
  status?: string;
  version?: number;
}

/* Thrown with what the API said, so a page can show the refusal's own words
 * ("PromptHealth Pro is coming soon", "already on Pro"). */
export interface IProError {
  status: number;
  code: string;
  message: string;
}

export const PRO_KIND_LABELS: { [kind: string]: string } = {
  weekly: "This week's ideas",
  trend: 'Trend alert',
  monthly: "What's working now",
  live: 'Live session recording',
  other: 'PromptHealth Pro',
};

/*
 * PromptHealth Pro's API (ph-backend api/v1/pro).
 *
 * Bypasses the app's interceptors, as the booking form does: the global one
 * turns errors into a bare string, which hides the status and code these pages
 * act on, and answers a 401 by sending the reader to sign in, which a public
 * page like /pro must never do on its own. The session token goes on by hand.
 */
@Injectable({ providedIn: 'root' })
export class ProService {
  private readonly http: HttpClient;
  private config$: Observable<{ paymentsEnabled: boolean }> = null;

  constructor(httpBackend: HttpBackend, private _uService: UniversalService) {
    this.http = new HttpClient(httpBackend);
  }

  private headers(): HttpHeaders {
    const token = this._uService.isBrowser ? this._uService.localStorage.getItem('token') : null;
    return token ? new HttpHeaders({ Authorization: token }) : new HttpHeaders();
  }

  private unwrap<T>(source: Observable<any>): Observable<T> {
    return source.pipe(
      map(res => res && res.data as T),
      catchError((error: HttpErrorResponse) => {
        const body = error && error.error;
        throw {
          status: error ? error.status : 0,
          code: body && typeof body.errorCode === 'string' ? body.errorCode : '',
          message: body && typeof body.message === 'string' ? body.message : '',
        } as IProError;
      }),
    );
  }

  /* Closed unless the API says open: a failure must show "Coming soon", never
   * a button that cannot take a payment. Cached for the page's life; a reload
   * reads it again. */
  config(): Observable<{ paymentsEnabled: boolean }> {
    if (!this.config$) {
      this.config$ = this.http.get<any>(API_URL + 'pro/config').pipe(
        map(res => ({ paymentsEnabled: !!(res && res.data && res.data.paymentsEnabled) })),
        catchError(() => of({ paymentsEnabled: false })),
        shareReplay(1),
      );
    }
    return this.config$;
  }

  me(): Observable<IProMembership> {
    return this.unwrap(this.http.get(API_URL + 'pro/me', { headers: this.headers() }));
  }

  checkout(interval: ProInterval): Observable<{ url: string }> {
    return this.unwrap(this.http.post(API_URL + 'pro/checkout', { interval }, { headers: this.headers() }));
  }

  confirm(sessionId: string): Observable<IProMembership> {
    return this.unwrap(this.http.post(API_URL + 'pro/checkout/confirm', { sessionId }, { headers: this.headers() }));
  }

  portal(): Observable<{ url: string }> {
    return this.unwrap(this.http.post(API_URL + 'pro/portal', {}, { headers: this.headers() }));
  }

  setTeam(emails: string[]): Observable<IProMembership> {
    return this.unwrap(this.http.put(API_URL + 'pro/team', { emails }, { headers: this.headers() }));
  }

  library(): Observable<{ isMember: boolean; items: IProLibraryItem[] }> {
    return this.unwrap(this.http.get(API_URL + 'pro/library', { headers: this.headers() }));
  }

  item(slug: string): Observable<IProDrop> {
    return this.unwrap(this.http.get(API_URL + 'pro/library/' + encodeURIComponent(slug), { headers: this.headers() }));
  }

  preview(token: string): Observable<IProDrop> {
    return this.unwrap(this.http.get(API_URL + 'pro/preview/' + encodeURIComponent(token)));
  }
}
