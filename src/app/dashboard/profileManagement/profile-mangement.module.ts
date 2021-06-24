import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AgmCoreModule } from '@agm/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalModule } from 'ngx-bootstrap/modal';
import { QuillModule } from 'ngx-quill';

import 'rxjs';

import { ProfileManagementRoutingModule } from './profile-mangement-routing.module';
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

// import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MyAmenitiesComponent } from './my-amenities/my-amenities.component';
import { SharedModule } from '../../shared/shared.module';
import { MyProductComponent } from './my-product/my-product.component';
import { RatingsComponent } from '../../shared/ratings/ratings.component';
import { MyAffiliateComponent } from './my-affiliate/my-affiliate.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MyPasswordComponent } from './my-password/my-password.component';
import { MyServiceComponent } from './my-service/my-service.component';
import { MySocialComponent } from './my-social/my-social.component';
import { MyBadgeComponent } from './my-badge/my-badge.component';
import { MyPerformanceComponent } from './my-performance/my-performance.component';
import { PartnerServiceComponent } from './partner-service/partner-service.component';
import { PartnerGeneralComponent } from './partner-general/partner-general.component';
import { PartnerOfferComponent } from './partner-offer/partner-offer.component';
import { MyPostsComponent } from './my-posts/my-posts.component';
import { MyPostComponent } from './my-post/my-post.component';
import { PostEditorComponent } from './post-editor/post-editor.component';

@NgModule({
  declarations: [
    WrapperComponent,
    MyProfileComponent,
    MySubscriptionComponent,
    MyProfessionalInfoComponent,
    MyBookingComponent,
    MyPaymentComponent,
    AddProfessionalComponent,
    MyFavouriteComponent,
    ReviewsRatingsComponent,
    VideosBlogsComponent,
    MyAmenitiesComponent,
    MyAffiliateComponent,
    MyProductComponent,
    RatingsComponent,
    MyPasswordComponent,
    MyServiceComponent,
    MySocialComponent,
    MyBadgeComponent,
    MyPerformanceComponent,
    PartnerServiceComponent,
    PartnerGeneralComponent,
    PartnerOfferComponent,
    MyPostsComponent,
    MyPostComponent,
    PostEditorComponent,

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCbRhC6h9Pp43-5t_Knyrd_ewAdLMIJtCg',
      language: 'en',
      libraries: ['places']
    }),
    ModalModule.forRoot(),
    NgxPaginationModule, NgxSpinnerModule,
    SharedModule, NgxDatatableModule,
    // OwlDateTimeModule, OwlNativeDateTimeModule,
    CommonModule, ProfileManagementRoutingModule, ReactiveFormsModule, FormsModule, NgbModule,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],        // toggled buttons
          ['blockquote'],
       
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              
          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
       
          ['clean'],                                         // remove formatting button
       
          ['link', 'image', 'video']                         // link and image, video
        ],
      },
    }),
  ]

})
export class ProfileManagementModule { }
