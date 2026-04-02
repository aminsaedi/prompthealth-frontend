import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.router.navigateByUrl('/auth/signin');
            }

            const error = err.error?.message || err.message || 'An unexpected error occurred';
            return throwError(error);
        }));
    }
}
