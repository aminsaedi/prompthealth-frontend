import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { ProfileManagementService } from './profile-management.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementChildGuard implements CanActivateChild {

  constructor(
    private _managementService: ProfileManagementService,
    private _router: Router,
  ){}

  async canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree>
  {
    /** if user not logged in, false */
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('roles').toLowerCase();
    if(!userInfo){
      this._router.navigate(['/']);
      return false; 
    }
    

    /** if profile is not set, false */
    let profile: any;
    try{ profile = await this._managementService.getProfileDetail(userInfo); }
    catch(err){ console.log(err); }
    if(!profile){ 
      this._router.navigate(['/']);
      return false; 
    }

    // profile.isVipAffiliateUser = true;
        
    const urls = state.url.split('/')
    const url = urls[urls.length - 1];
    switch(url){
      case 'my-profile':
      case 'my-password':
        /** if user logged in, true */
        return true;

      case 'my-booking':
      case 'reviews-ratings':
        /** if user role is U || premium account, true */
        if(role == 'u'){ return true; }
        else if(profile.isVipAffiliateUser){ return true; }
        else if(profile.plan && profile.plan.name !== 'Basic'){ return true; }
        break;

      case 'my-favourites':
        /** if user role is U, true */
        if(role == 'u'){ return true; }
        break;

      case 'my-subscription':
      case 'my-service':
      case 'my-payment':
          /** if user role is not U, true  */
        if(role !== 'u'){ return true; }
        break;

      case 'videos-blogs':
      case 'my-social':
      case 'my-badge':
      case 'my-performance':
          /** if user role is not U && premium account, true  */
        if(role !== 'U'){
          if(profile.isVipAffiliateUser){ return true; }
          else if(profile.plan && profile.plan.name !== 'Basic'){ return true; }  
        }
        break;

      case 'my-product':
        /** if user role is C && (plan has ListProductsOption || vip user), true*/
        if(role == 'c'){
          if(profile.isVipAffiliateUser){ return true; }
          else if(profile.plan && profile.plan.ListProductsOption){ return true; }
        }
        break;

      case 'add-professionals':
        /** if user role is C && (plan has ListOfProviders || vip user), true */
        if(role == 'c'){
          if(profile.isVipAffiliateUser){ return true; }
          else if(profile.plan && profile.plan.ListOfProviders){ return true; }
        }
        break;

      case 'my-amenities':
        /** if user role is C && (plan has listAmenities || vip user), true */
        if(role == 'c'){
          if(profile.isVipAffiliateUser){ return true; }
          else if(profile.plan && profile.plan.ListAmenities){ return true; }
        }
        break;

      case 'partner-service':
      case 'partner-profile':
      case 'partner-offer':
        /** if user role is P, true */
        if(role == 'p'){ return true; }
        break;

      case 'my-affiliate': 
        /** if user vip, true */
        if(profile.isVipAffiliateUser){ return true; }
        break;
    }

    if(role == 'p'){ this._router.navigate(['/dashboard/profilemanagement/partner-profile']); }
    else{ this._router.navigate(['/dashboard/profilemanagement/my-profile']); }
    return false;
  }
}