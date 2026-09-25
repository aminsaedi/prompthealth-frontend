import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeRoutingModule } from './theme-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout/layout.component';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AuthService } from '../auth/auth.service';
import { AuthGuardService } from '../auth/auth-gaurd.service';
import { RoleGuardService } from '../auth/role-guard.service';
import { ThankuPageComponent } from './thanku-page/thanku-page.component';
import { DashboardMenuComponent } from './dashboard-menu/dashboard-menu.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    ThankuPageComponent,
    DashboardMenuComponent,
  ],
  providers: [
    AuthService,
    AuthGuardService,
    RoleGuardService,
  ],
  imports: [
    CommonModule,
    ThemeRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    ModalModule.forRoot()
  ]
})
export class ThemeModule { }
