import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HomeRoutingModule } from "./home-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ModalModule } from 'ngx-bootstrap/modal';
import { HomeComponent } from "../home/home.component";
import { FAQComponent } from "./faq/faq.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { TermsConditionsComponent } from "./terms-conditions/terms-conditions.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { AgmCoreModule } from '@agm/core';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { SharedModule } from '../shared/shared.module';
import { ListingCompanyComponent } from './listing-company/listing-company.component';
import { CardProductComponent } from './_elements/card-product/card-product.component';
import { InvitationComponent } from './invitation/invitation.component';
import { LandingClubhouseComponent } from './landing-clubhouse/landing-clubhouse.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LandingAmbassadorComponent } from './landing-ambassador/landing-ambassador.component';
import { ListingcompareComponent } from "./listingcompare/listingcompare.component";
import { PersonalMatchCategoryComponent } from "./personal-match-category/personal-match-category.component";
import { PersonalMatchHealthComponent } from "./personal-match-health/personal-match-health.component";
import { PersonalMatchAgeComponent } from "./personal-match-age/personal-match-age.component";
import { PersonalMatchComponent } from "./personal-match/personal-match.component";
import { PersonalMatchGenderComponent } from "./personal-match-gender/personal-match-gender.component";
import { AuthModule } from "../auth/auth.module";
import { SitemapComponent } from './sitemap/sitemap.component';
import { CardTestimonialComponent } from './_elements/card-testimonial/card-testimonial.component';
import { ExpertFinderComponent } from './expert-finder/expert-finder.component';
import { AboutComponent } from './about/about.component';
import { AboutPractitionerComponent } from './about-practitioner/about-practitioner.component';
import { ScrollIndicatorComponent } from './_elements/scroll-indicator/scroll-indicator.component';
import { FaqItemComponent } from './_elements/faq-item/faq-item.component';
import { TablePlanFeatureComponent } from './_elements/table-plan-feature/table-plan-feature.component';
import { AboutCompanyComponent } from './about-company/about-company.component';
import { TagProviderComponent } from './tag-provider/tag-provider.component';
import { AboutPartnerComponent } from './about-partner/about-partner.component';
import { ButtonsModule } from "../buttons/buttons.module";
import { PressReleaseComponent } from "./press-release/press-release.component";
import { TestimonialComponent } from './testimonial/testimonial.component';
import { OnlineAcademyComponent } from './online-academy/online-academy.component';


@NgModule({
  declarations: [
    HomeComponent,
    FAQComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    ContactUsComponent,
    UnsubscribeComponent,
    ListingCompanyComponent,
    CardProductComponent,
    InvitationComponent,
    LandingClubhouseComponent,
    NotFoundComponent,
    LandingAmbassadorComponent,
    ListingcompareComponent,
    PersonalMatchComponent,
    PersonalMatchGenderComponent,
    PersonalMatchAgeComponent,
    PersonalMatchHealthComponent,
    PersonalMatchCategoryComponent,
    SitemapComponent,
    CardTestimonialComponent,
    ExpertFinderComponent,
    AboutComponent,
    AboutPractitionerComponent,
    ScrollIndicatorComponent,
    FaqItemComponent,
    TablePlanFeatureComponent,
    AboutCompanyComponent,
    TagProviderComponent,
    AboutPartnerComponent,
    PressReleaseComponent,
    TestimonialComponent,
    OnlineAcademyComponent,
  ],
  imports: [
    FormsModule,
    NgxSpinnerModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCEn-p_qT9RNRn2qwRvIyUwfaWD09xDhkI',
      libraries: ['places']
    }),
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    ButtonsModule,
    AuthModule,
    ModalModule.forRoot(),
  ],

  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class HomeModule { }
