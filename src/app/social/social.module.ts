import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { RouterModule, Routes } from '@angular/router';
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


const routes: Routes = [
  { path: 'create/article', component: EditorComponent, data: {type: 'article'}, canDeactivate: [GuardIfEditorLockedGuard] },
  { path: 'create/event', component: EditorComponent, data: {type: 'event'}, canDeactivate: [GuardIfEditorLockedGuard] },
  { path: 'create', redirectTo: 'create/article' },

  { path: '', component: HomeComponent, children: [

    { path: 'feed',     component: ListComponent },
    { path: 'article',  component: ListComponent },
    { path: 'media',    component: ListComponent },
    { path: 'event',    component: ListComponent },
    { path: 'feed/:topicId',     component: ListComponent },
    { path: 'article/:topicId',  component: ListComponent },
    { path: 'media/:topicId',    component: ListComponent },
    { path: 'event/:topicId',    component: ListComponent },
    { path: '', redirectTo: 'feed', },
  ]},

  { path: ':userid' },
  { path: ':userid/post/:postid', component: PageComponent },
  { path: ':userid/post', redirectTo: ':userid' },
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
  ],
  providers: [
    CategoryService,
    StripeService,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxStripeModule.forRoot(environment.config.stripeKey),
    RouterModule.forChild(routes),
    QuillModule.forRoot(),
  ]
})
export class SocialModule { }
