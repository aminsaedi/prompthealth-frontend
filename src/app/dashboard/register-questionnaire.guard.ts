import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterQuestionnaireGuard implements CanActivate {

  constructor( private _router: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      const user = JSON.parse(localStorage.getItem('user'));

      if(next.routeConfig.path == 'register-practitioner') {
        if(user && (user.roles == 'SP' || user.roles == 'C')) { return true; }        
      }else if(next.routeConfig.path == 'register-product') {
        if( user && user.roles == 'P') { return true; }
      }

      this._router.navigate(['/']);
      return false;
  }
  
}
