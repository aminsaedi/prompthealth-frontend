import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { EditorService } from './editor.service';

@Injectable({
  providedIn: 'root'
})
export class GuardIfEditorLockedGuard implements CanDeactivate<unknown> {
  constructor(
    private _editorService: EditorService,
  ) {}

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {
    if(this._editorService.isEditorLocked) {
      const result = window.confirm('Some data might not be saved. Are you sure to leave this page?');
      if(result) {
        this._editorService.unlockEditor();
      }
      return result;
    } else {
      return true;
    }
  }
  
}
