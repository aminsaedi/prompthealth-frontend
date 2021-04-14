import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { HomeRoutingModule } from "./home-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HomeComponent } from "../home/home.component";
import { FAQComponent } from "./faq/faq.component";
import { PricvacyPolicyComponent } from "./pricvacy-policy/pricvacy-policy.component";
import { TermsConditionsComponent } from "./terms-conditions/terms-conditions.component";
import { LoyalityProgramsComponent } from "./loyality-programs/loyality-programs.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { ClientComponent } from "./client/client.component";
import { ProffesionalComponent } from "./proffesional/proffesional.component";
import { EnterpriceComponent } from "./enterprice/enterprice.component";
import { MapComponent } from "./map/map.component";
// import { ProfessionalRegisterComponent } from '../dashboard/professional-register/professional-register.component';

import { AgmCoreModule } from '@agm/core';
import { DoctorFilterComponent } from './doctor-filter/doctor-filter.component';
import { AffiliateComponent } from './affiliate/affiliate.component';
import { BlogComponent } from './blog/blog.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { BlogCategoryComponent } from './blog-category/blog-category.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { SubscriptionPlanPartnerComponent } from './subscription-plan-partner/subscription-plan-partner.component';
import { SharedModule } from '../shared/shared.module'; 
import { NgxSocialShareModule } from 'ngx-social-share';
import { GetFeaturedTabComponent } from './get-featured-tab/get-featured-tab.component';
import { ProfilePartnerComponent } from './profile-partner/profile-partner.component';
import { ListingPartnerComponent } from './listing-partner/listing-partner.component';
import { CardPartnerComponent } from './card-partner/card-partner.component';
import { InvitationComponent } from './invitation/invitation.component';


@NgModule({
  declarations: [
    HomeComponent,
    FAQComponent,
    PricvacyPolicyComponent,
    TermsConditionsComponent,
    LoyalityProgramsComponent,
    ContactUsComponent,
    ClientComponent,
    ProffesionalComponent,
    EnterpriceComponent,
    MapComponent,
    DoctorFilterComponent,
    AffiliateComponent,
    BlogComponent,
    BlogDetailComponent,
    BlogCategoryComponent,
    SubscriptionComponent,
    UnsubscribeComponent,
    SubscriptionPlanPartnerComponent,
    GetFeaturedTabComponent,
    ProfilePartnerComponent,
    ListingPartnerComponent,
    CardPartnerComponent,
    InvitationComponent,
    // ProfessionalRegisterComponent
  ],
  imports: [
    FormsModule,
    NgxSpinnerModule,
    AutocompleteLibModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCbRhC6h9Pp43-5t_Knyrd_ewAdLMIJtCg',
      libraries: ['places']
    }),
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    NgxSocialShareModule,
    SharedModule,
  ],

  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class HomeModule { }
