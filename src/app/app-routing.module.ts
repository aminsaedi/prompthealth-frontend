import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  { path: 'community', loadChildren: () => import('./social/social.module').then(m => m.SocialModule), },

  { path: 'dashboard', loadChildren: () => import('./dashboard2/dashboard2.module').then(m => m.Dashboard2Module) },

  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), },

  { path: 'reset-password/:token', redirectTo: 'auth/reset-password/:token'},

  { path: '', loadChildren: () => import('./theme/theme.module').then(m => m.ThemeModule) },
];

@NgModule({
  imports: [
    HttpClientModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
  ],
  exports: [
    HttpClientModule,
    RouterModule,
  ]
})
export class AppRoutingModule { }
