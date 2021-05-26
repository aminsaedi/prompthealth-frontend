import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
// import { HomeComponent } from "./home.component";
import { FAQComponent } from "./faq/faq.component";
// import { MapComponent } from "./map/map.component";
// import { ProfessionalRegisterComponent } from '../dashboard/professional-register/professional-register.component';
import { PricvacyPolicyComponent } from "./pricvacy-policy/pricvacy-policy.component";
import { TermsConditionsComponent } from "./terms-conditions/terms-conditions.component";
import { LoyalityProgramsComponent } from "./loyality-programs/loyality-programs.component";
import { ContactUsComponent } from './contact-us/contact-us.component';
// import { ClientComponent } from './client/client.component';
// import { ProffesionalComponent } from './proffesional/proffesional.component';
// import { EnterpriceComponent } from './enterprice/enterprice.component';
// import { DoctorFilterComponent } from './doctor-filter/doctor-filter.component';
// import { AffiliateComponent } from './affiliate/affiliate.component';
import { BlogComponent } from './blog/blog.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { BlogCategoryComponent } from './blog-category/blog-category.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { subscriptionPlanProductComponent } from "./subscription-plan-product/subscription-plan-product.component";
import { ProfilePartnerComponent } from './profile-partner/profile-partner.component';
import { ListingProductComponent } from './listing-product/listing-product.component';
import { InvitationComponent } from './invitation/invitation.component';
import { LandingClubhouseComponent } from "./landing-clubhouse/landing-clubhouse.component";
import { NotFoundComponent } from './not-found/not-found.component';
import { LandingAmbassadorComponent } from "./landing-ambassador/landing-ambassador.component";
import { AmbassadorProgramGuardGuard } from "./ambassador-program-guard.guard";
import { DetailComponent } from "./detail/detail.component";
import { ListingComponent } from "./listing/listing.component";
import { ListingcompareComponent } from "./listingcompare/listingcompare.component";
import { UserQuestionaireComponent } from "./user-questionaire/user-questionaire.component";
import { UserQuestionnaireItemGenderComponent } from "./user-questionnaire-item-gender/user-questionnaire-item-gender.component";
import { UserQuestionnaireItemSelectComponent } from "./user-questionnaire-item-select/user-questionnaire-item-select.component";
import { UserQuestionnaireItemBackgroundComponent } from "./user-questionnaire-item-background/user-questionnaire-item-background.component";
import { UserQuestionnaireItemSelectMultipleComponent } from "./user-questionnaire-item-select-multiple/user-questionnaire-item-select-multiple.component";
import { SubscriptionPlanComponent } from "./subscription-plan/subscription-plan.component";
import { SitemapComponent } from "./sitemap/sitemap.component";

const routes: Routes = [
  // {
  //   path: "home",
  //   component: HomeComponent
  // },
  {
    path: "faq",
    component: FAQComponent
  },
  {
    path: "subscribe-email",
    component: SubscriptionComponent
  },
  // {
  //   path: "map",
  //   component: MapComponent
  // },
  {
    path: "policy",
    component: PricvacyPolicyComponent
  },
  {
    path: "terms",
    component: TermsConditionsComponent
  },
  { path: 'termConditions', redirectTo: '/terms'},

  // {
  //   path: "loyalty",
  //   component: LoyalityProgramsComponent
  // },
  {
    path: "blogs",
    component: BlogComponent
  },
  {
    path: "blogs/category/:id",
    component: BlogCategoryComponent
  },
  { path: 'blogs/category', redirectTo: '/blogs'},

  {
    path: "blogs/:id",
    component: BlogDetailComponent
  },
  { path: 'blog-detail/:id', redirectTo: '/blogs/:id'}, /** this id is not objectId. it's slug */
  { path: 'blog-category/:id', redirectTo: '/blogs/category/:id'},

  {
    path: "contact-us",
    component: ContactUsComponent
  },
  // {
  //   path: "client",
  //   component: ClientComponent
  // },
  // {
  //   path: "professional",
  //   component: ProffesionalComponent
  // },
  // {
  //   path: "enterprise",
  //   component: EnterpriceComponent
  // },
  // {
  //   path:'doctor-filter',
  //   component: DoctorFilterComponent
  // },
  // {
  //   path:'affiliate',
  //   component: AffiliateComponent
  // },
  {
    path:'unsubscribe/:email',
    component: UnsubscribeComponent
  },
  { path: 'unsubscribe', redirectTo: '/'},

  { path: 'plans', component: SubscriptionPlanComponent },
  { path: 'plans/product', component: subscriptionPlanProductComponent },
  { path: 'subscriptionplan', redirectTo: '/plans'},

  { path: 'practitioners', component: ListingComponent },
  { path: 'practitioners/category/:categoryId', component: ListingComponent },
  { path: 'practitioners/category/:categoryId/:city', component: ListingComponent },
  { path: 'practitioners/type/:typeOfProviderId', component: ListingComponent },
  { path: 'practitioners/type/:typeOfProviderId/:city', component: ListingComponent },
  { path: 'practitioners/area/:city', component: ListingComponent },

  { path: 'practitioners/category', redirectTo: 'practitioners'},
  { path: 'practitioners/type', redirectTo: 'practitioners' },
  { path: 'practitioners/area', redirectTo: 'practitioners' },
  

  { path: 'practitioners/:id', component: DetailComponent }, 
  { path: 'compare-practitioners', component: ListingcompareComponent},

  {
    path: 'personal-match',
    component: UserQuestionaireComponent, children: [
    { path: 'gender', component: UserQuestionnaireItemGenderComponent, data: {index: 0} },
    { path: 'age', component: UserQuestionnaireItemSelectComponent, data: {index: 1, q: 'age' } },
    { path: 'background', component: UserQuestionnaireItemBackgroundComponent, data: {index: 2} },
    { path: 'goal', component: UserQuestionnaireItemSelectMultipleComponent, data: {index: 3, q: 'goal'} },
    { path: '**', redirectTo: 'gender' },
  ]},

  { path: 'products', component: ListingProductComponent, },
  { path: 'products/:id', component: ProfilePartnerComponent },
  { path: 'partners/:id', redirectTo: '/products/:id'},

  { path: 'invitation', component: InvitationComponent }, /** invitation for webinars */
  { path: 'invitation/:id', component: LandingAmbassadorComponent, data: {type: 'client'}}, /** invitation for clients by ambassador */
  { path: 'clubhouse', component: LandingClubhouseComponent },
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
