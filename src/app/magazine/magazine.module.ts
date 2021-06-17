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
import { HeaderMenuSmComponent } from './header-menu-sm/header-menu-sm.component';

const routes = [
  {path: '',             component: HomeComponent},
  {path: 'menu',         component: HeaderMenuSmComponent},
  {path: 'category/:id', component: ListComponent},
  {path: 'tag/:id',      component: ListComponent},
  {path: 'category',     redirectTo: ''},
  {path: 'tag',          redirectTo: ''},
  {path: ':id',          component: PageComponent},
]

@NgModule({
  declarations: [
    HomeComponent,
    ListComponent,
    CardPostComponent,
    PageComponent,
    SectionSubscriptionComponent,
    SectionSignupComponent,
    HeaderMenuSmComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  exports: [
    RouterModule
  ],
})
export class MagazineModule { }
