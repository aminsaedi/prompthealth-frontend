import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThemeModule } from './theme/theme.module';
import { HttpClientModule } from '@angular/common/http';

//Bootstrap
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { ModalModule } from "ngx-bootstrap/modal";
import { SocialModule } from './social/social.module';
import { AuthModule } from './auth/auth.module';


const routes: Routes = [
  {
    path: 'community',
    loadChildren: () => SocialModule,
  },
  { path: 'auth', 
    loadChildren: () => AuthModule,
  },

  { path: 'reset-password/:token', redirectTo: 'auth/reset-password/:token'},

  {
    path: '',
    loadChildren: () => ThemeModule
  },
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
