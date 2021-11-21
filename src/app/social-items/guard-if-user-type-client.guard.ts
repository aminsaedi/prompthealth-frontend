import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginStatusType, ProfileManagementService } from '../shared/services/profile-management.service';

@Injectable({
  providedIn: 'root'
})
export class GuardIfUserTypeClientGuard implements CanActivate {

  constructor(
    private _profileService: ProfileManagementService,
    private _router: Router,
  ){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

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
    return (loginStatus == 'loggedIn' && !this._profileService.profile.isU);
  }

  guard() {
    this._router.navigate(['/community/feed']);
  }
}
