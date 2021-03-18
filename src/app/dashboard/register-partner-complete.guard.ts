import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RegisterQuestionnaireService } from './register-questionnaire.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterPartnerCompleteGuard implements CanActivate {

  constructor(
    private _qService: RegisterQuestionnaireService,
    private _router: Router,
  ){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if(this._qService.isCompleted){ return true; }
    else{
      this._router.navigate(['/']);
      return false;
    }
  }
  
}
