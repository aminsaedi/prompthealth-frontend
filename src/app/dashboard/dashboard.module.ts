import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxStripeModule } from 'ngx-stripe';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SubscriptionPlanComponent } from './subscription-plan/subscription-plan.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserDetailsComponent } from './user-details/user-details.component';
import { SubscriptionProfessionalComponent } from './subscription-professional/subscription-professional.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { ListingComponent } from './listing/listing.component';
import { ListingcompareComponent } from './listingcompare/listingcompare.component';
import { DetailComponent } from './detail/detail.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ProfessionalHomeComponent } from './professional-home/professional-home.component';
import { ProfessionalRegisterComponent } from './professional-register/professional-register.component';
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

import { UserQuestionaireComponent } from './user-questionaire/user-questionaire.component';
import { UserQuestionnaireItemSelectComponent } from './user-questionnaire-item-select/user-questionnaire-item-select.component';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddonSelectCategoryComponent } from './addon-select-category/addon-select-category.component';
import { FilterDropdownComponent } from './filter-dropdown/filter-dropdown.component';
import { FilterDropdownSelectComponent } from './filter-dropdown-select/filter-dropdown-select.component';
import { FilterDropdownSliderComponent } from './filter-dropdown-slider/filter-dropdown-slider.component';
import { FilterDropdownInputComponent } from './filter-dropdown-input/filter-dropdown-input.component';
import { FilterDropdownLocationComponent } from './filter-dropdown-location/filter-dropdown-location.component';
import { RegisterPartnerComponent } from './register-partner/register-partner.component';
import { RegisterPartnerGeneralComponent } from './register-partner-general/register-partner-general.component';
import { RegisterPartnerServiceComponent } from './register-partner-service/register-partner-service.component';
import { RegisterPartnerOfferComponent } from './register-partner-offer/register-partner-offer.component';
import { RegisterPartnerTermComponent } from './register-partner-term/register-partner-term.component';
import { RegisterPartnerCompleteComponent } from './register-partner-complete/register-partner-complete.component';
import { UserQuestionnaireItemSelectMultipleComponent } from './user-questionnaire-item-select-multiple/user-questionnaire-item-select-multiple.component';

@NgModule({
  declarations: [
    SubscriptionPlanComponent,
    UserDetailsComponent,
    SubscriptionProfessionalComponent,
    QuestionnaireComponent,
    ListingComponent,
    ListingcompareComponent,
    DetailComponent,
    ProfessionalHomeComponent,
    ProfessionalRegisterComponent,
    EmbededURLPipe,
    AddOnCardComponent,
    // DetailTabbarIntersectionObserverDirective,
    UserQuestionaireComponent,
    UserQuestionnaireItemSelectComponent,
    AddonSelectCategoryComponent,
    FilterDropdownComponent,
    FilterDropdownSelectComponent,
    FilterDropdownSliderComponent,
    FilterDropdownInputComponent,
    FilterDropdownLocationComponent,
    RegisterPartnerComponent,
    RegisterPartnerGeneralComponent,
    RegisterPartnerServiceComponent,
    RegisterPartnerOfferComponent,
    RegisterPartnerTermComponent,
    RegisterPartnerCompleteComponent,
    UserQuestionnaireItemSelectMultipleComponent,
  ],
  imports: [
    AutocompleteLibModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCbRhC6h9Pp43-5t_Knyrd_ewAdLMIJtCg',
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
