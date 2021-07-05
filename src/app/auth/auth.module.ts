import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ReactiveFormsModule } from '@angular/forms';
// import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
  AmazonLoginProvider,
} from 'angularx-social-login';
// import { TooltipModule } from 'ngx-bootstrap/tooltip';
// import { ModalModule } from 'ngx-bootstrap/modal';


import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ContactUspageComponent } from './contact-uspage/contact-uspage.component';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from '../auth/login/login.component';
import { EnterpriseContactComponent } from './enterprise-contact/enterprise-contact.component';
// import { NgxCarouselModule } from 'ngx-carousel';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { FormAuthComponent } from './form-auth/form-auth.component';
// import { AppleLoginProvider } from './apple.provider';
// import { environment } from 'src/environments/environment';



@NgModule({
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    FormsModule,
    NgxSpinnerModule,
    // NgxCarouselModule,
    SlickCarouselModule,
    // NgxIntlTelInputModule,
    ReactiveFormsModule,
    SocialLoginModule,
  ],
  declarations: [
    ContactUspageComponent,
    ForgotPasswordComponent,
    LoginComponent,
    RegistrationComponent,
    EnterpriseContactComponent,
    FormAuthComponent,
  ],
  exports: [FormAuthComponent],
  providers: [{
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            '911768983583-hrth6fagg8em1oc6v6mkcv21bsoac0ar.apps.googleusercontent.com'
          ),
        },
        {
          id: FacebookLoginProvider.PROVIDER_ID,
          // provider: new FacebookLoginProvider('561602290896109'),
          provider: new FacebookLoginProvider('2053494228293760'),
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
