import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeModule } from '../home/home.module';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './../home/home.component';
import { DashboardModule } from '../dashboard/dashboard.module';

import { ThankuPageComponent } from './thanku-page/thanku-page.component';
import { MagazineModule } from '../magazine/magazine.module';

const routes: Routes = [

  {
    path: '',
    component: LayoutComponent,
    children: [

      {
        path: '',
        component: HomeComponent,
      },
      {
        path: '',
        loadChildren: () => HomeModule
      },
      
      {
        path: 'magazines',
        loadChildren: () => MagazineModule,
      },

      {
        path: 'dashboard-old',
        loadChildren: () => DashboardModule,
      },

    ]
  },
  {
    path: 'thankyou',
    component: ThankuPageComponent
  },
  {
    path: '**',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThemeRoutingModule { }
