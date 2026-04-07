import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Only components/directives/pipes needed on the homepage rendering path
import { IconDirective } from './icon.directive';
import { ClickOutsideDirective } from './click-outside.directive';
import { ScrollDetectorDirective } from './scroll-detector.directive';
import { IntersectionObserverDirective } from './intersection-observer.directive';
import { ParallaxDirective } from './parallax.directive';
import { ProfileImageComponent } from './profile-image/profile-image.component';
import { ListItemComponent } from './list-item/list-item.component';
import { CardDummyComponent } from './card-dummy/card-dummy.component';
import { CardPractitionerComponent } from './card-practitioner/card-practitioner.component';
import { ModalUserMenuComponent } from './modal-user-menu/modal-user-menu.component';
import { LoaderComponent } from './loader/loader.component';
import { StarRateComponent } from './star-rate/star-rate.component';
import { BadgeVerifiedComponent } from './badge-verified/badge-verified.component';
import { AlertUploadingComponent } from './alert-uploading/alert-uploading.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { UserImageComponent } from './user-image/user-image.component';

const CORE_DECLARATIONS = [
  IconDirective,
  ClickOutsideDirective,
  ScrollDetectorDirective,
  IntersectionObserverDirective,
  ParallaxDirective,
  ProfileImageComponent,
  ListItemComponent,
  CardDummyComponent,
  CardPractitionerComponent,
  ModalUserMenuComponent,
  LoaderComponent,
  StarRateComponent,
  BadgeVerifiedComponent,
  AlertUploadingComponent,
  BreadcrumbComponent,
  TimeAgoPipe,
  UserImageComponent,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: CORE_DECLARATIONS,
  exports: [
    ...CORE_DECLARATIONS,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class SharedCoreModule { }
