import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

import { SharedService } from './services/shared.service';
import { PreviousRouteService } from './services/previousUrl.service';
import { SearchPipe } from '../shared/pipes/search-pipe';
import { UserSidebarComponent } from './user-sidebar/user-sidebar.component';

import { SubscriptionPlanItemCardComponent } from './subscription-plan-item-card/subscription-plan-item-card.component';
import { SubscriptionPlanAddonCardComponent } from './subscription-plan-addon-card/subscription-plan-addon-card.component';
import { PriceRangeSwitcherComponent } from './price-range-switcher/price-range-switcher.component';
import { StarRateComponent } from './star-rate/star-rate.component';
import { CardDummyComponent } from './card-dummy/card-dummy.component';
import { FocusDirective } from './focus.directive';
import { CategoryService } from './services/category.service';
import { ClickOutsideDirective } from './click-outside.directive';
import { ScrollDetectorDirective } from './scroll-detector.directive';
import { SocialButtonsComponent } from './social-buttons/social-buttons.component';
import { ImageRowComponent } from './image-row/image-row.component';
import { StepperComponent } from './stepper/stepper.component';
import { FormItemInputComponent } from './form-item-input/form-item-input.component';
import { FormItemTextareaComponent } from './form-item-textarea/form-item-textarea.component';
import { FormItemAddressComponent } from './form-item-address/form-item-address.component';
import { FormItemCheckboxComponent } from './form-item-checkbox/form-item-checkbox.component';
import { FormItemErrorsComponent } from './form-item-errors/form-item-errors.component';
import { BadgeVerifiedComponent } from './badge-verified/badge-verified.component';
import { UserImageComponent } from './user-image/user-image.component';
import { IntersectionObserverDirective } from './intersection-observer.directive';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { ShareMenuComponent } from './share-menu/share-menu.component';
import { FormItemServiceComponent } from './form-item-service/form-item-service.component';
import { FormPartnerServiceComponent } from './form-partner-service/form-partner-service.component';
import { FormPartnerGeneralComponent } from './form-partner-general/form-partner-general.component';
import { FormPartnerOfferComponent } from './form-partner-offer/form-partner-offer.component';
import { FormItemPlaceComponent } from './form-item-place/form-item-place.component';
import { FormCentreGeneralComponent } from './form-centre-general/form-centre-general.component';
import { CardCouponComponent } from './card-coupon/card-coupon.component';
import { ButtonTutorialComponent } from './button-tutorial/button-tutorial.component';
import { FormProviderGeneralComponent } from './form-provider-general/form-provider-general.component';
import { FormItemCheckboxGroupComponent } from './form-item-checkbox-group/form-item-checkbox-group.component';
import { FormItemPricingComponent } from './form-item-pricing/form-item-pricing.component';
import { FormClientGeneralComponent } from './form-client-general/form-client-general.component';
import { FormItemCustomerHealthComponent } from './form-item-customer-health/form-item-customer-health.component';
import { FormPractitionerServiceComponent } from './form-practitioner-service/form-practitioner-service.component';
import { FormItemDatetimeComponent } from './form-item-datetime/form-item-datetime.component';
import { FormItemUploadImageButtonComponent } from './form-item-upload-image-button/form-item-upload-image-button.component';
import { AddonSelectCategoryComponent } from './addon-select-category/addon-select-category.component';
import { ButtonShareComponent } from './button-share/button-share.component';
import { ListItemComponent } from './list-item/list-item.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { IconDirective } from './icon.directive';
import { FormItemSearchComponent } from './form-item-search/form-item-search.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    NgbModule,

    // FlashMessagesModule,
  ],
  providers: [
    PreviousRouteService,
    SharedService,
    CategoryService
  ],
  declarations: [
    UserSidebarComponent,
    SearchPipe,
    SubscriptionPlanItemCardComponent,
    SubscriptionPlanAddonCardComponent,
    PriceRangeSwitcherComponent,
    StarRateComponent,
    CardDummyComponent,
    FocusDirective,
    ClickOutsideDirective,
    ScrollDetectorDirective,
    SocialButtonsComponent,
    ImageRowComponent,
    StepperComponent,
    FormItemInputComponent,
    FormItemTextareaComponent,
    FormItemAddressComponent,
    FormItemCheckboxComponent,
    FormItemErrorsComponent,
    FormItemServiceComponent,
    BadgeVerifiedComponent,
    UserImageComponent,
    IntersectionObserverDirective,
    ImageViewerComponent,
    ShareMenuComponent,
    FormPartnerServiceComponent,
    FormPartnerGeneralComponent,
    FormPartnerOfferComponent,
    FormItemPlaceComponent,
    FormCentreGeneralComponent,
    CardCouponComponent,
    ButtonTutorialComponent,
    FormProviderGeneralComponent,
    FormItemCheckboxGroupComponent,
    FormItemPricingComponent,
    FormClientGeneralComponent,
    FormItemCustomerHealthComponent,
    FormPractitionerServiceComponent,
    FormItemDatetimeComponent,
    FormItemUploadImageButtonComponent,
    AddonSelectCategoryComponent,
    ButtonShareComponent,
    ListItemComponent,
    SearchBarComponent,
    IconDirective,
    FormItemSearchComponent,
  ],
  exports: [
    UserSidebarComponent,
    SearchPipe,
    SubscriptionPlanItemCardComponent,
    SubscriptionPlanAddonCardComponent,
    PriceRangeSwitcherComponent,
    StarRateComponent,
    CardDummyComponent,
    FocusDirective,
    ClickOutsideDirective,
    ScrollDetectorDirective,
    SocialButtonsComponent,
    ImageRowComponent,
    StepperComponent,
    FormItemInputComponent,
    FormItemTextareaComponent,
    FormItemAddressComponent,
    FormItemCheckboxComponent,
    FormItemErrorsComponent,
    FormItemServiceComponent,
    BadgeVerifiedComponent,
    UserImageComponent,
    IntersectionObserverDirective,
    ImageViewerComponent,
    ShareMenuComponent,
    FormPartnerServiceComponent,
    FormPartnerGeneralComponent,
    FormPartnerOfferComponent,
    FormItemPlaceComponent,
    FormCentreGeneralComponent,
    FormProviderGeneralComponent,
    FormClientGeneralComponent,
    CardCouponComponent,
    ButtonTutorialComponent,
    FormItemCheckboxGroupComponent,
    FormItemCustomerHealthComponent,
    FormPractitionerServiceComponent,
    FormItemDatetimeComponent,
    FormItemUploadImageButtonComponent,
    ButtonShareComponent,
    ListItemComponent,
    SearchBarComponent,
    IconDirective,
  ]
})
export class SharedModule { }
