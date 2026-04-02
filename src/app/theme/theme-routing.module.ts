import { NgModule } from '@angular/core';
import { CanActivate, Routes, RouterModule, CanActivateChild } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

import { ThankuPageComponent } from './thanku-page/thanku-page.component';

const routes: Routes = [

  {
    path: '',
    component: LayoutComponent,
    children: [

      {
        path: '',
        loadChildren: () => import('../home/home.module').then(m => m.HomeModule)
      },

      // { path: 'community', loadChildren: () => SocialModule },
      // {
      //   path: 'auth',
      //   loadChildren: () => AuthModule,
      // },
      {
        path: 'dashboard-old',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        // CanActivate: [AuthGuard]
      },


      // {
      //   path: 'subscriptionplan',
      //   component: SubscriptionPlanComponent
      // },

    ]
  },
  {
    path: 'thankyou',
    component: ThankuPageComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThemeRoutingModule { }
