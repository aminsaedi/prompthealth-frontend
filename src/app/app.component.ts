import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivationStart, NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { UniversalService } from './shared/services/universal.service';
import { UploadingStatus, UploadObserverService } from './shared/services/upload-observer.service';
import { slideVerticalAnimation } from './_helpers/animations';
import { SharedService } from './shared/services/shared.service';
import { IResponseData } from './models/response-data';
import { RegionService, RegionType } from './shared/services/region.service';
import { Subscription } from 'rxjs';
import { } from 'googlemaps';

declare let gtag: Function;
declare let fbq: Function;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideVerticalAnimation],
})
export class AppComponent implements OnInit {

  get isAlertUploadingInBackgroundShown() { return this.isUploadingInBackground || this.isUploadingDoneInBackground; }
  get isStaging() { return !environment.production; }
  regionFormatted(region: RegionType) { return this._regionService.formatRegion(region); }

  public isUploadingInBackground: boolean = false;
  public isUploadingDoneInBackground: boolean = false;
  private currentUploadingStatus: UploadingStatus;

  public selectedRegion: RegionType = 'CA';

  public isModalRegionMenuShown = false;
  private subscriptionModalRegionVisibility: Subscription;

  constructor(
    private _uService: UniversalService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _location: Location,
    private _uploadObserver: UploadObserverService,
    private _sharedService: SharedService,
    private _regionService: RegionService,
  ) { }

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload(e: BeforeUnloadEvent) {
    if(this._uploadObserver.isUploading) {
      e.returnValue = true;
    }
  }

  private disableAnalytics: boolean = environment.config.disableAnalytics;

  ngOnDestroy() {
    this.subscriptionModalRegionVisibility?.unsubscribe();
  }

  async ngOnInit() {
    if (!this._uService.isServer) {
      this._uploadObserver.uploadingStatusChanged().subscribe(status => {
        this.onUploadingStatusChanged(status);
      });

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

    //check ipaddress and show select region modal if needed.
    this.subscriptionModalRegionVisibility = this._regionService.modalVisibilityChanged().subscribe(isShown => {
      if(isShown) {
        this.selectedRegion = this._uService.localStorage.getItem('region') as RegionType || 'CA';
        this.isModalRegionMenuShown = true;    
      } else {
        this.isModalRegionMenuShown = false;
      }
    });

    if(this._uService.isBrowser) {
      if(!this._uService.localStorage.getItem('region')) {
        this._uService.localStorage.removeItem('ip');
      }
      const isIpChanged = await this.checkIpChanged();
      if(isIpChanged) {
        this._regionService.changeModalVisibility(true);
      } else {
        this._regionService.changeStatus('ready');
      }
    } else {
      this._uService.localStorage.setItem('region', 'CA');
      this._regionService.changeStatus('ready');
    }
  }


  async checkIpChanged() {
    const ipCurrent = this._uService.localStorage.getItem('ip');
    if(ipCurrent) {
      const ip = await this.refreshIpInLocalstorage();
      return ip != ipCurrent;
    } else {
      this.refreshIpInLocalstorage();
      return true;
    }
  }

  refreshIpInLocalstorage(): Promise<string> {
    return new Promise((resolve, reject) => {
      this._regionService.changeStatus('checking');
      this._sharedService.getNoAuth('common/get-ipaddress').subscribe((res: IResponseData)   => {
        this._uService.localStorage.setItem('ip', res.data);
        resolve(res.data);
      }, error => {
        console.log(error);
        this._uService.localStorage.setItem('ip', null);
        resolve(null);
      })
    });
  }

  onUploadingStatusChanged(status: UploadingStatus) {
    if(status == 'background') {
      this.isUploadingInBackground = true;
    } else if(this.currentUploadingStatus == 'background' && status == 'done' ) {
      this.isUploadingInBackground = false;
      this.isUploadingDoneInBackground = true;
      setTimeout(() => {
        this.isUploadingDoneInBackground = false;
      }, 6000 );
    }
    
    this.currentUploadingStatus = status;
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

  onClickAlertUploadingInBackground() {
    if(this.isUploadingDoneInBackground) {
      //hide done message forcibly;
      this.isUploadingDoneInBackground = false;
    }
  }

  onRegionSelected(region: RegionType) {
    if(region) {
      this.isModalRegionMenuShown = false;
      this._uService.localStorage.setItem('region', region);
      this._regionService.changeStatus('ready');  
    } else {
      this._toastr.error('Please select resion.');
    }
  }
}


interface IAppQueryParams {
  action?: 'stripe-cancel' | 'stripe-success';
}
