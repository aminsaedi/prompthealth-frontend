import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { UniversalService } from '../shared/services/universal.service';
import { AuthService } from './auth.service';

// import decode from 'jwt-decode';
@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(
    public auth: AuthService, 
    public router: Router,
    private _uService: UniversalService,
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data.expectedRole;
    if(this._uService.isServer){
      this.router.navigate(['/']);
      return false;
    }else{

      // const token = this._uService.localStorage.getItem('token');
      if (
        !this.auth.isAuthenticated() || expectedRole
      ) {
        this.router.navigate(['/']);
        return false;
      }
      return true;
  
    }

    // decode the token to get its payload
    // const tokenPayload = decode(token);
  }
}