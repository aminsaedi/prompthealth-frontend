import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { NewReferralComponent } from './social/new-referral/new-referral.component';

@Injectable({
  providedIn: 'root'
})
export class GuardIfNewReferralIncompletedGuard implements CanDeactivate<unknown> {
  canDeactivate(
    component: NewReferralComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {
    if(component.isLocked) {
      const result = window.confirm('Some data might not be saved. Are you sure to leave this page?');
      return !!result;
    } else {
      return true;
    }
  }
  
}
