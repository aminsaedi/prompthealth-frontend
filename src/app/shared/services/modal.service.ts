import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Params, PRIMARY_OUTLET, Router, UrlSerializer, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private _router: Router,
    private _location: Location,
    private _urlSerializer: UrlSerializer,
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


  /* The current address as a path and a query that a caller can edit and hand
   * straight back to router.navigate([path], {queryParams}). navigate encodes
   * both, so both have to leave here decoded.
   *
   * This used to split location.path() on '&' and '=' by hand. location.path()
   * is the address as the browser holds it, percent-encoded, so every modal
   * encoded it a second time: utm_campaign=Growth%20Dentists came back as
   * Growth%2520Dentists, and the directory re-ran a search for "back pain" as
   * "back%20pain" the moment its filter opened. The path went the same way.
   * Twenty pieces of live content have a curly apostrophe or a dash in the
   * slug, held as %E2%80%99, which came back as %25E2%2580%2599: a slug that
   * does not exist, so a reader who pressed Login or Like on one of them was
   * sent to /404.
   *
   * The serializer is the one the router parsed this address with, so '+'
   * reads as a space and a repeated key as an array, exactly as ActivatedRoute
   * sees them.
   *
   * It reads location.path() and not router.url because AppComponent removes
   * ?action=stripe-success with location.replaceState, which the router never
   * hears about; router.url would put it back and replay the Stripe toast on
   * the next modal. router.url is only the fallback for an address the
   * serializer refuses, where Router.parseUrl would answer with the home page. */
  private _getPathAndQueryParams(): [string, Params] {
    let tree: UrlTree;
    try {
      tree = this._urlSerializer.parse(this._location.path());
    } catch (e) {
      tree = this._urlSerializer.parse(this._router.url);
    }

    /* Decoded segments rejoined with '/', which navigate splits again. That is
     * exact here: no route uses matrix parameters or a named outlet, and the
     * slug function strips '/'. */
    const primary = tree.root.children[PRIMARY_OUTLET];
    const path = '/' + (primary ? primary.segments.map(s => s.path).join('/') : '');
    return [path, { ...tree.queryParams }];
  }
}
