import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { SubscriptionPlanComponent } from './subscription-plan/subscription-plan.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { SubscriptionProfessionalComponent } from './subscription-professional/subscription-professional.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { ListingComponent } from './listing/listing.component';
import { ListingcompareComponent } from './listingcompare/listingcompare.component';
import { DetailComponent } from './detail/detail.component';
import { ProfileManagementModule } from './profileManagement/profile-mangement.module';
import { ProfessionalRegisterComponent } from './professional-register/professional-register.component';
import { ProfessionalHomeComponent } from './professional-home/professional-home.component';

import { UserQuestionaireComponent } from './user-questionaire/user-questionaire.component';
import { RegisterPartnerComponent } from './register-partner/register-partner.component';
import { RegisterPartnerGeneralComponent } from './register-partner-general/register-partner-general.component';
import { RegisterPartnerServiceComponent } from './register-partner-service/register-partner-service.component';
import { RegisterPartnerOfferComponent } from './register-partner-offer/register-partner-offer.component';
import { RegisterPartnerTermComponent } from './register-partner-term/register-partner-term.component';
import { RegisterPartnerCompleteComponent } from './register-partner-complete/register-partner-complete.component';
import { RegisterPartnerGuard } from './register-partner.guard';
import { RegisterPartnerCompleteGuard } from './register-partner-complete.guard';
import { AuthGuardService as AuthGuard } from '../auth/auth-gaurd.service';
import { UserQuestionnaireItemSelectComponent } from './user-questionnaire-item-select/user-questionnaire-item-select.component';
import { UserQuestionnaireItemSelectMultipleComponent } from './user-questionnaire-item-select-multiple/user-questionnaire-item-select-multiple.component';

const routes: Routes = [
  {
    path: 'subscriptionplan',
    component: SubscriptionPlanComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'professional',
    component: ProfessionalHomeComponent
  },
  {
    path: 'subscriptionplan-professional',
    component: SubscriptionProfessionalComponent
  },
  {
    path: 'questionnaire/:type',
    component: QuestionnaireComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'questionnaire/u',
    component: UserQuestionaireComponent,
    canActivate: [AuthGuard],
    redirectTo: 'questions/User'
  },
  {
    path: 'questions/User',
    component: UserQuestionaireComponent, children: [
      { path: 'gender', component: UserQuestionnaireItemSelectComponent, data: {index: 0, q: 'gender'} },
      { path: 'age', component: UserQuestionnaireItemSelectComponent, data: {index: 1, q: 'age' } },
      { path: 'background', component: UserQuestionnaireItemSelectMultipleComponent, data: {index: 2, q: 'background'} },
      { path: 'goal', component: UserQuestionnaireItemSelectMultipleComponent, data: {index: 3, q: 'goal'} },
      { path: '**', redirectTo: 'gender' },
    ],
    // canActivate: [AuthGuard]
  },
  {
    path: 'listing',
    component: ListingComponent
  },
  {
    path: 'listingCompare',
    component: ListingcompareComponent
  },
  {
    path: 'detail/:id',
    component: DetailComponent
  },
  {
    path: 'profilemanagement',
    loadChildren: () => ProfileManagementModule,
    canActivate: [AuthGuard],
    // redirectTo: 'profilemanagement/my-profile'
  },
  {
    path: 'professional-info',
    component: ProfessionalRegisterComponent
  },
  {
    path: 'register-product',
    component: RegisterPartnerComponent,
    canActivate: [RegisterPartnerGuard],
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
    component: RegisterPartnerCompleteComponent,
    canActivate: [RegisterPartnerCompleteGuard,],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), GooglePlaceModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
 