import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

//Bootstrap
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { ModalModule } from "ngx-bootstrap/modal";


const routes: Routes = [
  { path: 'community', loadChildren: () => import('./social/social.module').then(m => m.SocialModule), },

  { path: 'dashboard', loadChildren: () => import('./dashboard2/dashboard2.module').then(m => m.Dashboard2Module) },

  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), },

  { path: 'reset-password/:token', redirectTo: 'auth/reset-password/:token'},

  { path: '', loadChildren: () => import('./theme/theme.module').then(m => m.ThemeModule) },
];

@NgModule({
  imports: [
    BsDropdownModule.forRoot(),
    HttpClientModule,
    ModalModule.forRoot(),
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    TooltipModule.forRoot(),
  ],
  exports: [
    BsDropdownModule,
    HttpClientModule,
    ModalModule,
    RouterModule,
    TooltipModule,
  ]
})
export class AppRoutingModule { }
