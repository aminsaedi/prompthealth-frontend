import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IUserDetail } from './models/user-detail';
import { ScrollTopService } from './scrolltop.service';
import { SharedService } from './shared/services/shared.service';
import { UniversalService } from './shared/services/universal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'wellness-frontend';
  constructor(
    private scrollTopService: ScrollTopService,
    private _uService: UniversalService,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _location: Location,
    ) {
}

async ngOnInit() {
  this.scrollTopService.setScrollTop();
  if(!this._uService.isServer){
    try { await this.getPosition(); }
    catch(error){ console.log(error); }  
  }

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