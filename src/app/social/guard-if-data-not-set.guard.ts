import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EditorService } from './editor.service';

@Injectable({
  providedIn: 'root'
})
export class GuardIfDataNotSetGuard implements CanActivate {
  constructor(
    private _editorService: EditorService,
    private _router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {
    if(this._editorService.existsData) {
      return true;
    } else {
      this._router.navigate(['/community/drafts']);
      return false;
    }
  }
  
}
