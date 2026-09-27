import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
} from 'angularx-social-login';


import { SharedModule } from '../shared/shared.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegistrationComponent } from './registration/registration.component';
import { EnterpriseContactComponent } from './enterprise-contact/enterprise-contact.component';
import { FormAuthComponent } from './form-auth/form-auth.component';
import { AuthComponent } from './auth/auth.component';
import { environment } from 'src/environments/environment';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
// import { AppleLoginProvider } from './apple.provider';
// import { environment } from 'src/environments/environment';

/*
 * The sign-in providers exist in the browser only. SocialAuthService starts
 * every provider as soon as a page with the sign-in form is created, and on the
 * server that page is created for every render. The Google provider appended
 * apis.google.com/js/platform.js to the server's shared stand-in document and
 * waited for a load event that never comes; the waiting promise held that
 * render's zone, and through it the whole rendered app. Every such render
 * stayed in memory, and the server ran out of heap about every three and a half
 * hours (19 restarts from 2026-09-25 to 09-27). The server never signs anyone
 * in, so it gets no providers at all.
 */
export function socialAuthConfig(platformId: object): SocialAuthServiceConfig {
  return {
    autoLogin: false,
    providers: isPlatformBrowser(platformId) ? [
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider(
          environment.config.GOOGLE_CLIENT_ID
        ),
      },
      {
        id: FacebookLoginProvider.PROVIDER_ID,
        provider: new FacebookLoginProvider(environment.config.FACEBOOK_APP_ID),
      },
    ] : [],
  };
}

const routes: Routes = [

  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'reset-password', redirectTo: '/'},
  
  { path: 'forgot-password', component: ForgotPasswordComponent },

  { path: 'registration/:type', component: AuthComponent, canActivate: [AuthGuard], data: {authType: 'signup'}, },
  { path: 'registration', redirectTo: 'registration/u' },
  
  { path: 'login', component: AuthComponent, canActivate: [AuthGuard], data: {authType: 'signin'}},
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    SocialLoginModule,
    AngularFireModule.initializeApp(environment.config.firebase),
    AngularFireMessagingModule,
  ],
  declarations: [
    ForgotPasswordComponent,
    RegistrationComponent,
    EnterpriseContactComponent,
    FormAuthComponent,
    AuthComponent,
    ResetPasswordComponent,
  ],
  exports: [FormAuthComponent],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useFactory: socialAuthConfig,
      deps: [PLATFORM_ID],
    },
  ],
})
export class AuthModule { }
