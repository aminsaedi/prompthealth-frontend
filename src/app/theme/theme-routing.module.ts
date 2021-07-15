import { NgModule } from '@angular/core';
import { CanActivate, Routes, RouterModule, CanActivateChild } from '@angular/router';
import { HomeModule } from '../home/home.module';
import { AuthModule } from '../auth/auth.module';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './../home/home.component';
import { DashboardModule } from '../dashboard/dashboard.module';

// import { SubscriptionPlanComponent } from '../home/subscription-plan/subscription-plan.component';
import { AuthGuardService as AuthGuard } from '../auth/auth-gaurd.service';
import { ThankuPageComponent } from './thanku-page/thanku-page.component';
import { MagazineModule } from '../magazine/magazine.module';
import { SocialModule } from '../social/social.module';

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

      // { path: 'community', loadChildren: () => SocialModule },
      
      {
        path: 'magazines',
        loadChildren: () => MagazineModule,
      },
      {
        path: 'auth',
        loadChildren: () => AuthModule,
      },
      {
        path: 'dashboard',
        loadChildren: () => DashboardModule,
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
