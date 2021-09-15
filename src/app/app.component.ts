import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivationStart, NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { UniversalService } from './shared/services/universal.service';
import { BehaviorService } from './shared/services/behavior.service';
import { SharedService } from './shared/services/shared.service';

declare let gtag: Function;
declare let fbq: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private _uService: UniversalService,
    private _bService: BehaviorService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _location: Location,
  ) { }

  private disableAnalytics: boolean = environment.config.disableAnalytics;

  async ngOnInit() {
    if (!this._uService.isServer) {
      this._router.events.subscribe((event: NavigationEnd) => {
        this.onRouteChanged(event);
      });

      this._route.queryParams.subscribe((params: IAppQueryParams) => {
        const paramsCopy = JSON.parse(JSON.stringify(params));

        if (params && params.action) {
          switch (params.action) {
            case 'stripe-success':
            case 'stripe-cancel':
              this.onRedirectFromStripe(paramsCopy);
              break;
          }
        }
      });

      // try { await this.getPosition(); }
      // catch(error){ console.log(error); }
    }
  }

  onRedirectFromStripe(params: { [k: string]: any }) {
    if (!this._uService.isServer) {
      if (params.action == 'stripe-success') {
        this._toastr.success('Thank you for subscribing our premium plan!');
      } else if (params.action == 'stripe-cancel') {
        this._toastr.error('You haven\'t completed subscribing plan.');
      }

      params.action = null;
      const paramList = [];
      for (let key in params) {
        if (params[key]) {
          paramList.push(key += '=' + params[key]);
        }
      }

      this._location.replaceState(location.pathname, (paramList.length > 0) ? '?' + paramList.join('&') : '');
    }
  }

  onRouteChanged(event: NavigationEnd | ActivationStart) {
    if (event instanceof NavigationEnd) {
      /** google analytics */
      if (!this.disableAnalytics) {
        gtag('config', 'UA-192757039-1', {
          page_path: event.urlAfterRedirects
        });

        if (!window.location.href.match(/keyword/)) {
          fbq('track', 'PageView');
        }
      }
    }
  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {
        resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });

        localStorage.setItem('ipLat', resp.coords.latitude.toString());
        localStorage.setItem('ipLong', resp.coords.longitude.toString());
      },
        err => {
          reject(err);
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 1000000 });
    });

  }
}


interface IAppQueryParams {
  action?: 'stripe-cancel' | 'stripe-success';
}
