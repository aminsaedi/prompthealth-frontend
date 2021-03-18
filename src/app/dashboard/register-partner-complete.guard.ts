import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RegisterQuestionnaireService } from './register-questionnaire.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterPartnerCompleteGuard implements CanActivate {

  constructor(
    private _qService: RegisterQuestionnaireService
  ){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
    return this._qService.isCompleted ? true : false;
  }
  
}
