import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { AgmCoreModule } from '@agm/core';
import { NgxStripeModule } from 'ngx-stripe';
import { ThemeRoutingModule } from './theme-routing.module';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout/layout.component';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AuthService } from '../auth/auth.service';
import { AuthGuardService } from '../auth/auth-gaurd.service';
import { RoleGuardService } from '../auth/role-guard.service';
import { ThankuPageComponent } from './thanku-page/thanku-page.component';
import { environment } from 'src/environments/environment';
import { DashboardMenuComponent } from './dashboard-menu/dashboard-menu.component';
import { BannerTopComponent } from './banner-top/banner-top.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    SubscribeComponent,
    ThankuPageComponent,
    DashboardMenuComponent,
    BannerTopComponent,
  ],
  providers: [
    AuthService,
    AuthGuardService,
    RoleGuardService,
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCEn-p_qT9RNRn2qwRvIyUwfaWD09xDhkI',
      libraries: ['places']
    }),
    GooglePlaceModule,
    CommonModule,
    ThemeRoutingModule,
    ReactiveFormsModule,
    NgxStripeModule.forRoot(environment.config.stripeKey),
    SharedModule,
    // FlashMessagesModule,
    FormsModule,
    ModalModule.forRoot()
  ]
})
export class ThemeModule { }
