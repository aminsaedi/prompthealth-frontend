import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { CardPostComponent } from './card-post/card-post.component';
import { SharedModule } from '../shared/shared.module';
import { PageComponent } from './page/page.component';
import { SectionSubscriptionComponent } from './section-subscription/section-subscription.component';
import { SectionSignupComponent } from './section-signup/section-signup.component';
import { MenuSmComponent } from './menu-sm/menu-sm.component';
import { ListGeneralComponent } from './list-general/list-general.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes = [
  {path: '',                      component: HomeComponent},
  {path: 'menu',                  component: MenuSmComponent},
  {path: 'category/:id',          component: ListComponent, data: {taxonomyType: 'category'}},
  {path: 'category/:id/:page',    component: ListComponent, data: {taxonomyType: 'category'}},
  {path: 'tag/:id',               component: ListComponent, data: {taxonomyType: 'tag'}},
  {path: 'tag/:id/:page',         component: ListComponent, data: {taxonomyType: 'tag'}},
  {path: 'media-type/:id',        component: ListComponent, data: {taxonomyType: 'media'}},
  {path: 'media-type/:id/:page',  component: ListComponent, data: {taxonomyType: 'media'}},
  {path: 'category',     redirectTo: ''},
  {path: 'tag',          redirectTo: ''},
  {path: ':slug',                 component: PageComponent},
]

@NgModule({
  declarations: [
    HomeComponent,
    ListComponent,
    CardPostComponent,
    PageComponent,
    SectionSubscriptionComponent,
    SectionSignupComponent,
    MenuSmComponent,
    ListGeneralComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  exports: [
    RouterModule
  ],
})
export class MagazineModule { }
