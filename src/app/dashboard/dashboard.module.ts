import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxStripeModule } from 'ngx-stripe';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { RegisterQuestionnaireComponent } from './register-questionnaire/register-questionnaire.component';
import { RegisterPartnerGeneralComponent } from './register-partner-general/register-partner-general.component';
import { RegisterPartnerServiceComponent } from './register-partner-service/register-partner-service.component';
import { RegisterPartnerTermComponent } from './register-partner-term/register-partner-term.component';
import { RegisterPractitionerGeneralComponent } from './register-practitioner-general/register-practitioner-general.component';
import { RegisterPractitionerServiceComponent } from './register-practitioner-service/register-practitioner-service.component';

@NgModule({
  declarations: [

    RegisterQuestionnaireComponent,
    RegisterPartnerGeneralComponent,
    RegisterPartnerServiceComponent,
    RegisterPartnerTermComponent,
    RegisterPractitionerGeneralComponent,
    RegisterPractitionerServiceComponent,
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCEn-p_qT9RNRn2qwRvIyUwfaWD09xDhkI',
      language: 'en',
      libraries: ['places']
    }),
    CommonModule,
    SharedModule,
    AuthModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxStripeModule.forRoot(environment.config.stripeKey),
    ModalModule.forRoot(),
  ]
})
export class DashboardModule { }
