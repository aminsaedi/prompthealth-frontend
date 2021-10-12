import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
// import { SubscriptionPlanComponent } from '../home/subscription-plan/subscription-plan.component';
// import { UserDetailsComponent } from './user-details/user-details.component';
// import { SubscriptionProfessionalComponent } from './subscription-professional/subscription-professional.component';
// import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
// import { ListingComponent } from '../home/listing/listing.component';
// import { ListingcompareComponent } from '../home/listingcompare/listingcompare.component';
// import { DetailComponent } from '../home/detail/detail.component';
import { ProfileManagementModule } from './profileManagement/profile-mangement.module';
// import { ProfessionalRegisterComponent } from './professional-register/professional-register.component';
// import { ProfessionalHomeComponent } from './professional-home/professional-home.component';

// import { UserQuestionaireComponent } from '../home/user-questionaire/user-questionaire.component';
import { RegisterQuestionnaireComponent } from './register-questionnaire/register-questionnaire.component';
import { RegisterPartnerGeneralComponent } from './register-partner-general/register-partner-general.component';
import { RegisterPartnerServiceComponent } from './register-partner-service/register-partner-service.component';
import { RegisterPartnerOfferComponent } from './register-partner-offer/register-partner-offer.component';
import { RegisterPartnerTermComponent } from './register-partner-term/register-partner-term.component';
// import { RegisterQuestionnaireCompleteComponent } from './register-questionnaire-complete/register-questionnaire-complete.component';
import { RegisterQuestionnaireGuard } from './register-questionnaire.guard';
// import { RegisterQuestionnaireCompleteGuard } from './register-questionnaire-complete.guard';
import { AuthGuardService as AuthGuard } from '../auth/auth-gaurd.service';
// import { UserQuestionnaireItemSelectComponent } from './user-questionnaire-item-select/user-questionnaire-item-select.component';
// import { UserQuestionnaireItemSelectMultipleComponent } from './user-questionnaire-item-select-multiple/user-questionnaire-item-select-multiple.component';
// import { UserQuestionnaireItemGenderComponent } from './user-questionnaire-item-gender/user-questionnaire-item-gender.component';
// import { UserQuestionnaireItemBackgroundComponent } from './user-questionnaire-item-background/user-questionnaire-item-background.component';
import { RegisterPractitionerGeneralComponent } from './register-practitioner-general/register-practitioner-general.component';
import { RegisterPractitionerServiceComponent } from './register-practitioner-service/register-practitioner-service.component';
import { PostManagerModule } from '../post-manager/post-manager.module';

const routes: Routes = [
  // {
  //   path: 'subscriptionplan',
  //   component: SubscriptionPlanComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'professional',
  //   component: ProfessionalHomeComponent
  // },
  // {
  //   path: 'subscriptionplan-professional',
  //   component: SubscriptionProfessionalComponent
  // },
  // {
  //   path: 'questionnaire/:type',
  //   component: QuestionnaireComponent,
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'questionnaire/u',
  //   component: UserQuestionaireComponent,
  //   canActivate: [AuthGuard],
  //   redirectTo: 'questions/User'
  // },
  // {
    // path: 'questions/User',
    // component: UserQuestionaireComponent, children: [
    //   { path: 'gender', component: UserQuestionnaireItemGenderComponent, data: {index: 0} },
    //   { path: 'age', component: UserQuestionnaireItemSelectComponent, data: {index: 1, q: 'age' } },
    //   { path: 'background', component: UserQuestionnaireItemBackgroundComponent, data: {index: 2} },
    //   { path: 'goal', component: UserQuestionnaireItemSelectMultipleComponent, data: {index: 3, q: 'goal'} },
    //   { path: '**', redirectTo: 'gender' },
    // ],
    // canActivate: [AuthGuard]
  // },
  // {
  //   path: 'listing',
  //   component: ListingComponent
  // },
  // {
  //   path: 'listingCompare',
  //   component: ListingcompareComponent
  // },
  // {
  //   path: 'detail/:id',
  //   component: DetailComponent
  // },
  {
    path: 'profilemanagement',
    loadChildren: () => ProfileManagementModule,
    canActivate: [AuthGuard],
    // redirectTo: 'profilemanagement/my-profile'
  },
  // {
  //   path: 'professional-info',
  //   component: ProfessionalRegisterComponent
  // },
  {
    path: 'register-practitioner',
    component: RegisterQuestionnaireComponent,
    canActivate: [RegisterQuestionnaireGuard],
    data: {type: 'practitioner'},
    children: [
      {
        path: '',
        redirectTo: 'general',
      },
      {
        path: 'general',
        component: RegisterPractitionerGeneralComponent,
        data: {index: 0}
      },
      {
        path: 'service',
        component: RegisterPractitionerServiceComponent,
        data: {index: 1},
      },
      {
        path: 'term',
        component: RegisterPartnerTermComponent,
        data: {index: 2}
      }
    ]
  },
  {
    path: 'register-product',
    component: RegisterQuestionnaireComponent,
    canActivate: [RegisterQuestionnaireGuard],
    data: {type: 'product'},
    children: [
      {
        path: '', 
        redirectTo: 'general'
      },
      {
        path: 'general',
        component: RegisterPartnerGeneralComponent,
        data: {index: 0}
      },
      {
        path: 'service',
        component: RegisterPartnerServiceComponent,
        data: {index: 1}
      },
      {
        path: 'offer',
        component: RegisterPartnerOfferComponent,
        data: {index: 2}
      },
      {
        path: 'term',
        component: RegisterPartnerTermComponent,
        data: {index: 3}
      },
    ],
  },
  {
    path: 'register-product/complete',
    redirectTo: '/community',
    // component: RegisterQuestionnaireCompleteComponent,
    // canActivate: [RegisterQuestionnaireCompleteGuard,],
  },

  // { path: 'my-posts', loadChildren: () => PostManagerModule },


  { path: 'subscriptionplan',   redirectTo: '/plans' },
  { path: 'questionnaire/u',    redirectTo: '/personal-match/gender' },
  { path: 'questions/User',     redirectTo: '/personal-match/gender' },
  { path: 'listing',            redirectTo: '/practitioners' },
  { path: 'listingCompare',     redirectTo: '/compare-practitioners' },
  { path: 'detail/:id',         redirectTo: '/practitioners/:id' },
  { path: 'register-partner',   redirectTo: '/dashboard/register-product/general' },
  { path: 'professional-info',  redirectTo: '/dashboard/register-practitioner/general' },
  { path: '**',                 redirectTo: '/dashboard/profilemanagement/my-performance' }
];

@NgModule({
  imports: [RouterModule.forChild(routes), GooglePlaceModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
 