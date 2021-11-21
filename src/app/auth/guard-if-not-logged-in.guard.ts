import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { LoginStatusType, ProfileManagementService } from '../shared/services/profile-management.service';

@Injectable({
  providedIn: 'root'
})
export class GuardIfNotLoggedInGuard implements CanActivate {

  constructor(
    private _profileService: ProfileManagementService,
    private _router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> | boolean
  {    
    let loginStatus = this._profileService.loginStatus;
    if(loginStatus == 'notChecked' || loginStatus == 'loggingIn') {
      return new Promise((resolve, reject) => {
        const subscription = this._profileService.loginStatusChanged().subscribe(status => {
          if(status == 'loggedIn' || status == 'notLoggedIn') {
            subscription.unsubscribe();
            const isValidated = this.validate(status);
            if(isValidated) {
              resolve(true);
            } else {
              this.guard(state);
              reject(false);
            }  
          }
        })  
      })
    } else {
      const isValidated = this.validate(loginStatus);
      if(isValidated) {
        return true;
      } else {
        this.guard(state);
        return false;
      }
    }
  }

  validate(loginStatus: LoginStatusType) {
    return !!(loginStatus == 'loggedIn');
  }

  guard(state: RouterStateSnapshot) {
    if(state.url.match(/\/community/)) {
      this._router.navigate(['/community/feed']);
    } else {
      this._router.navigate(['/']);
    }
  }
  
}
