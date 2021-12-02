import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { RegisterQuestionnaireComponent } from './register-questionnaire/register-questionnaire.component';
import { RegisterPartnerGeneralComponent } from './register-partner-general/register-partner-general.component';
import { RegisterPartnerServiceComponent } from './register-partner-service/register-partner-service.component';
import { RegisterPartnerTermComponent } from './register-partner-term/register-partner-term.component';
import { RegisterQuestionnaireGuard } from './register-questionnaire.guard';
import { RegisterPractitionerGeneralComponent } from './register-practitioner-general/register-practitioner-general.component';
import { RegisterPractitionerServiceComponent } from './register-practitioner-service/register-practitioner-service.component';

const routes: Routes = [
 
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
        path: 'term',
        component: RegisterPartnerTermComponent,
        data: {index: 2}
      },
    ],
  },
  {
    path: 'register-product/complete',
    redirectTo: '/community',
  },

  { path: 'subscriptionplan',   redirectTo: '/plans' },
  { path: 'questionnaire/u',    redirectTo: '/personal-match/gender' },
  { path: 'questions/User',     redirectTo: '/personal-match/gender' },
  { path: 'listing',            redirectTo: '/practitioners' },
  { path: 'listingCompare',     redirectTo: '/compare-practitioners' },
  { path: 'detail/:id',         redirectTo: '/practitioners/:id' },
  { path: 'register-partner',   redirectTo: '/dashboard/register-product/general' },
  { path: 'professional-info',  redirectTo: '/dashboard/register-practitioner/general' },
];

@NgModule({
  imports: [RouterModule.forChild(routes), GooglePlaceModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
 