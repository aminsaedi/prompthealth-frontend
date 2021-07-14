import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { PageComponent } from './page/page.component';
import { CardItemToolbarComponent } from './card-item-toolbar/card-item-toolbar.component';
import { CardItemHeaderComponent } from './card-item-header/card-item-header.component';
import { CardComponent } from './card/card.component';
import { SharedModule } from '../shared/shared.module';
import { CardSubscribeComponent } from './card-subscribe/card-subscribe.component';
import { CardEventComponent } from './card-event/card-event.component';
import { ModalEventComponent } from './modal-event/modal-event.component';
import { CardItemHeaderEventComponent } from './card-item-header-event/card-item-header-event.component';
import { CardPostComponent } from './card-post/card-post.component';
import { CardItemEyecatchComponent } from './card-item-eyecatch/card-item-eyecatch.component';
import { CardArticleComponent } from './card-article/card-article.component';

const routes = [
  { path: '', component: HomeComponent },
  
  { path: 'type/:taxonomyType', component: HomeComponent },
  { path: 'type/:taxonomyType/:topicId', component: HomeComponent },
  { path: 'type', redirectTo: '' },

  { path: ':userid' },
  { path: ':userid/post/:postid', component: PageComponent },
  { path: ':userid/post', redirectTo: ':userid' },
];

@NgModule({
  declarations: [HomeComponent, PageComponent, CardItemToolbarComponent, CardItemHeaderComponent, CardComponent, CardSubscribeComponent, CardEventComponent, ModalEventComponent, CardItemHeaderEventComponent, CardPostComponent, CardItemEyecatchComponent, CardArticleComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ], exports: [
    RouterModule,
  ]
})
export class SocialModule { }
