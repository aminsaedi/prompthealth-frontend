import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { RouterModule, Routes, Route } from '@angular/router';
import { PageComponent } from './page/page.component';
import { CardItemToolbarComponent } from './card-item-toolbar/card-item-toolbar.component';
import { CardItemHeaderComponent } from './card-item-header/card-item-header.component';
import { CardComponent } from './card/card.component';
import { SharedModule } from '../shared/shared.module';
import { CardSubscribeComponent } from './card-subscribe/card-subscribe.component';
import { CardItemEventComponent } from './card-item-event/card-item-event.component';
import { ModalEventComponent } from './modal-event/modal-event.component';
import { CardItemHeaderEventComponent } from './card-item-header-event/card-item-header-event.component';
import { CardItemPostComponent } from './card-item-post/card-item-post.component';
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


const routes: Routes = [
  { path: '', component: BaseComponent, children: [
    { path: 'profile/:userid/post/:slug', component: PageComponent },
    { path: 'profile/:userid/post', pathMatch: 'full', redirectTo: 'profile/:userid/' },

    { path: 'create/article', component: EditorComponent, data: {type: 'article'}, canActivate: [GuardIfNotEligbleToCreatePostGuard], canDeactivate: [GuardIfEditorLockedGuard] },
    { path: 'create/event', component: EditorComponent, data: {type: 'event'}, canActivate: [GuardIfNotEligbleToCreatePostGuard], canDeactivate: [GuardIfEditorLockedGuard] },
    { path: 'create', redirectTo: 'create/article' },

    { path: 'notification', component: NotificationComponent},

    { path: '', component: HomeComponent, children: [
      { path: 'profile/:userid', component: ProfileComponent, children: [
        { path: '', component: ProfileAboutComponent, data: {order: 1} } ,
        { path: 'service', component: ProfileServiceComponent, data: {order:2} } ,
        { path: 'feed', component: ProfileFeedComponent, data: {order: 3} },
        { path: 'review', component: ProfileReviewComponent, data: {order: 4} },
      ] },

      { path: ':taxonomyType', component: ListComponent },
      { path: ':taxonomyType/:topiId', component: ListComponent },  

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
    CardItemHeaderComponent, 
    CardComponent, 
    CardSubscribeComponent, 
    CardItemEventComponent, 
    ModalEventComponent, 
    CardItemHeaderEventComponent, 
    CardItemPostComponent, 
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
