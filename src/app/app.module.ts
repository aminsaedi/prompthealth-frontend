import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { Router, NavigationEnd, NavigationError } from '@angular/router';
import { filter, take } from 'rxjs/operators';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorService } from './shared/services/behavior.service';
import { CanonicalLinkService } from './shared/services/link.service';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorInterceptor } from './shared/services/error.interceptor';
import { SharedCoreModule } from './shared/shared-core.module';
import { SharedService } from './shared/services/shared.service';
import { PreviousRouteService } from './shared/services/previousUrl.service';
import { CategoryService } from './shared/services/category.service';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';

/* With initialNavigation 'enabled', Angular 9 holds bootstrap until the first
 * navigation reaches its preactivation hook. One that fails earlier never does:
 * a redirect to a URL no route matches (/subscribe-email pointed at one for five
 * years), or a path with a parenthesised outlet group like GPTBot's
 * /(data:image/...). The server render then never finished, nginx gave up at
 * 60 s and answered 502 for every page for ten seconds, and a browser showed a
 * blank page. Sending that first failure to /404 lets bootstrap finish, and the
 * Not Found title makes server.ts answer 404.
 *
 * The first navigation to end or fail is the one watched, not the first to be
 * cancelled: a guard that redirects cancels the navigation and starts another,
 * and that one can fail the same way. One recovery only, so a /404 that failed
 * too cannot loop. replaceUrl, because the router has already put '/' in place
 * of the failed address and a second history entry would be one the reader
 * never chose.
 *
 * The subscription is in place in time because every initializer runs
 * synchronously, and the router's own starts the first navigation only after
 * the LOCATION_INITIALIZED promise, a microtask later. The navigation is
 * deferred by a microtask too, so it is not scheduled from inside the pipeline
 * that is still reporting the failure. */
export function recoverFirstNavigation(injector: Injector) {
  return () => {
    const router = injector.get(Router);
    router.events.pipe(
      filter(e => e instanceof NavigationEnd || e instanceof NavigationError),
      take(1),
      filter(e => e instanceof NavigationError),
    ).subscribe(() => {
      Promise.resolve().then(() => router.navigateByUrl('/404', { replaceUrl: true }));
    });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    SharedCoreModule,
    AngularFireModule.initializeApp(environment.config.firebase),
  ],
  providers: [
    BehaviorService,
    CookieService,
    SharedService,
    PreviousRouteService,
    CategoryService,
    CanonicalLinkService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: recoverFirstNavigation, deps: [Injector], multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
