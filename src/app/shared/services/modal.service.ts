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

  private _data: any
  get data() { return this._data; }

  get currentPathAndQueryParams():[string, Params] { return this._getPathAndQueryParams();}

  public show(id: string, data?: any) {
    const [path, queryParams] = this._getPathAndQueryParams();
    queryParams.modal = id;
    if(data) {
      queryParams['modal-data'] = data._id;
    }
    this._data = data;
    this._router.navigate([path], {queryParams: queryParams});
  }

  public hide(goNext: boolean = false, routeNext: string[] = null, paramsNext: Params = null) {
    if(goNext) {
      this.goNext(routeNext, paramsNext);
    } else {
      this.goBack();
    }
  }

  private goBack() {
    this._data = null;
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      this.goNext();
    } else {
      this._location.back();
    }
  }

  private goNext(routeNext: string[] = null, paramsNext: Params = null) {
    this._data = null;
    if(routeNext) {
      this._router.navigate(routeNext, {replaceUrl: true, queryParams: paramsNext});
    } else {
      const [path, queryParams] = this._getPathAndQueryParams();
      queryParams.modal = null;
      queryParams['modal-data'] = null;
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
