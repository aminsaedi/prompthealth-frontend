import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { IGetSocialContentResult } from '../models/response-data';
import { ISocialPost } from '../models/social-post';
import { ProfileManagementService } from '../shared/services/profile-management.service';
import { SharedService } from '../shared/services/shared.service';
import { EditorService } from './editor.service';

/* The editor for an existing post needs that post. Clicking Edit hands it over
 * through EditorService, but a pasted or reloaded /community/editor/article/<id>
 * arrives with nothing, and used to be sent to the drafts list, so an
 * administrator had no way to open someone else's article from its address.
 * Such a visit now loads the post itself, and opens it for its author or an
 * administrator only. The server decides what a save may change; this only
 * decides whether the form opens. */
@Injectable({
  providedIn: 'root'
})
export class GuardIfDataNotSetGuard implements CanActivate {
  constructor(
    private _editorService: EditorService,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {
    const id: string = next.params.id;
    const data = this._editorService.originalData;
    if (data && (!id || data._id == id)) {
      return true;
    }
    if (!id || !/^[0-9a-f]{24}$/i.test(id)) {
      return this._router.parseUrl('/community/drafts');
    }
    return this.loadPost(id, next.data.type);
  }

  private async loadPost(id: string, type: string): Promise<boolean | UrlTree> {
    const drafts = this._router.parseUrl('/community/drafts');

    /* The sign-in check is asynchronous on a fresh load. Nobody signed in is
     * left to GuardIfNotEligibleToAcessEditorGuard, which sends them away. */
    const status = await this.settledLoginStatus();
    const user = this._profileService.profile;
    if (status != 'loggedIn' || !user) {
      return false;
    }

    let post: ISocialPost;
    try {
      const res = await this._sharedService.get('note/' + id).pipe(take(1)).toPromise() as IGetSocialContentResult;
      post = res && res.statusCode === 200 && res.data && res.data._id ? res.data : null;
    } catch (error) {
      post = null;
    }

    const expectedType = type == 'event' ? 'EVENT' : 'ARTICLE';
    if (!post || post.contentType != expectedType) {
      return drafts;
    }

    const author: any = post.author || post.authorId;
    const authorId = typeof author == 'string' ? author : author && author._id;
    if (!user.isSA && authorId != user._id) {
      return drafts;
    }

    this._editorService.setData(post);
    return true;
  }

  private settledLoginStatus(): Promise<string> {
    const status = this._profileService.loginStatus;
    if (status == 'loggedIn' || status == 'notLoggedIn') {
      return Promise.resolve(status);
    }
    return this._profileService.loginStatusChanged().pipe(
      filter(s => s == 'loggedIn' || s == 'notLoggedIn'),
      take(1),
    ).toPromise();
  }
}
