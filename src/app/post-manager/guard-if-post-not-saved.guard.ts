import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PostManagerService } from './post-manager.service';

@Injectable({
  providedIn: 'root'
})
export class GuardIfPostNotSavedGuard implements CanDeactivate<unknown> {
  constructor(
    private _postsService: PostManagerService
  ){}

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {
    
    if(this._postsService.isEditorLocked) {
      const result = window.confirm('Some data might not be saved. Are you sure to leave this page?');
      return result;
    } else {
      return true;
    }
  }
  
}
