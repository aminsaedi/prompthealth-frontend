import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { LoginStatusType, ProfileManagementService } from '../dashboard/profileManagement/profile-management.service';

@Injectable({
  providedIn: 'root'
})
export class GuardIfNotEligbleToCreatePostGuard implements CanActivate {
  
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
              this.guard();
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
        this.guard();
        return false;
      }
    }
  }

  validate(loginStatus: LoginStatusType) {
    if(loginStatus == 'loggedIn' && this._profileService.profile.role != 'U') {
      return true;
    } else {
      return false;
    }
  }
  
  guard() {
    this._router.navigate(['/community/feed']);
  }
}
