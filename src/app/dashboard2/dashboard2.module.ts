import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { RouterModule, Routes } from '@angular/router';
import { BaseComponent } from './base/base.component';
import { SocialItemsModule } from '../social-items/social-items.module';
import { SharedModule } from '../shared/shared.module';
import { GuardIfNotLoggedInGuard } from '../auth/guard-if-not-logged-in.guard';
import { ProfileComponent } from './profile/profile.component';
import { AgmCoreModule } from '@agm/core';
import { BookingsComponent } from './bookings/bookings.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { PasswordComponent } from './password/password.component';
import { PasswordSuccessComponent } from './password-success/password-success.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FollowListComponent } from './follow-list/follow-list.component';
import { GuardIfUserTypeClientGuard } from '../social-items/guard-if-user-type-client.guard';
import { PerformanceComponent } from './performance/performance.component';
import { CardFeatureNotEligibleComponent } from './card-feature-not-eligible/card-feature-not-eligible.component';
import { TeamComponent } from './team/team.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TeamViewerComponent } from './team-viewer/team-viewer.component';
import { TeamManagerComponent } from './team-manager/team-manager.component';
import { ShowcaseComponent } from './showcase/showcase.component';
import { ServicesManagerComponent } from './services-manager/services-manager.component';
import { BadgesComponent } from './badges/badges.component';
import { VideoManagerComponent } from './video-manager/video-manager.component';
import { SocialManagerComponent } from './social-manager/social-manager.component';
import { AffiliateComponent } from './affiliate/affiliate.component';
import { AffiliateAddComponent } from './affiliate-add/affiliate-add.component';
import { AffiliateListComponent } from './affiliate-list/affiliate-list.component';
import { PaymentComponent } from './payment/payment.component';
import { PaymentSubscriptionComponent } from './payment-subscription/payment-subscription.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { PaymentCreditComponent } from './payment-credit/payment-credit.component';
import { ButtonsModule } from '../buttons/buttons.module';


const routes: Routes = [
  { 
    path: '', component: BaseComponent, canActivate: [GuardIfNotLoggedInGuard], children: [
      { path: 'profile', component: ProfileComponent, },
      { path: 'service', component: ServicesManagerComponent, },
      { path: 'performance', component: PerformanceComponent, },
      { path: 'booking', component: BookingsComponent, data: {type: 'client'}, },
      { path: 'booking-provider', component: BookingsComponent, data: {type: 'provider'}, },
      { path: 'team', component: TeamComponent, children: [
        { path: 'list', component: TeamViewerComponent, },
        { path: 'manage', component: TeamManagerComponent, },
        { path: '', redirectTo: 'list', },
      ]},
      { path: 'follow/followings', component: FollowListComponent, data: {type: 'following'}, },
      { path: 'follow/followers', component: FollowListComponent, data: {type: 'followed'}, canActivate: [GuardIfUserTypeClientGuard]},
      { path: 'follow', redirectTo: 'follow/followings'},

      { path: 'badge', component: BadgesComponent, },
      { path: 'showcase', component: ShowcaseComponent, },
      { path: 'video', component: VideoManagerComponent, },
      { path: 'social', component: SocialManagerComponent, },

      { path: 'bookmark', component: BookmarksComponent, },
      { path: 'password', component: PasswordComponent, },

      { path: 'payment', component: PaymentComponent, children: [
        { path: 'subscription', component: PaymentSubscriptionComponent, },
        { path: 'history', component: PaymentHistoryComponent, },
        { path: 'credit', component: PaymentCreditComponent, },
        { path: '', redirectTo: 'subscription'},
      ]},

      { path: 'affiliate', component: AffiliateComponent, children: [
        { path: 'add', component: AffiliateAddComponent, },
        { path: 'list', component: AffiliateListComponent, },
        { path: '', redirectTo: 'add'},
      ]},
    ]
    
  },

  { path: 'subscriptionplan',   redirectTo: '/plans' },
  { path: 'questionnaire/u',    redirectTo: '/personal-match/gender' },
  { path: 'questions/User',     redirectTo: '/personal-match/gender' },
  { path: 'listing',            redirectTo: '/practitioners' },
  { path: 'listingCompare',     redirectTo: '/compare-practitioners' },
  { path: 'detail/:id',         redirectTo: '/practitioners/:id' },
  { path: 'register-product',   redirectTo: '/dashboard-old/register-product/general'},
  { path: 'register-partner',   redirectTo: '/dashboard-old/register-product/general' },
  { path: 'professional-info',  redirectTo: '/dashboard-old/register-practitioner/general' },
  { path: 'register-practitioner', redirectTo: '/dashboard-old/register-practitioner/general'},
  { path: 'profilemanagement', redirectTo: '/dashboard', },
]

@NgModule({
  declarations: [
    MenuComponent,
    BaseComponent,
    ProfileComponent,
    BookingsComponent,
    BookmarksComponent,
    PasswordComponent,
    PasswordSuccessComponent,
    FollowListComponent,
    PerformanceComponent,
    CardFeatureNotEligibleComponent,
    TeamComponent,
    TeamViewerComponent,
    TeamManagerComponent,
    ShowcaseComponent,
    ServicesManagerComponent,
    BadgesComponent,
    VideoManagerComponent,
    SocialManagerComponent,
    AffiliateComponent,
    AffiliateAddComponent,
    AffiliateListComponent,
    PaymentComponent,
    PaymentSubscriptionComponent,
    PaymentHistoryComponent,
    PaymentCreditComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SocialItemsModule,
    SharedModule,
    ButtonsModule,
    TabsModule.forRoot(),
    RouterModule.forChild(routes),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCEn-p_qT9RNRn2qwRvIyUwfaWD09xDhkI',
      language: 'en',
      libraries: ['places']
    }),
  ]
})
export class Dashboard2Module { }
