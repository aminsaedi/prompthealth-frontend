import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from '../auth/auth.module';
import { CardNotificationComponent } from './card-notification/card-notification.component';
import { RouterModule } from '@angular/router';
import { CardComponent } from './card/card.component';
import { CardItemNoteComponent } from './card-item-note/card-item-note.component';
import { CardItemArticleComponent } from './card-item-article/card-item-article.component';
import { CardItemEventComponent } from './card-item-event/card-item-event.component';
import { CardItemPromoComponent } from './card-item-promo/card-item-promo.component';
import { CardItemEyecatchComponent } from './card-item-eyecatch/card-item-eyecatch.component';
import { CardItemCommentComponent } from './card-item-comment/card-item-comment.component';
import { CardItemToolbarComponent } from './card-item-toolbar/card-item-toolbar.component';
import { CardPostDraftComponent } from './card-post-draft/card-post-draft.component';
import { FormItemCommentComponent } from './form-item-comment/form-item-comment.component';
import { PopupPostMenuComponent } from './popup-post-menu/popup-post-menu.component';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { QuillModule } from 'ngx-quill';



@NgModule({
  declarations: [
    HeaderComponent,
    CardComponent,
    CardPostDraftComponent,
    CardItemNoteComponent,
    CardItemArticleComponent,
    CardItemEventComponent,
    CardItemPromoComponent,
    CardItemEyecatchComponent,
    CardItemToolbarComponent,
    CardItemCommentComponent,
    CardNotificationComponent,
    FormItemCommentComponent,
    PopupPostMenuComponent,
    AudioPlayerComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AuthModule,
    QuillModule.forRoot( {formats: ['bold', 'italic', 'underline', 'header', 'list', 'link', 'image', 'video', 'code-block']}),
  ],
  exports: [
    HeaderComponent,
    CardComponent,
    CardPostDraftComponent,
    CardItemNoteComponent,
    CardItemArticleComponent,
    CardItemEventComponent,
    CardItemPromoComponent,
    CardItemEyecatchComponent,
    CardItemToolbarComponent,
    CardItemCommentComponent,
    CardNotificationComponent,
    FormItemCommentComponent,
    PopupPostMenuComponent,
    AudioPlayerComponent,
  ]
})
export class SocialItemsModule { }
