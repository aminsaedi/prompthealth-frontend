import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IDefaultPlan } from '../models/default-plan';
import { UniversalService } from '../shared/services/universal.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _uService: UniversalService,
    private _router: Router,
  ){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {
    const token = this._uService.localStorage.getItem('token');
    if(token) {
      this._router.navigate(['/']);
      return false;
    }

    const authType = next.data ? next.data.authType : null;
    if(authType == 'signin') {
      return true;
    }

    const params = next.params;
    const role = ((params && params.type) ? params.type : 'u').toUpperCase();

    /** U can access to register page always  */
    /** SP / C / P can access to register page ONLY IF eligible default plan is already selected */
    switch(role) {
      case 'U':
        return true;
      default:
        const eligiblePlanSelected = this.eligiblePlanSelected(role);
        if(eligiblePlanSelected) {
          return true;
        } else {
          const route = ['plans'];
          if(role == 'P') {
            route.push('product');
          }
          this._router.navigate(route);
          return false;
        } 
    }
  }

  eligiblePlanSelected(role: string) {
    const ss = this._uService.sessionStorage;
    const planStr = ss.getItem('selectedPlan');
    if(!planStr) {
      return false;
    } else {
      const plan: IDefaultPlan = JSON.parse(planStr);
      if(plan.userType.includes(role)) {
        return true;
      } else {
        ss.removeItem('selectedPlan');
        ss.removeItem('selectedMonthly');
        return false;
      }
    }
  }
  
}
