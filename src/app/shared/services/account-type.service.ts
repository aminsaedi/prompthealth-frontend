import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UniversalService } from './universal.service';

const API_URL = environment.config.API_URL;

/* Words that, in a patient's own name, suggest a practice rather than a
 * person: "Wise Mind Centre", "Roseland Dental", "Vive Wellness Therapy"
 * were all patient accounts (Hedieh's brief of 2026-10-22, step 6). A
 * heuristic only. It decides whether to ask, never whether to allow. */
const BUSINESS_WORDS = /\b(clinic|clinics|centre|center|dental|dentistry|physio|physiotherapy|chiropractic|wellness|therapy|psychology|counselling|counseling|massage|health|inc|ltd)\b/i;

export function looksLikeBusiness(...texts: string[]): boolean {
  return texts.some(text => BUSINESS_WORDS.test(String(text || '')));
}

/*
 * Turning a patient account into a practitioner or clinic account
 * (POST /user/switch-to-provider). Bypasses the app's interceptors, as
 * ProService does, so a refusal arrives with the server's own words rather
 * than as a bare string, and a 401 is shown rather than answered with a
 * redirect.
 */
@Injectable({ providedIn: 'root' })
export class AccountTypeService {
  private readonly http: HttpClient;

  constructor(httpBackend: HttpBackend, private _uService: UniversalService) {
    this.http = new HttpClient(httpBackend);
  }

  switchToProvider(role: 'SP' | 'C', typeOfProvider?: string): Observable<{ roles: string }> {
    const token = this._uService.isBrowser ? this._uService.localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: token }) : new HttpHeaders();
    const body: any = { role };
    if (typeOfProvider) { body.typeOfProvider = typeOfProvider; }
    return this.http.post<any>(API_URL + 'user/switch-to-provider', body, { headers }).pipe(
      map(res => {
        if (!res || res.statusCode !== 200) {
          throw { message: res && typeof res.message === 'string' ? res.message : '' };
        }
        const roles = res.data && typeof res.data.roles === 'string' ? res.data.roles : role;
        return { roles };
      }),
      catchError((error: HttpErrorResponse | { message: string }) => {
        const body = error instanceof HttpErrorResponse ? error.error : error;
        throw { message: body && typeof body.message === 'string' ? body.message : '' };
      }),
    );
  }
}
