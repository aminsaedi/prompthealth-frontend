import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { LoginStatusType, ProfileManagementService } from '../shared/services/profile-management.service';

@Injectable({
  providedIn: 'root'
})
export class GuardIfNotEligibleToAcessEditorGuard implements CanActivate {
  
  constructor(
    private _profileService: ProfileManagementService,
    private _router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> | boolean
  {
    const editorType = next.data.type || null;
    let loginStatus = this._profileService.loginStatus;

    if(loginStatus == 'notChecked' || loginStatus == 'loggingIn') {
      return new Promise((resolve, reject) => {
        const subscription = this._profileService.loginStatusChanged().subscribe(status => {
          if(status == 'loggedIn' || status == 'notLoggedIn') {
            subscription.unsubscribe();
            const isValidated = this.validate(status, editorType);
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
      const isValidated = this.validate(loginStatus, editorType);
      if(isValidated) {
        return true;
      } else {
        this.guard();
        return false;
      }
    }
  }

  validate(loginStatus: LoginStatusType, editorType?: 'article' | 'event' | 'promo' | 'note' | 'review' | 'recommend') {
    let isValidated = false;

    if(loginStatus == 'loggedIn') {
      const user = this._profileService.profile;
      switch (editorType) {
        case 'article': isValidated = user.isEligibleToCreateArticle; break;
        case 'event': isValidated = user.isEligibleToCreateEvent; break;
        case 'note': isValidated = user.isEligibleToCreateNote; break; //not used for now nor being tested
        case 'promo': isValidated = user.isEligibleToCreatePromo; break; //not used for now nor being tested
        case 'recommend': isValidated = user.eligibleToRecommend; break;
        case 'review': isValidated = true; break;
        default: isValidated = true;
      }
    }
    
    return isValidated;
  }
  
  guard() {
    this._router.navigate(['/community/feed']);
  }
}
