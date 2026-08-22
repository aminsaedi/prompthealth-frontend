import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { GuardIfNotLoggedInGuard } from './auth/guard-if-not-logged-in.guard';

const routes: Routes = [
  { path: 'community', loadChildren: () => import('./social/social.module').then(m => m.SocialModule), },

  { path: 'dashboard', loadChildren: () => import('./dashboard2/dashboard2.module').then(m => m.Dashboard2Module) },

  /* The link manager is a section of its own rather than a page inside the
   * dashboard: it needs the full width of the window, and its four pages are
   * addressable one by one. */
  { path: 'link-admin', loadChildren: () => import('./link-admin/link-admin.module').then(m => m.LinkAdminModule), canActivate: [GuardIfNotLoggedInGuard] },

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
