import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxStripeModule } from 'ngx-stripe';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { DashboardRoutingModule } from './dashboard-routing.module';
// import { SubscriptionPlanComponent } from '../home/subscription-plan/subscription-plan.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserDetailsComponent } from './user-details/user-details.component';
import { SubscriptionProfessionalComponent } from './subscription-professional/subscription-professional.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
// import { ListingComponent } from '../home/listing/listing.component';
// import { ListingcompareComponent } from '../home/listingcompare/listingcompare.component';
// import { DetailComponent } from '../home/detail/detail.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ProfessionalHomeComponent } from './professional-home/professional-home.component';
// import { ProfessionalRegisterComponent } from './professional-register/professional-register.component';
// import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { EmbededURLPipe } from '../shared/pipes/embeded-url';
import { NgxPaginationModule } from 'ngx-pagination';
import { ModalModule } from 'ngx-bootstrap/modal';

/** slider for filter in listing page */
import { NpnSliderModule } from 'npn-slider';

import { AgmCoreModule } from '@agm/core';
import { AddOnCardComponent } from './add-on-card/add-on-card.component';
import { environment } from 'src/environments/environment';
// import { DetailTabbarIntersectionObserverDirective } from './detail-tabbar-intersection-observer.directive';

// import { UserQuestionaireComponent } from '../home/user-questionaire/user-questionaire.component';
// import { UserQuestionnaireItemSelectComponent } from './user-questionnaire-item-select/user-questionnaire-item-select.component';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { AddonSelectCategoryComponent } from '../home/addon-select-category/addon-select-category.component';
// import { FilterDropdownComponent } from '../home/filter-dropdown/filter-dropdown.component';
// import { FilterDropdownSelectComponent } from './filter-dropdown-select/filter-dropdown-select.component';
// import { FilterDropdownSliderComponent } from './filter-dropdown-slider/filter-dropdown-slider.component';
// import { FilterDropdownInputComponent } from './filter-dropdown-input/filter-dropdown-input.component';
// import { FilterDropdownLocationComponent } from './filter-dropdown-location/filter-dropdown-location.component';
import { RegisterQuestionnaireComponent } from './register-questionnaire/register-questionnaire.component';
import { RegisterPartnerGeneralComponent } from './register-partner-general/register-partner-general.component';
import { RegisterPartnerServiceComponent } from './register-partner-service/register-partner-service.component';
import { RegisterPartnerOfferComponent } from './register-partner-offer/register-partner-offer.component';
import { RegisterPartnerTermComponent } from './register-partner-term/register-partner-term.component';
import { RegisterQuestionnaireCompleteComponent } from './register-questionnaire-complete/register-questionnaire-complete.component';
// import { UserQuestionnaireItemSelectMultipleComponent } from './user-questionnaire-item-select-multiple/user-questionnaire-item-select-multiple.component';
// import { UserQuestionnaireItemGenderComponent } from './user-questionnaire-item-gender/user-questionnaire-item-gender.component';
// import { UserQuestionnaireItemBackgroundComponent } from './user-questionnaire-item-background/user-questionnaire-item-background.component';
import { RegisterPractitionerGeneralComponent } from './register-practitioner-general/register-practitioner-general.component';
import { RegisterPractitionerServiceComponent } from './register-practitioner-service/register-practitioner-service.component';

@NgModule({
  declarations: [
    // SubscriptionPlanComponent,
    UserDetailsComponent,
    SubscriptionProfessionalComponent,
    QuestionnaireComponent,
    // ListingComponent,
    // ListingcompareComponent,
    // DetailComponent,
    ProfessionalHomeComponent,
    // ProfessionalRegisterComponent,
    EmbededURLPipe,
    AddOnCardComponent,
    // DetailTabbarIntersectionObserverDirective,
    // UserQuestionaireComponent,
    // UserQuestionnaireItemSelectComponent,
    // AddonSelectCategoryComponent,
    // FilterDropdownComponent,
    // FilterDropdownSelectComponent,
    // FilterDropdownSliderComponent,
    // FilterDropdownInputComponent,
    // FilterDropdownLocationComponent,
    RegisterQuestionnaireComponent,
    RegisterPartnerGeneralComponent,
    RegisterPartnerServiceComponent,
    RegisterPartnerOfferComponent,
    RegisterPartnerTermComponent,
    RegisterQuestionnaireCompleteComponent,
    // UserQuestionnaireItemSelectMultipleComponent,
    // UserQuestionnaireItemGenderComponent,
    // UserQuestionnaireItemBackgroundComponent,
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
    // OwlDateTimeModule,
    // OwlNativeDateTimeModule,
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
    NgbModalModule,
    NpnSliderModule,
    ModalModule.forRoot(),
    NgbModule,
  ]
})
export class DashboardModule { }
