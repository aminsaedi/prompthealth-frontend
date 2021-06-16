import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { CardPostComponent } from './card-post/card-post.component';
import { SharedModule } from '../shared/shared.module';
import { PageComponent } from './page/page.component';

const routes = [
  {path: '', component: HomeComponent},
  {path: ':id', component: PageComponent},
]

@NgModule({
  declarations: [
    HomeComponent,
    ListComponent,
    CardPostComponent,
    PageComponent
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
