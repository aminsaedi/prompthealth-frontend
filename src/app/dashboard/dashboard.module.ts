import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxStripeModule } from 'ngx-stripe';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { NgxSpinnerModule } from 'ngx-spinner';
import { UserDetailsComponent } from './user-details/user-details.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ProfessionalHomeComponent } from './professional-home/professional-home.component';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { EmbededURLPipe } from '../shared/pipes/embeded-url';
import { NgxPaginationModule } from 'ngx-pagination';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AgmCoreModule } from '@agm/core';
import { AddOnCardComponent } from './add-on-card/add-on-card.component';
import { environment } from 'src/environments/environment';
import { RegisterQuestionnaireComponent } from './register-questionnaire/register-questionnaire.component';
import { RegisterPartnerGeneralComponent } from './register-partner-general/register-partner-general.component';
import { RegisterPartnerServiceComponent } from './register-partner-service/register-partner-service.component';
import { RegisterPartnerOfferComponent } from './register-partner-offer/register-partner-offer.component';
import { RegisterPartnerTermComponent } from './register-partner-term/register-partner-term.component';
import { RegisterPractitionerGeneralComponent } from './register-practitioner-general/register-practitioner-general.component';
import { RegisterPractitionerServiceComponent } from './register-practitioner-service/register-practitioner-service.component';

@NgModule({
  declarations: [
    UserDetailsComponent,
    QuestionnaireComponent,
    ProfessionalHomeComponent,
    EmbededURLPipe,
    AddOnCardComponent,
    RegisterQuestionnaireComponent,
    RegisterPartnerGeneralComponent,
    RegisterPartnerServiceComponent,
    RegisterPartnerOfferComponent,
    RegisterPartnerTermComponent,
    RegisterPractitionerGeneralComponent,
    RegisterPractitionerServiceComponent,
  ],
  imports: [
    AutocompleteLibModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDDfIO3nUUgAA_QCs2XTv2xvd8t9-0oYDs',
      language: 'en',
      libraries: ['places']
    }),
    CommonModule,
    SharedModule,
    AuthModule,
    DashboardRoutingModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    NgxStripeModule.forRoot(environment.config.stripeKey),
    NgMultiSelectDropDownModule.forRoot(),
    UiSwitchModule,
    ModalModule.forRoot(),
  ]
})
export class DashboardModule { }
