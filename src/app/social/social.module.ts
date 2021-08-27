import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { RouterModule, Routes, Route } from '@angular/router';
import { PageComponent } from './page/page.component';
import { CardItemToolbarComponent } from './card-item-toolbar/card-item-toolbar.component';
import { CardComponent } from './card/card.component';
import { SharedModule } from '../shared/shared.module';
import { CardSubscribeComponent } from './card-subscribe/card-subscribe.component';
import { CardItemEventComponent } from './card-item-event/card-item-event.component';
import { ModalEventComponent } from './modal-event/modal-event.component';
import { CardItemNoteComponent } from './card-item-note/card-item-note.component';
import { CardItemEyecatchComponent } from './card-item-eyecatch/card-item-eyecatch.component';
import { CardItemArticleComponent } from './card-item-article/card-item-article.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { CategoryService } from '../shared/services/category.service';
import { NgxStripeModule, StripeService } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { CardItemCommentComponent } from './card-item-comment/card-item-comment.component';
import { FormItemCommentComponent } from './form-item-comment/form-item-comment.component';
import { CardNewPostComponent } from './card-new-post/card-new-post.component';
import { QuillModule } from 'ngx-quill';
import { EditorComponent } from './editor/editor.component';
import { BaseComponent } from './base/base.component';
import { GuardIfEditorLockedGuard } from './guard-if-editor-locked.guard';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileAboutComponent } from './profile-about/profile-about.component';
import { LoaderComponent } from './loader/loader.component';
import { ProfileReviewComponent } from './profile-review/profile-review.component';
import { ProfileServiceComponent } from './profile-service/profile-service.component';
import { ProfileFeedComponent } from './profile-feed/profile-feed.component';
import { AuthModule } from '../auth/auth.module';
import { GuardIfNotEligbleToCreatePostGuard } from './guard-if-not-eligble-to-create-post.guard';
import { AgmCoreModule } from '@agm/core';
import { NotificationComponent } from './notification/notification.component';
import { CardNotificationComponent } from './card-notification/card-notification.component';
// import { DraftComponent } from './draft/draft.component';
import { ProfileContactComponent } from './profile-contact/profile-contact.component';
import { FollowListComponent } from './follow-list/follow-list.component';
import { ProfileFollowListComponent } from './profile-follow-list/profile-follow-list.component';
import { GuardIfNotLoggedInGuard } from '../auth/guard-if-not-logged-in.guard';


const routes: Routes = [
  { path: '', component: BaseComponent, children: [
    { path: 'profile/:userid', component: ProfileComponent, children: [
      { path: '', component: ProfileAboutComponent, data: {order: 1} } ,
      { path: 'service', component: ProfileServiceComponent, data: {order:2} } ,
      { path: 'feed', component: ProfileFeedComponent, data: {order: 3} },
      { path: 'review', component: ProfileReviewComponent, data: {order: 4} },
    ] },

    { path: 'profile/:userid/followings', component: ProfileFollowListComponent, data: {type: 'following'}},

    { path: 'profile/:userid/post/:postid', component: PageComponent },
    { path: 'profile/:userid/post', pathMatch: 'full', redirectTo: 'profile/:userid/' },

    { path: 'create/article', component: EditorComponent, data: {type: 'article'}, canActivate: [GuardIfNotEligbleToCreatePostGuard], canDeactivate: [GuardIfEditorLockedGuard] },
    { path: 'create/event', component: EditorComponent, data: {type: 'event'}, canActivate: [GuardIfNotEligbleToCreatePostGuard], canDeactivate: [GuardIfEditorLockedGuard] },
    { path: 'create', redirectTo: 'create/article' },
    // { path: 'draft', component: DraftComponent, canActivate: [GuardIfNotEligbleToCreatePostGuard] },
    { path: 'followings', component: FollowListComponent, data: {type: 'following'}, canActivate: [GuardIfNotLoggedInGuard], },
    { path: 'followers', component: FollowListComponent, data: {type: 'followed'}, canActivate: [GuardIfNotLoggedInGuard], },
    { path: 'notification', component: NotificationComponent, canActivate: [GuardIfNotLoggedInGuard], },

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
    HeaderComponent,
    ListComponent, 
    PageComponent, 
    CardItemToolbarComponent, 
    CardComponent, 
    CardSubscribeComponent, 
    CardItemEventComponent, 
    ModalEventComponent, 
    CardItemNoteComponent, 
    CardItemEyecatchComponent, 
    CardItemArticleComponent, 
    CardItemCommentComponent, 
    FormItemCommentComponent, 
    CardNewPostComponent, 
    EditorComponent,
    BaseComponent,
    AudioPlayerComponent,
    ProfileComponent,
    ProfileAboutComponent,
    LoaderComponent,
    ProfileReviewComponent,
    ProfileServiceComponent,
    ProfileFeedComponent,
    NotificationComponent,
    CardNotificationComponent,
    // DraftComponent,
    ProfileContactComponent,
    FollowListComponent,
    ProfileFollowListComponent,
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
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCbRhC6h9Pp43-5t_Knyrd_ewAdLMIJtCg',
      libraries: ['places']
    }),
    NgxStripeModule.forRoot(environment.config.stripeKey),
    RouterModule.forChild(routes),
    QuillModule.forRoot(),
  ]
})
export class SocialModule { }
