import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterPartnerGuard implements CanActivate {

  constructor( private _router: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      /** would it be safer to get userdata from server instead of localstorage? */
      const user = JSON.parse(localStorage.getItem('user'));
      if( user && user.roles == 'P'){ return true; }
      else{
        this._router.navigate(['/']);
        return false;
      }
  }
  
}
