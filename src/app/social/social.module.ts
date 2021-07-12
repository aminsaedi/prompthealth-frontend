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

const routes = [
  { path: '', component: HomeComponent },
  { path: ':id', component: PageComponent },
];

@NgModule({
  declarations: [HomeComponent, PageComponent, CardItemToolbarComponent, CardItemHeaderComponent, CardComponent, CardSubscribeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ], exports: [
    RouterModule,
  ]
})
export class SocialModule { }
