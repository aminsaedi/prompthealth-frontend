import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivationStart, NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HeaderStatusService } from './shared/services/header-status.service';
import { ToastrService } from 'ngx-toastr';
import { UniversalService } from './shared/services/universal.service';


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
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _location: Location,
    private _headerService: HeaderStatusService,
  ) {}

  private isInitial = true;
  private disableAnalytics: boolean = environment.config.disableAnalytics;
  private urlPrev: string = '';

  async ngOnInit() {
    if(!this._uService.isServer){
      this._router.events.subscribe((event: NavigationEnd) => {
        this.onRouteChanged(event);
      });

      this._route.queryParams.subscribe((params: IAppQueryParams) => {
        const paramsCopy = JSON.parse(JSON.stringify(params));
    
        if(params && params.action) {
          switch(params.action) {
            case 'stripe-success':
            case 'stripe-cancel': 
              this.onRedirectFromStripe(paramsCopy);
              break;
          }
        }
      });
      
      try { await this.getPosition(); }
      catch(error){ console.log(error); }  
    }
  }

  onRedirectFromStripe(params: {[k: string]: any}) {
    if(!this._uService.isServer) {
      if(params.action == 'stripe-success') {
        this._toastr.success('Thank you for subscribing our premium plan!');
      } else if (params.action == 'stripe-cancel') {
        this._toastr.error('You haven\'t completed subscribing plan.');
      }
    
      params.action = null;
      let paramList = [];
      for (let key in params) {
        if(params[key]) {
          paramList.push(key += '=' + params[key]);
        }
      }
      
      this._location.replaceState(location.pathname,  (paramList.length > 0) ? '?' + paramList.join('&') :'');  
    }
  }

  onRouteChanged(event: NavigationEnd | ActivationStart) {
    if (event instanceof ActivationStart) { 
      this.isInitial = false; 
      this._headerService.showShadow();
    }

    if (event instanceof NavigationEnd) {

      /** google analytics */
      if(!this.disableAnalytics){
        gtag('config', 'UA-192757039-1',{
          'page_path': event.urlAfterRedirects
        });

        if(!window.location.href.match(/keyword/)){
          fbq('track', 'PageView');  
        } 
      }

      if(event.url != '/' && event.url != '/auth/login') {
        setTimeout(()=> {
          this._headerService.showShadow();
        }, 0);
      }

      const pathPrev = this.urlPrev.replace(/\?.*$/, '');
      const pathCurrent = event.url.replace(/\?.*$/, '');

      if (event.url.match(/#addon/)) {
        const timer = this.isInitial ? 1000 : 400;
        setTimeout(() => {
          const el = document.querySelector('#addon');
          window.scrollBy(0, el.getBoundingClientRect().top - 100);
        }, timer);
      } else if (event.url.match(/\/magazines\/(category|tag|video|podcast|event)(\/.+)?\/\d/) && !this.isInitial) {
        const el = document.querySelector('#archive');
        console.log('scroll to arhchive');
        window.scrollBy(0, el.getBoundingClientRect().top - 100);
      } else if (pathPrev != pathCurrent) { 
        window.scroll(0, 0); 
      }

      this.urlPrev = event.url;
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
      }, {enableHighAccuracy: true, maximumAge:0, timeout: 1000000});
    });

  }
}


interface IAppQueryParams {
  action?: 'stripe-cancel' | 'stripe-success';
}