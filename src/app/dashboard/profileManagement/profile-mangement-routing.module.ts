import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WrapperComponent } from './wrapper/wrapper.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { MySubscriptionComponent } from './my-subscription/my-subscription.component';
import { MyProfessionalInfoComponent } from './my-professional-info/my-professional-info.component';
import { MyBookingComponent } from './my-booking/my-booking.component';
import { MyPaymentComponent } from './my-payment/my-payment.component';
import { AddProfessionalComponent } from './add-professional/add-professional.component';
import { MyFavouriteComponent } from './my-favourite/my-favourite.component';
import { ReviewsRatingsComponent } from './reviews-ratings/reviews-ratings.component';
import { VideosBlogsComponent } from './videos-blogs/videos-blogs.component';
import { MyAmenitiesComponent } from './my-amenities/my-amenities.component';

import { MyProductComponent } from './my-product/my-product.component';
import { MyAffiliateComponent } from './my-affiliate/my-affiliate.component';
import { MyPasswordComponent } from './my-password/my-password.component';
import { MyServiceComponent } from './my-service/my-service.component';
import { MySocialComponent } from './my-social/my-social.component';
import { MyBadgeComponent } from './my-badge/my-badge.component';
import { MyPerformanceComponent } from './my-performance/my-performance.component';
import { PartnerServiceComponent } from './partner-service/partner-service.component';
import { PartnerGeneralComponent } from './partner-general/partner-general.component';

import { ProfileManagementChildGuard } from './profile-management-child.guard';
import { PartnerOfferComponent } from './partner-offer/partner-offer.component';
import { PostManagerModule } from 'src/app/post-manager/post-manager.module';
import { ManageBookingComponent } from './manage-booking/manage-booking.component';

const routes: Routes = [
  {
    path: '',
    component: WrapperComponent,
    canActivateChild: [ProfileManagementChildGuard, ],
    // redirectTo: '/my-profile',
    children: [
      {
        path: '',
        redirectTo: 'my-performance',
      },
      {
        path: 'my-profile',
        component: MyProfileComponent
      },
      {
        path: 'my-product',
        component: MyProductComponent
      },
      {
        path: 'my-subscription',
        component: MySubscriptionComponent
      },
      // {
      //   path: "my-professional-info",
      //   component: MyProfessionalInfoComponent
      // },
      {
        path: 'my-booking',
        component: MyBookingComponent
      },
      {
        path: 'manage-booking',
        component: ManageBookingComponent,
      },
      {
        path: 'my-payment',
        component: MyPaymentComponent
      },
      {
        path: 'add-professionals',
        component: AddProfessionalComponent
      },
      {
        path: 'my-favourites',
        component: MyFavouriteComponent
      },
      {
        path: 'reviews-ratings',
        component: ReviewsRatingsComponent
      },
      {
        path: 'videos-blogs',
        component: VideosBlogsComponent,
      },
      {
        path: 'my-amenities',
        component: MyAmenitiesComponent,
      },
      {
        path: 'my-affiliate',
        component: MyAffiliateComponent,
      },
      {
        path: 'my-password',
        component: MyPasswordComponent,
      },
      {
        path: 'my-service',
        component: MyServiceComponent,
      },
      {
        path: 'my-social',
        component: MySocialComponent,
      },
      {
        path: 'my-badge',
        component: MyBadgeComponent,
      },
      {
        path: 'my-performance',
        component: MyPerformanceComponent,
      },
      {
        path: 'partner-service',
        component: PartnerServiceComponent,
      },
      {
        path: 'partner-profile',
        component: PartnerGeneralComponent,
      },
      // {
      //   path: 'partner-offer',
      //   component: PartnerOfferComponent,
      // },
      { path: 'my-posts', loadChildren: () => PostManagerModule },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileManagementRoutingModule { }
