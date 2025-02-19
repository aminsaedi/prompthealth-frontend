import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
} from 'angularx-social-login';


import { SharedModule } from '../shared/shared.module';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ContactUspageComponent } from './contact-uspage/contact-uspage.component';
import { RegistrationComponent } from './registration/registration.component';
import { EnterpriseContactComponent } from './enterprise-contact/enterprise-contact.component';
import { FormAuthComponent } from './form-auth/form-auth.component';
import { AuthComponent } from './auth/auth.component';
import { environment } from 'src/environments/environment';
import { NgxStripeModule, StripeService } from 'ngx-stripe';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
// import { AppleLoginProvider } from './apple.provider';
// import { environment } from 'src/environments/environment';

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
    NgxStripeModule.forRoot(environment.config.stripeKey),
  ],
  declarations: [
    ContactUspageComponent,
    ForgotPasswordComponent,
    RegistrationComponent,
    EnterpriseContactComponent,
    FormAuthComponent,
    AuthComponent,
    ResetPasswordComponent,
  ],
  exports: [FormAuthComponent],
  providers: [
    StripeService, {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.config.GOOGLE_CLIENT_ID
            ),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.config.FACEBOOK_APP_ID),
          }
          // {
          //   id: AppleLoginProvider.PROVIDER_ID,
          //   provider: new AppleLoginProvider(
          //     environment.config.APPLE_CLIENT_ID
          //   ),
          // },
        ],
      } as SocialAuthServiceConfig,
    }]
})
export class AuthModule { }
