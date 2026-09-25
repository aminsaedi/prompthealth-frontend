import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser, Location } from '@angular/common';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/* The check every page load makes of a stored session
 * (ProfileManagementService.getProfileDetail). When it fails the reader is
 * signed out and stays on the page they opened, as a reader who never signed
 * in would; only a request they made themselves takes them to log in. */
const SESSION_CHECK = /\/user\/get-profile\/?$/;

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private location: Location,
        @Inject(PLATFORM_ID) private platformId: Object,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
            /* A browser check, not typeof window: the server defines window
             * and has no localStorage. */
            if (err.status === 401 && isPlatformBrowser(this.platformId)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                /* To the login page, with the page to come back to. This sent
                 * readers to /auth/signin, which no route matches, so a session
                 * that had expired ended on the 404 page, and a booking request
                 * sent with one (POST /booking/create needs a session) lost the
                 * reader's place with it. Not from an /auth page itself, which
                 * would only point the login back at the login. */
                if (!SESSION_CHECK.test(request.url)) {
                    const here = this.location.path();
                    const next = here && !/^\/auth(\/|\?|$)/.test(here) ? { next: here } : {};
                    this.router.navigate(['/auth/login'], { queryParams: next });
                }
            }

            const error = err.error?.message || err.message || 'An unexpected error occurred';
            return throwError(error);
        }));
    }
}
