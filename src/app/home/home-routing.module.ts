import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FAQComponent } from "./faq/faq.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { TermsConditionsComponent } from "./terms-conditions/terms-conditions.component";
import { ContactUsComponent } from './contact-us/contact-us.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { ListingCompanyComponent } from './listing-company/listing-company.component';
import { InvitationComponent } from './invitation/invitation.component';
import { LandingClubhouseComponent } from "./landing-clubhouse/landing-clubhouse.component";
import { NotFoundComponent } from './not-found/not-found.component';
import { LandingAmbassadorComponent } from "./landing-ambassador/landing-ambassador.component";
import { AmbassadorProgramGuardGuard } from "./ambassador-program-guard.guard";
import { ListingcompareComponent } from "./listingcompare/listingcompare.component";
import { PersonalMatchComponent } from "./personal-match/personal-match.component";
import { PersonalMatchGenderComponent } from "./personal-match-gender/personal-match-gender.component";
import { PersonalMatchAgeComponent } from "./personal-match-age/personal-match-age.component";
import { PersonalMatchHealthComponent } from "./personal-match-health/personal-match-health.component";
import { PersonalMatchCategoryComponent } from "./personal-match-category/personal-match-category.component";
import { SitemapComponent } from "./sitemap/sitemap.component";
import { ExpertFinderComponent } from "./expert-finder/expert-finder.component";
import { AboutComponent } from "./about/about.component";
import { AboutPractitionerComponent } from "./about-practitioner/about-practitioner.component";
import { AboutCompanyComponent } from "./about-company/about-company.component";
import { TagProviderComponent } from "./tag-provider/tag-provider.component";
import { AboutPartnerComponent } from "./about-partner/about-partner.component";
import { PressReleaseComponent } from "./press-release/press-release.component";
import { TestimonialComponent } from "./testimonial/testimonial.component";

const routes: Routes = [
  {
    path: "faq",
    component: FAQComponent
  },
  { path: "policy", component: PrivacyPolicyComponent },
  { path: "privacy", redirectTo: '/policy' },

  { path: "terms",  component: TermsConditionsComponent },
  { path: 'termConditions', redirectTo: '/terms'},

  {
    path: "contact-us",
    component: ContactUsComponent
  },
  {
    path:'unsubscribe/:email',
    component: UnsubscribeComponent
  },
  { path: 'unsubscribe', redirectTo: '/'},

  { path: 'about', component: AboutComponent },
  { path: 'about/partner', component: AboutPartnerComponent, },

  { path: 'plans', component: AboutPractitionerComponent },
  { path: 'plans/product', component: AboutCompanyComponent },
  { path: 'subscriptionplan', redirectTo: '/plans'},

  { path: 'testimonial', component: TestimonialComponent, },

  { path: 'practitioners', component: ExpertFinderComponent },
  { path: 'practitioners/category/:categoryId', component: ExpertFinderComponent },
  { path: 'practitioners/category/:categoryId/:city', component: ExpertFinderComponent },
  { path: 'practitioners/type/:typeOfProviderId', component: ExpertFinderComponent },
  { path: 'practitioners/type/:typeOfProviderId/:city', component: ExpertFinderComponent },
  { path: 'practitioners/area/:city', component: ExpertFinderComponent },

  { path: 'practitioners/category', redirectTo: 'practitioners'},
  { path: 'practitioners/type', redirectTo: 'practitioners' },
  { path: 'practitioners/area', redirectTo: 'practitioners' },
  
  {path: 'practitioners/:id', redirectTo: '/community/profile/:id'},
  { path: 'compare-practitioners', component: ListingcompareComponent},

  {
    path: 'personal-match',
    component: PersonalMatchComponent, children: [
    { path: 'gender', component: PersonalMatchGenderComponent, data: {index: 0} },
    { path: 'age', component: PersonalMatchAgeComponent, data: {index: 1, q: 'age' } },
    { path: 'background', component: PersonalMatchHealthComponent, data: {index: 2} },
    { path: 'goal', component: PersonalMatchCategoryComponent, data: {index: 3, q: 'goal'} },
    { path: '**', redirectTo: 'gender' },
  ]},

  { path: 'companies', component: ListingCompanyComponent, },
  { path: 'partners/:id', redirectTo: '/community/profile/:id'},
  { path: 'products/:id', redirectTo: '/community/profile/:id'},
  { path: 'products', redirectTo: 'companies'},

  { path: 'press-release', component: PressReleaseComponent, },

  { path: 'invitation', component: InvitationComponent }, /** invitation for webinars */
  { path: 'invitation/:id', component: LandingAmbassadorComponent, data: {type: 'client'}}, /** invitation for clients by ambassador */
  { path: 'join-team/:id', component: TagProviderComponent },

  { path: 'subscribe/newsletter', component: LandingClubhouseComponent },
  { path: 'subscribe', redirectTo: '/subscribe/newsletter'},
  { path: 'subscribe-email', redirectTo: '/subscribe/newslet,ter'},
  { path: 'clubhouse', redirectTo: '/subscribe/newsletter' },
  { 
    path: 'ambassador-program', 
    component: LandingAmbassadorComponent, 
    data: {type: 'provider'},
    canActivate: [AmbassadorProgramGuardGuard],
  },
  { path: 'sitemaps', component: SitemapComponent},
  { path: '404', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
