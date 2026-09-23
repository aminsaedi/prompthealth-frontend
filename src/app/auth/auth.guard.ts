import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { UniversalService } from "../shared/services/universal.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private _uService: UniversalService, private _router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const token = this._uService.localStorage.getItem("token");
    if (token) {
      this._router.navigate(["/"]);
      return false;
    }

    const authType = next.data ? next.data.authType : null;
    if (authType == "signin") {
      return true;
    }

    const params = next.params;
    const role = (params && params.type ? params.type : "u").toUpperCase();

    switch (role) {
      /* Company accounts are no longer opened from the site (2026-09): partners
       * are set up by PromptHealth after a conversation. The API refuses the
       * role too (user/register.js, oauth/signup.js, oauth/login.js); this is
       * the polite half. */
      case 'P':
        return this._router.parseUrl('/contact-us');
      /* A provider profile is free and nothing is bought at sign-up any more.
       * The old rule, pick a plan on /plans first, only bounced every Create
       * Free Profile link on /for-practitioners back to /plans, while the
       * "null" plan /plans stored let a company through. */
      case 'U':
      case 'SP':
      case 'C':
        return true;
      default:
        return this._router.parseUrl('/auth/registration/u');
    }
  }
}
