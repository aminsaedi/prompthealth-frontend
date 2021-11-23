import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page/page.component';
import { SharedModule } from '../shared/shared.module';
import { CardSubscribeComponent } from './card-subscribe/card-subscribe.component';
import { ModalEventComponent } from './modal-event/modal-event.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../shared/services/category.service';
import { NgxStripeModule, StripeService } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { CardNewPostComponent } from './card-new-post/card-new-post.component';
import { QuillModule } from 'ngx-quill';
import { EditorComponent } from './editor/editor.component';
import { BaseComponent } from './base/base.component';
import { GuardIfEditorLockedGuard } from './guard-if-editor-locked.guard';
import { ProfileComponent } from './profile/profile.component';
import { ProfileAboutComponent } from './profile-about/profile-about.component';
import { ProfileReviewComponent } from './profile-review/profile-review.component';
import { ProfileServiceComponent } from './profile-service/profile-service.component';
import { ProfileFeedComponent } from './profile-feed/profile-feed.component';
import { AuthModule } from '../auth/auth.module';
import { GuardIfNotEligbleToCreatePostGuard } from './guard-if-not-eligble-to-create-post.guard';
import { AgmCoreModule } from '@agm/core';
import { NotificationComponent } from './notification/notification.component';
import { DraftsComponent } from './drafts/drafts.component';
import { ProfileContactComponent } from './profile-contact/profile-contact.component';
import { ProfileFollowListComponent } from './profile-follow-list/profile-follow-list.component';
import { GuardIfNotLoggedInGuard } from '../auth/guard-if-not-logged-in.guard';
import { NewReferralComponent } from './new-referral/new-referral.component';
import { GuardIfNotProfileSelectedGuard } from './guard-if-not-profile-selected.guard';
import { GuardIfNewReferralIncompletedGuard } from '../guard-if-new-referral-incompleted.guard';
import { GuardIfDataNotSetGuard } from './guard-if-data-not-set.guard';
import { ModalVoiceRecorderComponent } from './modal-voice-recorder/modal-voice-recorder.component';
import { ProfilePromotionComponent } from './profile-promotion/profile-promotion.component';
import { CardNewPromoComponent } from './card-new-promo/card-new-promo.component';
import { SocialItemsModule } from '../social-items/social-items.module';
import { ProfileEventComponent } from './profile-event/profile-event.component';
import { ProfileEventUpcomingComponent } from './profile-event-upcoming/profile-event-upcoming.component';
import { ProfileEventPastComponent } from './profile-event-past/profile-event-past.component';


const routes: Routes = [
  { path: '', component: BaseComponent, children: [
    { path: 'profile/:userid', component: ProfileComponent, children: [
      { path: '', component: ProfileAboutComponent, data: {order: 1} } ,
      { path: 'service', component: ProfileServiceComponent, data: {order:2} } ,
      { path: 'feed', component: ProfileFeedComponent, data: {order: 3} },
      { path: 'promotion', component: ProfilePromotionComponent, data: {order: 3}, canDeactivate: [GuardIfEditorLockedGuard] },
      { path: 'event', component: ProfileEventComponent, data: {order: 4}, children: [
        { path: '', component: ProfileEventUpcomingComponent },
        { path: 'past', component: ProfileEventPastComponent },
      ] },
      { path: 'review', component: ProfileReviewComponent, data: {order: 5} },
    ] },

    { path: 'profile/:userid/followings', component: ProfileFollowListComponent, data: {type: 'following'}},

    { path: 'profile/:userid/new-review', component: NewReferralComponent, data: {type: 'review'}, 
      canActivate: [GuardIfNotEligbleToCreatePostGuard, GuardIfNotProfileSelectedGuard],
      canDeactivate: [GuardIfNewReferralIncompletedGuard]
    },
    { path: 'profile/:userid/new-recommend', component: NewReferralComponent, data: {type: 'recommend'}, 
      canActivate: [GuardIfNotEligbleToCreatePostGuard, GuardIfNotProfileSelectedGuard],
      canDeactivate: [GuardIfNewReferralIncompletedGuard]
    },

    { path: 'content/:postid', component: PageComponent },
    // { path: 'note/:postid', component: PageComponent, data: {contentType: 'note'} },
    // { path: 'event/:postid', component: PageComponent, data: {contentType: 'event'} },
    // { path: 'article/:postid', component: PageComponent, data: {contentType: 'article'} },
    { path: 'content', pathMatch: 'full', redirectTo: 'feed' },

    { path: 'drafts', component: DraftsComponent, canActivate: [GuardIfNotEligbleToCreatePostGuard] },

    { path: 'editor/article', component: EditorComponent, data: {type: 'article'},  canActivate: [GuardIfNotEligbleToCreatePostGuard], canDeactivate: [GuardIfEditorLockedGuard]},
    { path: 'editor/event', component: EditorComponent, data: {type: 'event'},  canActivate: [GuardIfNotEligbleToCreatePostGuard], canDeactivate: [GuardIfEditorLockedGuard]},
    { path: 'editor/article/:id', component: EditorComponent, data: {type: 'article'},  canActivate: [GuardIfNotEligbleToCreatePostGuard, GuardIfDataNotSetGuard], canDeactivate: [GuardIfEditorLockedGuard]},
    { path: 'editor/event/:id', component: EditorComponent, data: {type: 'event'},  canActivate: [GuardIfNotEligbleToCreatePostGuard, GuardIfDataNotSetGuard], canDeactivate: [GuardIfEditorLockedGuard]},    
    { path: 'editor', redirectTo: 'editor/article' },

    { path: 'notification', component: NotificationComponent, canActivate: [GuardIfNotLoggedInGuard], },

    { path: 'followings', redirectTo: '/dashboard/follow/followings'},
    { path: 'followers',  redirectTo: '/dashboard/follow/followers'},

    { path: '', component: HomeComponent, children: [
      { path: ':taxonomyType', component: ListComponent },
      { path: ':taxonomyType/:topicId', component: ListComponent },  

      { path: '', pathMatch: 'full', redirectTo: 'feed', },
    ]},
  ]},

];


@NgModule({
  declarations: [
    HomeComponent,
    ListComponent, 
    PageComponent, 
    CardSubscribeComponent, 
    ModalEventComponent, 
    CardNewPostComponent, 
    EditorComponent,
    BaseComponent,
    ProfileComponent,
    ProfileAboutComponent,
    ProfileReviewComponent,
    ProfileServiceComponent,
    ProfileFeedComponent,
    NotificationComponent,
    DraftsComponent,
    ProfileContactComponent,
    // FollowListComponent,
    ProfileFollowListComponent,
    NewReferralComponent,
    ModalVoiceRecorderComponent,
    ProfilePromotionComponent,
    CardNewPromoComponent,
    ProfileEventComponent,
    ProfileEventUpcomingComponent,
    ProfileEventPastComponent,
  ],
  providers: [
    CategoryService,
    StripeService,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    AuthModule,
    SocialItemsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCbRhC6h9Pp43-5t_Knyrd_ewAdLMIJtCg',
      libraries: ['places']
    }),
    NgxStripeModule.forRoot(environment.config.stripeKey),
    RouterModule.forChild(routes),
    QuillModule.forRoot( {formats: ['bold', 'italic', 'underline', 'header', 'list', 'link', 'image', 'video', 'code-block']}),
  ]
})
export class SocialModule { }
