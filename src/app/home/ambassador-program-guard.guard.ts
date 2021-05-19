import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IUserDetail } from '../models/user-detail';
import { UniversalService } from '../shared/services/universal.service';

@Injectable({
  providedIn: 'root'
})
export class AmbassadorProgramGuardGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _uService: UniversalService,
  ){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {
    const lsUser: string = this._uService.localStorage.getItem('user');
    if(lsUser && (JSON.parse(lsUser) as IUserDetail).roles == 'U') {
      this._router.navigate(['/']);
      return false;
    }else{
      return true;
    }
  }
  
}
