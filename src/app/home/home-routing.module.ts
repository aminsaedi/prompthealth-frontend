import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home.component";
import { FAQComponent } from "./faq/faq.component";
import { MapComponent } from "./map/map.component";
// import { ProfessionalRegisterComponent } from '../dashboard/professional-register/professional-register.component';
import { PricvacyPolicyComponent } from "./pricvacy-policy/pricvacy-policy.component";
import { TermsConditionsComponent } from "./terms-conditions/terms-conditions.component";
import { LoyalityProgramsComponent } from "./loyality-programs/loyality-programs.component";
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ClientComponent } from './client/client.component';
import { ProffesionalComponent } from './proffesional/proffesional.component';
import { EnterpriceComponent } from './enterprice/enterprice.component';
import { DoctorFilterComponent } from './doctor-filter/doctor-filter.component';
import { AffiliateComponent } from './affiliate/affiliate.component';
import { BlogComponent } from './blog/blog.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { BlogCategoryComponent } from './blog-category/blog-category.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { SubscriptionPlanPartnerComponent } from "./subscription-plan-partner/subscription-plan-partner.component";
import { ProfilePartnerComponent } from './profile-partner/profile-partner.component';
import { ListingProductComponent } from './listing-product/listing-product.component';
import { InvitationComponent } from './invitation/invitation.component';
import { LandingClubhouseComponent } from "./landing-clubhouse/landing-clubhouse.component";
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: "home",
    component: HomeComponent
  },
  {
    path: "faq",
    component: FAQComponent
  },
  {
    path: "subscription",
    component: SubscriptionComponent
  },
  {
    path: "map",
    component: MapComponent
  },
  {
    path: "policy",
    component: PricvacyPolicyComponent
  },
  {
    path: "termConditions",
    component: TermsConditionsComponent
  },
  {
    path: "loyalty",
    component: LoyalityProgramsComponent
  },
  {
    path: "blogs",
    component: BlogComponent
  },
  {
    path: "blog-detail/:id",
    component: BlogDetailComponent
  },
  {
    path: "blog-category/:id",
    component: BlogCategoryComponent
  },
  {
    path: "contact-us",
    component: ContactUsComponent
  },
  {
    path: "client",
    component: ClientComponent
  },
  {
    path: "professional",
    component: ProffesionalComponent
  },
  {
    path: "enterprise",
    component: EnterpriceComponent
  },
  {
    path:'doctor-filter',
    component: DoctorFilterComponent
  },
  {
    path:'affiliate',
    component: AffiliateComponent
  },
  {
    path:'unsubscribe/:email',
    component: UnsubscribeComponent
  },

  { path: 'plans/product', component: SubscriptionPlanPartnerComponent },
  
  { path: 'products', component: ListingProductComponent, },
  { path: 'products/:id', component: ProfilePartnerComponent },

  { path: 'invitation', component: InvitationComponent },
  { path: 'clubhouse', component: LandingClubhouseComponent },

  { path: '404', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
