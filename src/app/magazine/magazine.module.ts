import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

import { ListComponent } from './list/list.component';
import { CardPostComponent } from './card-post/card-post.component';
import { SharedModule } from '../shared/shared.module';
import { PageComponent } from './page/page.component';
import { SectionSubscriptionComponent } from './section-subscription/section-subscription.component';
import { SectionSignupComponent } from './section-signup/section-signup.component';
import { MenuSmComponent } from './menu-sm/menu-sm.component';
import { ListGeneralComponent } from './list-general/list-general.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailPostComponent } from './detail-post/detail-post.component';
import { ListEventComponent } from './list-event/list-event.component';
import { CardEventComponent } from './card-event/card-event.component';

const routes = [
  {path: '',                      component: HomeComponent},
  {path: 'menu',                  component: MenuSmComponent},
  {path: 'category/:slug',        component: ListComponent, data: {taxonomyType: 'category'}},
  {path: 'category/:slug/:page',  component: ListComponent, data: {taxonomyType: 'category'}},
  {path: 'tag/:slug',             component: ListComponent, data: {taxonomyType: 'tag'}},
  {path: 'tag/:slug/:page',       component: ListComponent, data: {taxonomyType: 'tag'}},
  {path: 'video',                 component: ListComponent, data: {taxonomyType: 'video'}},
  {path: 'video/:page',           component: ListComponent, data: {taxonomyType: 'video'}},
  {path: 'podcast',               component: ListComponent, data: {taxonomyType: 'podcast'}},
  {path: 'podcast/:page',         component: ListComponent, data: {taxonomyType: 'podcast'}},  
  {path: 'category',     redirectTo: ''},  
  {path: 'tag',          redirectTo: ''},

  {path: '_review/:id',           component: PageComponent, data: {mode: 'review'} },
  {path: ':slug',                 component: PageComponent, data: {mode: 'view'} },
];

@NgModule({
  declarations: [
    HomeComponent,
    ListComponent,
    CardPostComponent,
    PageComponent,
    SectionSubscriptionComponent,
    SectionSignupComponent,
    MenuSmComponent,
    ListGeneralComponent,
    DetailPostComponent,
    ListEventComponent,
    CardEventComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    NgbModule,
  ],
  exports: [
    RouterModule
  ],
})
export class MagazineModule { }
