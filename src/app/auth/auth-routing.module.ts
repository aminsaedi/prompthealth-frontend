import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleGuardService as RoleGuard } from '../auth/role-guard.service';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegistrationComponent } from './registration/registration.component';
import { AuthGuard } from './auth.guard';
import { AuthComponent } from './auth/auth.component';

const routes: Routes = [
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  { path: 'registration', redirectTo: 'registration/u' },
  { path: 'registration/:type', component: AuthComponent, canActivate: [AuthGuard], data: {authType: 'signup'}, },
  
  { path: 'login', component: AuthComponent, canActivate: [AuthGuard], data: {authType: 'signin'}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
