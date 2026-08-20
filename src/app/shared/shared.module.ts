import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { SharedService } from './services/shared.service';
import { PreviousRouteService } from './services/previousUrl.service';
import { CategoryService } from './services/category.service';
import { SharedCoreModule } from './shared-core.module';

// Components NOT in SharedCoreModule (only needed by lazy-loaded modules)
import { SearchPipe } from '../shared/pipes/search-pipe';
import { UserSidebarComponent } from './user-sidebar/user-sidebar.component';
import { SubscriptionPlanItemCardComponent } from './subscription-plan-item-card/subscription-plan-item-card.component';
import { SubscriptionPlanAddonCardComponent } from './subscription-plan-addon-card/subscription-plan-addon-card.component';
import { PriceRangeSwitcherComponent } from './price-range-switcher/price-range-switcher.component';
import { FocusDirective } from './focus.directive';
import { SocialButtonsComponent } from './social-buttons/social-buttons.component';
import { ImageRowComponent } from './image-row/image-row.component';
import { StepperComponent } from './stepper/stepper.component';
import { FormItemInputComponent } from './form-item-input/form-item-input.component';
import { FormItemTextareaComponent } from './form-item-textarea/form-item-textarea.component';
import { FormItemAddressComponent } from './form-item-address/form-item-address.component';
import { FormItemCheckboxComponent } from './form-item-checkbox/form-item-checkbox.component';
import { FormItemErrorsComponent } from './form-item-errors/form-item-errors.component';
import { FormItemServiceComponent } from './form-item-service/form-item-service.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { ShareMenuComponent } from './share-menu/share-menu.component';
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
import { ButtonShareComponent } from './button-share/button-share.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { FormItemSearchComponent } from './form-item-search/form-item-search.component';
import { ButtonGuidelineComponent } from './button-guideline/button-guideline.component';
import { SocialMediaKitComponent } from './socieal-media-kit/social-media-kit.component';
import { FormSubscribeComponent } from './form-subscribe/form-subscribe.component';
import { ContenteditableValueAccessor } from './contenteditable.directive';
import { DurationPipe } from './pipes/duration.pipe';
import { DistancePipe } from './pipes/distance.pipe';
import { SwitchComponent } from './switch/switch.component';
import { ImageUploaderDirective } from './image-uploader.directive';
import { FormItemSelectBoxComponent } from './form-item-select-box/form-item-select-box.component';
import { FormItemProfileImageComponent } from './form-item-profile-image/form-item-profile-image.component';
import { FormAdminGeneralComponent } from './form-admin-general/form-admin-general.component';
import { CardNoContentComponent } from './card-no-content/card-no-content.component';
import { TrackedLinkDirective } from './directives/tracked-link.directive';

const LAZY_DECLARATIONS = [
  UserSidebarComponent,
  SearchPipe,
  SubscriptionPlanItemCardComponent,
  SubscriptionPlanAddonCardComponent,
  PriceRangeSwitcherComponent,
  FocusDirective,
  SocialButtonsComponent,
  ImageRowComponent,
  StepperComponent,
  FormItemInputComponent,
  FormItemTextareaComponent,
  FormItemAddressComponent,
  FormItemCheckboxComponent,
  FormItemErrorsComponent,
  FormItemServiceComponent,
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
  ButtonShareComponent,
  SearchBarComponent,
  FormItemSearchComponent,
  ButtonGuidelineComponent,
  SocialMediaKitComponent,
  FormSubscribeComponent,
  ContenteditableValueAccessor,
  DurationPipe,
  DistancePipe,
  SwitchComponent,
  ImageUploaderDirective,
  FormItemSelectBoxComponent,
  FormItemProfileImageComponent,
  FormAdminGeneralComponent,
  CardNoContentComponent,
  TrackedLinkDirective,
];

@NgModule({
  imports: [
    SharedCoreModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
  ],
  providers: [
    PreviousRouteService,
    SharedService,
    CategoryService,
  ],
  declarations: LAZY_DECLARATIONS,
  exports: [
    SharedCoreModule,
    ...LAZY_DECLARATIONS,
  ]
})
export class SharedModule { }
