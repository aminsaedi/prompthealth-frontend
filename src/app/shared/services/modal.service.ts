import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private _router: Router,
    private _location: Location,
  ) { }

  get currentPathAndQueryParams():[string, Params] { return this._getPathAndQueryParams();}

  public show(id: string) {
    const [path, queryParams] = this._getPathAndQueryParams();
    queryParams.modal = id;
    this._router.navigate([path], {queryParams: queryParams});
  }

  public hide(goNext: boolean = false, routeNext: string[] = null) {
    if(goNext) {
      this.goNext(routeNext);
    } else {
      this.goBack();
    }
  }

  private goBack() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      this.goNext();
    } else {
      this._location.back();
    }
  }

  private goNext(routeNext: string[] = null) {
    if(routeNext) {
      this._router.navigate(routeNext, {replaceUrl: true});
    } else {
      const [path, queryParams] = this._getPathAndQueryParams();
      queryParams.modal = null;
      this._router.navigate([path], {queryParams: queryParams, replaceUrl: true});  
    }
  }


  private _getPathAndQueryParams(): [string, Params] {
    const [path, query] = this._location.path().split('?');
    const queryParams: Params = {};

    if(query) {
      const array = query.split('&');
      array.forEach(s => {
        const array = s.split('=');
        queryParams[array[0]] = array[1] || null
      });
    }

    return [path, queryParams];
  }
}
