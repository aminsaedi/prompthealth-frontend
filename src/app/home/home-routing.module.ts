import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FAQComponent } from "./faq/faq.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { TermsConditionsComponent } from "./terms-conditions/terms-conditions.component";
import { MedicalDisclaimerComponent } from "./medical-disclaimer/medical-disclaimer.component";
import { ContactUsComponent } from './contact-us/contact-us.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { ListingCompanyComponent } from './listing-company/listing-company.component';
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
import { TagProviderComponent } from "./tag-provider/tag-provider.component";
import { AboutPartnerComponent } from "./about-partner/about-partner.component";
import { PressReleaseComponent } from "./press-release/press-release.component";
import { OnlineAcademyComponent } from "./online-academy/online-academy.component";
import { TestimonialComponent } from "./testimonial/testimonial.component";
import { HomeComponent } from "./home.component";
import { ForPractitionersComponent } from "./for-practitioners/for-practitioners.component";
import { CitiesHubComponent } from "./cities-hub/cities-hub.component";
import { EditorialStandardsComponent } from "./editorial-standards/editorial-standards.component";
import { GrowthLandingComponent } from "./growth-landing/growth-landing.component";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'for-practitioners',
    component: ForPractitionersComponent,
  },
  /* Growth landings render from a config named by `landing` (see
   * growth-landing/landings). growthLanding marks the route for the site
   * header, which should not offer the page a reader is already on. */
  { path: 'for-dentists', component: GrowthLandingComponent, data: { landing: 'dentists', growthLanding: true } },
  {
    path: "faq",
    component: FAQComponent
  },
  { path: "policy", component: PrivacyPolicyComponent },
  { path: "privacy", redirectTo: '/policy' },
  { path: "privacy-policy", redirectTo: '/policy' },

  { path: "terms",  component: TermsConditionsComponent },
  { path: 'termConditions', redirectTo: '/terms'},
  { path: 'terms-of-service', redirectTo: '/terms' },
  { path: 'terms-and-conditions', redirectTo: '/terms' },

  { path: 'medical-disclaimer', component: MedicalDisclaimerComponent },
  { path: 'disclaimer', redirectTo: '/medical-disclaimer' },

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
  { path: 'about/editorial-standards', component: EditorialStandardsComponent },
  { path: 'about/partner', component: AboutPartnerComponent, },

  { path: 'plans', component: AboutPractitionerComponent },
  /* The company plans page is retired: companies are set up after a
   * conversation, not a checkout. server.ts answers a request for it with a
   * 301 before any render; this covers a link followed inside the app.
   * pathMatch 'full' so it matches this address and nothing under it. */
  { path: 'plans/product', redirectTo: '/contact-us', pathMatch: 'full' },
  { path: 'subscriptionplan', redirectTo: '/plans'},

  { path: 'testimonial', component: TestimonialComponent, },

  { path: 'practitioners', component: ExpertFinderComponent },
  { path: 'practitioners/cities', component: CitiesHubComponent },
  { path: 'practitioners/category/:categorySlug', component: ExpertFinderComponent },
  { path: 'practitioners/category/:categorySlug/:city', component: ExpertFinderComponent },
  { path: 'practitioners/type/:typeOfProviderSlug', component: ExpertFinderComponent },
  { path: 'practitioners/type/:typeOfProviderSlug/:city', component: ExpertFinderComponent },
  { path: 'practitioners/area/:city', component: ExpertFinderComponent },
  { path: 'practitioners/area/:city/type/:typeOfProviderSlug', component: ExpertFinderComponent, data: { routeType: 'area-type' } },
  { path: 'practitioners/area/:city/category/:categorySlug', component: ExpertFinderComponent, data: { routeType: 'area-category' } },

  { path: 'practitioners/category', redirectTo: 'practitioners'},
  { path: 'practitioners/type', redirectTo: 'practitioners' },
  { path: 'practitioners/area', redirectTo: 'practitioners' },
  
  {path: 'practitioners/:practitionerSlug', redirectTo: '/community/profile/s/:practitionerSlug'},
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
  { path: 'online-academy', component: OnlineAcademyComponent, },

  /* The 2021 webinar coupon landing. Plans are no longer sold online, so its
   * offer could not be honoured, and it read localStorage bare, which threw
   * during every server render. Old links go to the plans page; server.ts
   * answers the same with a 301 before any render. pathMatch 'full' keeps
   * /invitation/:id, the ambassador's client invitation below, out of it: a
   * prefix match would swallow it. */
  { path: 'invitation', redirectTo: '/plans', pathMatch: 'full' },
  { path: 'invitation/:id', component: LandingAmbassadorComponent, data: {type: 'client'}}, /** invitation for clients by ambassador */
  { path: 'join-team/:id', component: TagProviderComponent },

  { path: 'subscribe/newsletter', component: LandingClubhouseComponent },
  { path: 'subscribe', redirectTo: '/subscribe/newsletter'},
  /* The newsletter page's old address. A stray comma (2021-09) pointed this at a
   * URL no route matches. After an absolute redirect Angular applies no more
   * redirects, so '**' never caught it. Every server render of this URL hung
   * until nginx gave up, and took www down with it. server.ts now answers it
   * with a 301 before any render; this covers a link followed inside the app. */
  { path: 'subscribe-email', redirectTo: '/subscribe/newsletter' },
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
