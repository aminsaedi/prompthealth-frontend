import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NewReferralComponent } from './new-referral/new-referral.component';
import { SocialService } from './social.service';

@Injectable({
  providedIn: 'root'
})
export class GuardIfNotProfileSelectedGuard implements CanActivate {

  constructor(
    private _socialService: SocialService,
    private _router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {

    let selectedProfile: any;
    if(typeof next.component != 'string' && next.component.name == 'NewReferralComponent') {
      selectedProfile = this._socialService.selectedProfileForReferral;
    } else {
      selectedProfile = this._socialService.selectedProfile;
    }

    if(!!selectedProfile) {
      return true;
    } else {
      this._router.navigate(['/community/feed']);
    }  
  }
}
