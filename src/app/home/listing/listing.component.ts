import { Component, OnInit, ElementRef, ViewChild, NgZone, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';
import { environment } from 'src/environments/environment';

import { HeaderStatusService } from '../../shared/services/header-status.service';
import { _FEATURE_CONFIGS } from '@ngrx/store/src/tokens';
import { Questionnaire, QuestionnaireAnswer, QuestionnaireService } from '../../shared/services/questionnaire.service';
// import { rootEffectsInit } from '@ngrx/effects';
// import { FitBoundsService } from '@agm/core/services/fit-bounds';
import { Professional } from '../../models/professional';
import { slideVerticalAnimation, expandVerticalAnimation, fadeAnimation } from '../../_helpers/animations';
import { getDistanceFromLatLng } from '../../_helpers/latlng-to-distance';
import { CategoryService, Category } from '../../shared/services/category.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { locations } from 'src/app/_helpers/location-data';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.html',
  styleUrls: ['./listing.scss'],
  animations: [expandVerticalAnimation, slideVerticalAnimation, fadeAnimation],
})
export class ListingComponent implements OnInit, OnDestroy {

  constructor(
    private behaviorService: BehaviorService,
    private route: ActivatedRoute,
    private router: Router,
    private _sharedService: SharedService,
    private toastr: ToastrService,
    private _headerService: HeaderStatusService,
    private _catService: CategoryService,
    private _maps: MapsAPILoader,
    private _uService: UniversalService,
    private _qService: QuestionnaireService,
    private _changeDetector: ChangeDetectorRef,
    _el: ElementRef,
  ) {
    this.host = _el.nativeElement;
  }

  @ViewChild('expertFinder') private expertFinder: ElementRef;
  @ViewChild('buttonApplyFilter') private buttonApplyFilter: ElementRef;
  public mapHeight = 0;
  public expertFinderHeight = 0;

  @ViewChild('searchGlobal')
  public searchGlobalElementRef: ElementRef;
  public AWS_S3 = '';

  public isVirtual = false;
  public serviceSet: Category[];
  public customerHealthSet: QuestionnaireAnswer[];
  public typeOfProviderSet: QuestionnaireAnswer[];

  public mapdata: { lat: number, lng: number, zoom: number } = { lat: 53.89, lng: -111.25, zoom: 3 };
  public searchCenter: { lat: number, lng: number, radius: number } = { lat: 53.89, lng: -111.25, radius: 0 };
  public initialLocation: { lat: number, lng: number, zoom: number, radius: number, address: string, isLocationEnabled: boolean } = { lat: 53.89, lng: -111.25, zoom: 3, radius: 0, address: '', isLocationEnabled: false };

  public mapInfoWindowPrevious: any = null;
  public isGettingCurrentLocation = false;
  public isGetLocationButtonShown = true;

  public isFinderSticked = false;
  public isMapView = false;
  public isMapSizeBig = false;
  public isTipForApplyFilterHidden = false;
  public filterTarget: Filter = null;
  public currentPage = 1;
  public professionals: Professional[] = null;
  public pages: { current: number, itemsPerPage: number, data: Professional[][] } = {
    current: 1,
    itemsPerPage: 12,
    data: null
  };
  public compareList = [];

  // private geoCoder;
  public keyword = '';
  currentAddress = '';
  loggedInUser;
  loggedInRole;
  public id: string; /** category id */
  public typeOfProviderId: string; /** type of provider id */

  public styleRightTipForApplyFilter: number = 15;

  private sub: any;
  allDoctorList = []; /**todo: can be deleted because new ui doesn't have feature to search by doctor name */
  typical_hours = [];
  // type = 'Goal';

  // queryLatLong;
  // serviceData;
  // treatmentModalities;
  // serviceType;
  // serviceOffering;
  // categoryList;

  public listingPayload = payloadInitial;
  public filters: Filter[] = filtersPreset;

  private host: HTMLElement;
  private timerMapCenterChange: any;
  private timerMapZoomChange: any;

  // get listingContainerClass() {
  //   let c = '';
  //   if (!this.isVirtual) {
  //     if (this.isMapView) { c = 'd-none'; } else if (this.isMapSizeBig) { c = 'col-md-6 col-lg-3'; } else { c = 'col-md-6 col-lg-9 col-xl-8'; }
  //   }
  //   return c;
  // }

  // get listingItemClass() {
  //   let c = '';
  //   if (this.isVirtual) { c = 'col-md-6 col-lg-3'; } else if (!this.isMapSizeBig) { c = 'col-lg-4'; }
  //   return c;
  // }

  get isMainFilterOn() {
    return (
      this.keyword && this.keyword.length > 0 ||
      (this.listingPayload.services && this.listingPayload.services.length > 0) ||
      this.isCustomerHealthOn
    );
  }
  get isCustomerHealthOn() {
    return (this.listingPayload.customer_health && this.listingPayload.customer_health.length > 0);
  }

  get isApplyFilterButtonShown(){
    let isShown = false;
    for(let f of this.filters){
      if(f.active){
        isShown = true;
        break;
      }
    }
    return isShown;
  }

  getServiceName(id: string) {
    let name = null;
    if (this.serviceSet) {
      for (const s of this.serviceSet) {
        if (s._id == id) { name = s.item_text; break; }
        for (const sSub of s.subCategory) {
          if (sSub._id == id) { name = sSub.item_text; break; }
        }
        if (name && name.length > 0) { break; }
      }
    }

    if(!name && this.typeOfProviderSet) {
      for(const s of this.typeOfProviderSet) {
        if(s._id == id) { name = s.item_text; break; }
      }
    }
    
    return name;
  }

  getCustomerHealthName(id: string) {
    let name = '';
    if (this.customerHealthSet) {
      for (const c of this.customerHealthSet) {
        if (c._id == id) { name = c.item_text; break; }
      }
    }
    return name;
  }

  ngOnDestroy() {
    this._uService.localStorage.removeItem('typical_hours');
    this._headerService.showHeader();
  }

  onChangeCustomerHealth(selectedIds: string[]){
    this.listingPayload.customer_health = selectedIds;
    this.listing(this.listingPayload);
  }

  ngAfterViewChecked() {
    const expertFinderHeight = this.expertFinderHeight;
    this.calcMapBoundingRect();
    if(expertFinderHeight != this.expertFinderHeight) {
      this._changeDetector.detectChanges();
    }

    if(!this.isTipForApplyFilterHidden && this.buttonApplyFilter) {
      const right = window.innerWidth - this.buttonApplyFilter.nativeElement.getBoundingClientRect().right - 7;
      if(right >= 15 && right != this.styleRightTipForApplyFilter) {
        this.styleRightTipForApplyFilter = right;
        this._changeDetector.detectChanges();
      }          
    }
  }

  calcMapBoundingRect() {
    if(!this._uService.isServer){
      this.expertFinderHeight = this.expertFinder.nativeElement.getBoundingClientRect().height;
      this.mapHeight = window.innerHeight - this.expertFinderHeight;  
    }
    return;
  }

  async ngOnInit() {
    this.AWS_S3 = environment.config.AWS_S3;
    this.serviceSet = await this._catService.getCategoryAsync();
    const ls = this._uService.localStorage;

    this.calcMapBoundingRect(); 

    // if options which has to be fetched from server is not set correctly, fetch.
    if (this.filters[3].options.length == 0 || this.filters[4].options.length == 0 || this.filters[4].options.length == 0) {
      this.getProfileQuestion();
    }
    
    /** init geo location */
    const [latDefault, lngDefault] = [53.89, -111.25];
    const [ipLat, ipLng] = [ls.getItem('ipLat'), ls.getItem('ipLong')];
    let [lat, lng]: [number, number] = [null, null];

    if (ipLat && ipLng) { [lat, lng] = [Number(ipLat), Number(ipLng)]; } else {
      try { 
        [lat, lng] = await this.getCurrentLocation(); 
      } 
      catch (err) {
        if (!this._uService.isServer) {
          const message = (err.code === 1) ? 'You need to enable your location in order to see options in your geographical area. Alternatively you can only view virtual options!' : 'Could not get current location';
          [lat, lng] = [latDefault, lngDefault];
          this.toastr.success(message);  
        }
      }
    }

    this.searchCenter = (lat & lng) ? { lat, lng, radius: 100 * 1000 } : { lat: null, lng: null, radius: 0 };
    this.setMapdata((lat && lng) ? { lat, lng, zoom: 12 } : { lat: latDefault, lng: lngDefault, zoom: 3 });
    this.listingPayload.latLong = `${this.searchCenter.lng}, ${this.searchCenter.lat}`;

    if (lat && lng) {
      this.initialLocation.lat = lat;
      this.initialLocation.lng = lng;
      this.initialLocation.zoom = 12;
      this.initialLocation.radius = 100 * 1000;
      this.initialLocation.isLocationEnabled = true;

      const f = this.getFilter('location');
      f.data.defaultLatLng = [lat, lng];

      this.getAddressFromLocation([lat, lng]).then(address => {
        this.initialLocation.address = address;

        const f = this.getFilter('location');
        f.data.defaultAddress = address;
      }, (error) => {
        console.log(error);
      });
    }

    /** if personal match exists, reset all filter menu and payload. then set filter menu and payload using personalMatch */
    const data = this._sharedService.getPersonalMatch();
    if (data) {
      this.listingPayload.customer_health = (data.customer_health && data.customer_health.length > 0) ? data.customer_health : [];
      this.listingPayload.services = (data.services && data.services.length > 0) ? data.services : [];
      this.listingPayload.age_range = [];
      this.listingPayload.gender = [];

      if(data.age_range){
        const f = this.getFilter('age');
        f.active = true;
        f.options.forEach(option => {
          if(data.age_range == option._id){ 
            option.active = true; 
            this.listingPayload.age_range.push(option._id);
          }
        });
      }

      if(data.gender) {
        const f = this.getFilter('gender');
        f.active = true;
        f.options.forEach(option => {
          if(data.gender == option.item_text){
            option.active = true;
            this.listingPayload.gender.push(option._id);
          }
        });
      }

      this._sharedService.clearPersonalMatch();
      
      const qs = await this._qService.getPersonalMatch();
      this.customerHealthSet = qs.health.answers;
    }

    // for the route '/practitioners'
    this._uService.setMeta(this.router.url, {
      title: 'Find best health care provider in Canada | PromptHealth',
      description: 'Use our Expart Finder to find a top-rated health care provider near you or offering virtual appointment.',
    });

    let isFirstAccess = true; 
    
    // for the route '/practitioners/category/:categoryId'
    // for the route '/practitioners/category/:categoryId/:city'
    this.route.params.subscribe(async (params: {categoryId: string, city: string, typeOfProviderId: string}) => {
      let areaDescription = 'near you or offering virtual appointment';
      
      if(params.city) {
        const city = locations[params.city.toLowerCase()];
        
        if(!city) {
          this.router.navigate(['../'], {relativeTo: this.route});
        }else{
          areaDescription = 'around ' + params.city.charAt(0).toUpperCase() + params.city.slice(1);

          const [lat, lng] = [city.lat, city.lng];
          const distance = city.distance;
          const zoom = city.zoom;
          this.listingPayload.latLong = `${lng}, ${lat}`;
          this.listingPayload.miles = distance;
  
          this.searchCenter = { lat, lng, radius: distance * 1000 };
          this.setMapdata({ lat, lng, zoom: zoom });
          this.initialLocation.lat = lat;
          this.initialLocation.lng = lng;
          this.initialLocation.zoom = zoom;
          this.initialLocation.radius = distance * 1000;
          this.initialLocation.isLocationEnabled = true;
  
          const f = this.getFilter('location');
          f.data.defaultLatLng = [lat, lng];
  
          this.getAddressFromLocation([lat, lng]).then(address => {
            this.initialLocation.address = address;
  
            const f = this.getFilter('location');
            f.data.defaultAddress = address;
          }, (error) => {
            console.log(error);
          });  
        }
      }

      if(params.typeOfProviderId) {
        this.typeOfProviderId = params.typeOfProviderId;
        this.listingPayload.services = [this.typeOfProviderId];
        const qs = await this._qService.getProfilePractitioner('SP');
        this.typeOfProviderSet = qs.typeOfProvider.answers;
        const typeOfProviderName = this.getServiceName(this.typeOfProviderId);

        this._uService.setMeta(this.router.url, {
          title: `Find best ${typeOfProviderName.toLowerCase()} ${(areaDescription) ? areaDescription : 'in Canada'} | PromptHealth`,
          description: `Use our Expart Finder to find a top-rated ${typeOfProviderName.toLowerCase()} ${areaDescription}.`
        });
      } else if (params.categoryId) {
        this.id = params.categoryId;
        this.listingPayload.services = [this.id];
  
        const categoryName = this.getServiceName(params.categoryId);
        this._uService.setMeta(this.router.url, {
          title: `Find best ${categoryName.toLowerCase()} specialist ${(areaDescription) ? areaDescription : 'in Canada'} | PromptHealth`,
          description: `Use our Expart Finder to find a top-rated ${categoryName.toLowerCase()} specialist ${areaDescription}.`
        });
      } else {
        this._uService.setMeta(this.router.url, {
          title: `Find best health care provider ${(areaDescription) ? areaDescription : 'in Canada'} | PromptHealth`,
          description: `Use our Expart Finder to find a top-rated health care provider ${areaDescription}.`
        });
      }

      if(!isFirstAccess) {
        this.listing(this.listingPayload);
      }
      isFirstAccess = false;
    });
    

    this.route.queryParams.subscribe((queryParams: {virtual: string | boolean, keyword: string}) => {
      this.isVirtual = (queryParams.virtual == 'true') ? true : false;
      // if(queryParams.id) { this.id = queryParams.id; }
      // this.type = queryParams.type;
      this.keyword = queryParams.keyword;

      this.listingPayload.keyword = this.keyword || '';
      this.listingPayload.virtual = this.isVirtual;
      this.listingPayload.latLong = this.isVirtual ? '' : `${this.searchCenter.lng}, ${this.searchCenter.lat}`;

      this.loggedInUser = ls.getItem('loginID');
      this.loggedInRole = ls.getItem('roles');
      if (ls.getItem('typical_hours')) {
        this.typical_hours = ls.getItem('typical_hours').split(',');
      }

      // if (this.id && this.type) {
      //   this.listingPayload.ids = [this.id];
      //   this.listingPayload.type = this.type;
      // }
      // if (this.id) {
      //   this.listingPayload.services = [this.id];
      // }
      // else if(this.type){
      //   this.listingPayload.type = this.type;
      // }
      this.listing(this.listingPayload);
    });
  }

  async onClickGetLocationButton() {
    this.isGettingCurrentLocation = true;

    try {
      const [lat, lng] = await this.getCurrentLocation();
      this.setMapdata({ lat, lng, zoom: 12 });
    } catch (err) {
      if(err.code === 1) {
        this.toastr.success('You need to enable your location in order to see options in your geographical area. Alternatively you can only view virtual options!');
      }else {
        this.toastr.error('Could not get current location');        
      }
    }

    this.isGettingCurrentLocation = false;
  }

  getCurrentLocation(): Promise<[number, number]> {
    const ls = this._uService.localStorage;
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resp => {
        const [lat, lng] = [resp.coords.latitude, resp.coords.longitude];
        ls.setItem('ipLat', lat.toString());
        ls.setItem('ipLong', lng.toString());
        this.initialLocation.lat = lat;
        this.initialLocation.lng = lng;
        resolve([lat, lng]);
      },err => {
        console.log(err);
        reject(err);
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: 7000 });
    });
  }

  onChangeMapCenter(e: { lat: number, lng: number }) {
    if (this.timerMapCenterChange) { clearTimeout(this.timerMapCenterChange); }
    this.timerMapCenterChange = setTimeout(() => { this.setMapdata(e, false); }, 500);
  }

  onChangeMapZoom(e: number) {
    if (this.timerMapZoomChange) { clearTimeout(this.timerMapZoomChange); }
    this.timerMapZoomChange = setTimeout(() => { this.setMapdata({ zoom: e }, false); }, 500);
  }

  // private isMapMoved = false;
  private mapBounds: google.maps.LatLngBoundsLiteral;
  onChangeMapBounds(e: google.maps.LatLngBounds) {
    this.mapBounds = e.toJSON();
    // setTimeout(() => {
      // this.isMapMoved = true;
    // }, 500);
  }

  onClickSearchInThisArea(){
    const b = this.mapBounds;
    const dist = getDistanceFromLatLng(b.north, b.east, b.south, b.west);
    this.listingPayload.latLong = (b.east + b.west) / 2 + ', ' + (b.south + b.north) / 2;
    this.listingPayload.miles = Math.floor(dist / 2);
    this.searchCenter.lat = (b.north + b.south) / 2;
    this.searchCenter.lng = (b.east + b.west) / 2;
    this.searchCenter.radius = dist / 2 * 1000;
        
    this.listing(this.listingPayload);

    const f = this.getFilter('location');
    f.data.latLng = [this.searchCenter.lat, this.searchCenter.lng];
    f.data.distance = Math.floor(dist / 2);
    this.getAddressFromLocation([this.searchCenter.lat, this.searchCenter.lng]).then((address) => {
      f.data.address = address;
    });
  }

  onClickMap(e: Event) {
    if((e.target as HTMLElement).closest('.agm-info-window') == null && this.mapInfoWindowPrevious) {
      this.closeMapInfoWindow();
    }
  }

  onClickMapMarker(infoWindow: any) {
    if (this.mapInfoWindowPrevious && this.mapInfoWindowPrevious.content.isConnected) {
      this.closeMapInfoWindow();
    }
    setTimeout(() => {
      this.mapInfoWindowPrevious = infoWindow;
    }, 300);
  }

  closeMapInfoWindow() {
    this.mapInfoWindowPrevious.close();
    this.mapInfoWindowPrevious = null;
  }

  setMapdata(data: { lat?: number, lng?: number, zoom?: number }, updateListing: boolean = false) {
    if (data.lat && this.mapdata.lat != data.lat) { this.mapdata.lat = data.lat; }
    if (data.lng && this.mapdata.lng != data.lng) { this.mapdata.lng = data.lng; }
    if (data.zoom && this.mapdata.zoom != data.zoom) { this.mapdata.zoom = data.zoom; }

    //    this.listingPayload.latLong = data.lng + ', ' + data.lat;
    //    if (updateListing) { this.listing(this.listingPayload, false); }
  }

  // async searchInThisArea() {
  //   this.searchCenter.lat = this.mapdata.lat;
  //   this.searchCenter.lng = this.mapdata.lng;
  //   this.searchCenter.radius = this.listingPayload.miles * 1000;

  //   try {
  //     const address = await this.getAddressFromLocation([this.mapdata.lat, this.mapdata.lng]);
  //     const f = this.getFilter('location');
  //     f.data.address = address;
  //     f.data.latLng = [this.mapdata.lat, this.mapdata.lng];
  //     this.updateFilterActiveStatus(f);
  //   } catch (err) { console.log('error'); }

  //   this.listingPayload.latLong = `${this.searchCenter.lng}, ${this.searchCenter.lat}`;
  //   this.listing(this.listingPayload);
  // }


  /** get filter by id */
  getFilter(id: string): Filter {
    let f: Filter;
    for (let i = 0; i < this.filters.length; i++) {
      if (id == this.filters[i]._id) { f = this.filters[i]; break; }
    }
    return f;
  }

  /** get filter by payloadName */
  getFilterByPayloadName(payloadName: string): Filter {
    let f: Filter;
    for (let i = 0; i < this.filters.length; i++) {
      if (payloadName == this.filters[i].payloadName) { f = this.filters[i]; break; }
    }
    return f;
  }

  /** set options for target filter (this is for the filter which options are fetched from server) */
  setFilterOptions(id: string, q: Questionnaire) {
    const f = this.getFilter(id);
    const options: QuestionnaireAnswer[] = [];

    q.answers.forEach(a => {
      options.push({ _id: a._id, item_text: a.item_text, active: false, subans: a.subans });
    });
    f.options = options;
  }

  getProfileQuestion() {
    const path = `questionare/get-profile-questions`;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        res.data.forEach((element: Questionnaire) => {
          if (element.question_type === 'service' && element.slug === 'offer-your-services') {
            this.setFilterOptions('serviceOffer', element);
          }
          if (element.question_type === 'service' && element.slug === 'languages-you-offer') {
            this.setFilterOptions('language', element);
            if (this.professionals && this.professionals.length > 0) {
              const languageSet = this.getFilter('language').options;
              if (this.professionals && this.professionals.length > 0) {
                this.professionals.forEach((p: Professional) => { p.populate('languages', languageSet); });
              }
            }
          }
          if (element.question_type === 'availability') {
            this.setFilterOptions('availability', element);
          }
        });
      } else {
        this.toastr.error(res.message);
      }
    }, err => {
      this._sharedService.loader('hide');
    });
  }

  /** #listing */
  listing(filter, showLoader: boolean = true) {
    if (filter.latLong === 'null, null') {
      filter.latLong = '';
    }

    /** copy filter so that the original payload does not effect any change here */
    const filterCopy = JSON.parse(JSON.stringify(filter));

    /** put customerHealth into services if exist */
    if (filterCopy.customer_health && filterCopy.customer_health.length > 0) {
      filterCopy.services = filterCopy.services.concat(filterCopy.customer_health);
    }
    delete filterCopy.customer_health;

    if (showLoader) { this._sharedService.loader('show'); }
    const path = 'user/filter';
    this._sharedService.postNoAuth(filterCopy, path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        const professionals = [];
        const languageSet = this.getFilter('language').options;

        res.data.forEach((d: any) => {
          const professional = new Professional(d.userId, d.userData, d.ans);
          if(!this._uService.isServer){
            professional.setMapIcon();            
          }
          if (languageSet && languageSet.length > 0) { professional.populate('languages', languageSet); }
          professionals.push(professional);
        });

        this.professionals = professionals;
        // this.professionals = this.professionals.sort((a, b) => a.distance - b.distance);

        //        this.createNameList(this.doctorsListing); // todo: can be deleted

        this.filterProfessionalsByPage();
        this.pages.current = 1;
        setTimeout(()=>{ this.scrollToTop() });

        this._sharedService.loader('hide');
      } else {
        this.toastr.error(res.message);
      }
    }, err => {
      console.log(err);
      this._sharedService.loader('hide');
    });
  }


  /** set default value to selected listingPayload property */
  removeFilterOne(payloadName: string) {
    let val: any;
    const ls = this._uService.localStorage;
    switch (payloadName) {
      case 'rating': val = 0; break;
      case 'miles': val = 100; break;
      case 'latLong': val = `${ls.getItem('ipLong')}, ${ls.getItem('ipLat')}`; break;
      // case 'type': val = this.type; break;
      case 'ids':
      case 'age_range':
      case 'typical_hours':
      case 'serviceOfferIds':
      case 'gender':
      case 'languageId':
      case 'price_per_hours':
        val = [];
        break;

      case 'zipcode':
      case 'typicalHoursId':
      case 'name':
        val = '';
        break;
    }

    if (payloadName === 'typical_hours') { this.listingPayload.typicalHoursId = ''; }
    this.listingPayload[payloadName] = val;
  }

  /** set formatted value to selected listingPayload property  */
  setFilterOne(val: string | string[] | number, payloadName: string) {
    if (payloadName === 'rating') {
      this.listingPayload[payloadName] = (typeof val === 'string') ? Number(val) : (typeof val === 'number') ? val : 0;
    } else if (payloadName === 'miles') {
      this.listingPayload[payloadName] = (typeof val === 'string') ? Number(val) : (typeof val === 'number') ? val : 100;
      this.searchCenter.radius = this.listingPayload.miles * 1000;
    } else if (payloadName === 'typical_hours' && typeof val === 'object') {
      if (val.length > 1) {
        this.listingPayload.typicalHoursId = '';
        this.listingPayload.typical_hours = val;
      } else {
        this.listingPayload.typicalHoursId = val[0];
        this.listingPayload.typical_hours = [];
      }
    } else { this.listingPayload[payloadName] = val; }

    // if (typeof val === 'string') {
    //   // if (payloadName === 'rating') { this.listingPayload[payloadName] = Number(val); } else { this.listingPayload[payloadName] = val; }
    // } else { this.listingPayload[payloadName] = val; }
  }

  /**todo: can be deleted because new ui doesn't have feature to search by doctor name */
  createNameList(data) {
    this.allDoctorList = [];
    for (const element of data) {
      if (element.userData.firstName) {
        this.allDoctorList.push({
          id: element.userId,
          name: element.userData.firstName,
        });
      }
    }
  }

  removeProfessionalFromCompare(id: string) {
    for (let i = 0; i < this.compareList.length; i++) {
      const p = this.compareList[i];
      if (p.id == id) {
        p.uncheckForCompare();
        this.compareList.splice(i, 1);
        break;
      }
    }
  }
  removeProfessionalFromCompareAll() {
    this.compareList.forEach(p => { p.uncheckForCompare(); });
    this.compareList = [];
  }
  updateCompareList() {
    const list = [];
    this.professionals.forEach(p => {
      if (p.isCheckedForCompare) { list.push(p); }
    });
    this.compareList = list;
  }

  compareProfessionals() {
    const promiseAll = [];
    this.compareList.forEach((p: Professional) => { promiseAll.push(this.getServiceCategories(p)); });

    this._sharedService.loader('show');
    Promise.all(promiseAll).then(() => {

      /** make compareList compatible with other pages */
      const compareList = [];
      this.compareList.forEach((p: Professional) => {
        compareList.push(p.dataComparable);
      });

      this.behaviorService.changeCompareIds(compareList);
      this.router.navigate(['/compare-practitioners']);
    })
      .catch(err => { console.log(err); })
      .finally(() => { this._sharedService.loader('hide'); });
  }

  getServiceCategories(p: Professional): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `user/getService/${p.id}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          const categories = {
            typeOfProvider: [],
            treatmentModality: [],
            service: [],
            serviceOffering: [],
          };
          res.data.forEach((e: any) => {
            switch (e.slug) {
              case 'providers-are-you': categories.typeOfProvider.push(e); break;
              case 'treatment-modalities': categories.treatmentModality.push(e); break;
              case 'your-goal-specialties': categories.service.push(e); break;
              case 'your-offerings': categories.serviceOffering.push(e); break;
            }
          });
          Object.keys(categories).forEach((k, i) => { p.setServiceCategory(k, categories[k]); });
          resolve(true);
        } else { reject('server error'); }
      },
        (error) => { reject(error); });
    });
  }

  likeProfile(evt, drId) {
    if (evt.target.checked) {
      this._sharedService.loader('show');
      const path = 'user/add-favorite';
      this._sharedService.post({ drId }, path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this._sharedService.loader('hide');
          this.toastr.success(res.message);
        } else {
          this._sharedService.loader('hide');
          this.toastr.error(res.message);
        }
      }, err => {
        this._sharedService.loader('hide');
      });
    } else {
      this._sharedService.loader('show');
      this._sharedService.removeFav(drId,).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this._sharedService.loader('hide');
          this.toastr.success(res.message);
        } else {
          this._sharedService.loader('hide');
          this.toastr.error(res.message);
        }
      }, err => {
        this._sharedService.loader('hide');
      });
    }
  }

  /** trigger when click outside of filter and close filter menu */
  onClickOutsideOfFilter(e: Event) {
    if (this.filterTarget) {
      const finder = this.host.querySelector('#expertFinder');
      const target = e.target as HTMLElement;
      if (!finder.contains(target)) {
        this.setFilterTarget(null);
      }
    }
  }

  /** trigger when filter is sticked to top */
  changeStickyStatus(isSticked: boolean) {
    this.isFinderSticked = isSticked;
    if (isSticked) { this._headerService.hideHeader(); } else { this._headerService.showHeader(); }
  }

  /** change view map <----> list for small viewport */
  toggleView() { 
    this.isMapView = !this.isMapView; 
    this.isMapSizeBig = this.isMapView;
  }

  /** change map size for large viewport */
  toggleMapSize() { this.isMapSizeBig = !this.isMapSizeBig; }

  /** calculate filter menu position */
  getFilterDropdownPosition() {

    const dropdownWidth = 350;
    const filter = this.host.querySelector('#filter-' + this.filterTarget._id);
    if (!filter) { return; }

    const rectF = filter.getBoundingClientRect();

    const style: { top: string, left?: string, width?: string } = { top: Math.floor(rectF.bottom + 20) + 'px' };
    if (dropdownWidth + 30 <= window.innerWidth) {
      style.width = dropdownWidth + 'px';

      const centerF = rectF.left + rectF.width / 2;
      const leftD = centerF - dropdownWidth / 2;
      const rightD = centerF + dropdownWidth / 2;

      if (leftD >= 15 && rightD <= window.innerWidth - 15) { style.left = Math.floor(leftD) + 'px'; } else if (leftD < 15) { style.left = '15px'; } else { style.left = (window.innerWidth - 15 - dropdownWidth) + 'px'; }
    }
    return style;
  }

  /** determine which filter menu will be shown up or hide filter menu */
  setFilterTarget(i: number) {
    if (i === null) { 
      this.filterTarget = null; 
    } else if (this.filterTarget) {
      if (this.filters[i]._id == this.filterTarget._id) { 
        this.filterTarget = null; 
      } else { 
        this.filterTarget = this.filters[i]; 
      }
    } else {
      this.filterTarget = this.filters[i];
    }
  }

  updateFilterActiveStatus(f: Filter){
    let isActive = false;
    switch(f.type){
      case 'radio':
      case 'checkbox':
        f.options.forEach(option => { if(option.active){ isActive = true; }});
        break;
      case 'location':
        isActive = (f.data.distance == f.data.distanceMax && (f.data.latLng && f.data.defaultLatLng && f.data.latLng[0] == f.data.defaultLatLng[0] && f.data.latLng[1] == f.data.defaultLatLng[1])) ? false : true;
        break;
    }
    f.active = isActive;
  }

  getLocationFromZipcode(zipcode: string): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      this._maps.load().then(() => {
        new google.maps.Geocoder().geocode({ address: zipcode }, (results, status) => {
          if (status !== 'OK') { reject(); } else {
            const data = results[0].geometry.location;
            resolve([data.lat(), data.lng()]);
          }
        });
      });
    });
  }
  getAddressFromLocation(location: [number, number]): Promise<string> {
    return new Promise((resolve, reject) => {
      this._maps.load().then(() => {
        new google.maps.Geocoder().geocode({ location: { lat: location[0], lng: location[1] } }, (results, status) => {
          if (status == 'OK' && results.length > 0) {
            const address = results[0].formatted_address;
            resolve(address);
          } else { reject(); }
        });
      });
    });
  }

  /** trigger when click save / clear in zipcode filter menu and update listingPayload & map. then start listing */
  async updateFilterLocation(listing: boolean = false) {
    const f = this.getFilter('location');

    const [lat,lng] = (f.data.latLng) ? f.data.latLng : [this.initialLocation.lat, this.initialLocation.lng];
    const isLocationChanged = !!(this.listingPayload.latLong != `${lng}, ${lat}`);
   
    this.listingPayload.latLong = (f.data.latLng)? (lng + ', ' + lat) : '';
    if(f.data.distance) { this.listingPayload.miles = f.data.distance };
    this.searchCenter = {lat: lat, lng: lng, radius: (f.data.latLng ? this.listingPayload.miles * 1000 : 0) };
    this.setMapdata({lat: lat, lng: lng});
    if(isLocationChanged) { this.mapdata.zoom = (f.data.latLng) ? 12 : 3; }

    if(listing){
      this.listing(this.listingPayload);
    }
  }

  onChangeStateFilterMenu(state: string){
    this.updateFilterActiveStatus(this.filterTarget);
    if(state == 'save'){
      this.setFilterTarget(null);  
    }
  }

  /** trigger when click save / clear in filter menu and update listingPayload. then start listing (optional) */
  updateFilter(id: string, listing: boolean = true) {
    const f = this.getFilter(id);

    if(f.active){
      if(f.type == 'radio'){
        for (let i = 0; i < f.options.length; i++) {
          if (f.options[i].active) { 
            this.setFilterOne(f.options[i]._id, f.payloadName); 
            break; 
          }
        }
      }else if(f.type == 'checkbox'){
        const vals: string[] = [];
        f.options.forEach(o => { if (o.active) { vals.push(o._id); } });
        this.setFilterOne(vals, f.payloadName);
      }else if(f.type == 'slider'){
        this.setFilterOne(f.range.current, f.payloadName);
      }else if(f.type == 'location'){
        // this.updateFilterLocation(false);
      }
    }
    else{
      this.removeFilterOne(f.payloadName);
    }

    // if (f.type === 'radio') {
    //   let val: string = null;
    //   let selected: QuestionnaireAnswer;
    //   for (let i = 0; i < f.options.length; i++) {
    //     if (f.options[i].active) { selected = f.options[i]; break; }
    //   }
    //   val = selected ? selected._id : null;

    //   if (!val) { this.removeFilterOne(f.payloadName); } else { this.setFilterOne(val, f.payloadName); }

    // } else if (f.type === 'checkbox') {
    //   const vals: string[] = [];
    //   f.options.forEach(o => { if (o.active) { vals.push(o._id); } });

    //   if (vals.length > 0) { this.setFilterOne(vals, f.payloadName); } else { this.removeFilterOne(f.payloadName); }
    // } else if (f.type === 'slider') {
    //   this.setFilterOne(f.range.current, f.payloadName);
    // }

    if (listing) {
      this.listing(this.listingPayload);
      this.setFilterTarget(null);
    }
  }

  updateFilterAll(){
    this.isTipForApplyFilterHidden = true;
    this.filters.forEach(f=> {this.updateFilter(f._id, false);});
    this.updateFilterLocation(true);
    this.setFilterTarget(null);
  }

  removeFilterAll() {
    this.isTipForApplyFilterHidden = false;
    this.filters.forEach(f => {
      if (f.range) { 
        f.range.current = f.range.default; 
        this.removeFilterOne(f.payloadName);
      }
      else if (f.options) {
        f.options.forEach(o => { o.active = false; });
        this.removeFilterOne(f.payloadName);
      }else if(f.type == 'location'){
        f.data.address = f.data.defaultAddress;
        f.data.distance = f.data.distanceMax;
        f.data.latLng = f.data.defaultLatLng;
        this.updateFilterLocation(false);
      }
      this.updateFilterActiveStatus(f);
    });
    this.listing(this.listingPayload);
    this.setFilterTarget(null);
  }

  removeService(i: number) {
    const id = this.listingPayload.services[i];
    this.listingPayload.services.splice(i, 1);

    if (id == this.id) {
      this.id = null;
      this.router.navigate(['/practitioners']);
    } else if(id == this.typeOfProviderId) {
      this.typeOfProviderId = null;
      this.router.navigate(['/practitioners']);
    } else {
      this.listing(this.listingPayload);
    }

  }
  removeKeyword() {
    this.keyword = '';
    this.setQueryParams();
  }

  setQueryParams() {
    const params: { id?: string, keyword?: string, virtual?: boolean } = {};
    if (this.keyword && this.keyword.length > 0) { params.keyword = this.keyword; }
    if (this.id && this.id.length > 0) { params.id = this.id; }
    if (!!this.isVirtual) { params.virtual = true; }

    this.router.navigate(['./'], {
      queryParams: params,
      relativeTo: this.route
    });
  }

  changePage(i: number) {
    if (i <= 0) { i = 1; } else if (i > this.pages.data.length) { i = this.pages.data.length; }
    this.pages.current = i;

    setTimeout(() => { 
      this.scrollToTop();
    });
  }

  scrollToTop() {
    const practitionersContainer = this.host.querySelector('#practitionersContainer');
    if(practitionersContainer && !this._uService.isServer) {
      const rectL = practitionersContainer.getBoundingClientRect();
      const rectF = this.expertFinder.nativeElement.getBoundingClientRect();
      window.scrollBy(
        0, 
        (rectF.top == 0) ? rectF.top - rectF.height + rectL.top : 0,
      );         
    }
  }

  filterProfessionalsByPage() {
    const pages = [];
    let prosInPage = [];
    this.professionals.forEach((p, i) => {
      prosInPage.push(p);

      if (prosInPage.length === this.pages.itemsPerPage) {
        pages.push(prosInPage);
        prosInPage = [];
      }

      if (i === this.professionals.length - 1 && prosInPage.length > 0) { pages.push(prosInPage); }

    });

    this.pages.data = pages;
  }
}

interface Filter {
  _id: string;
  item_text: string;
  type: string;
  payloadName: string;
  active: boolean;
  options?: QuestionnaireAnswer[];
  range?: { min: number; max: number; current: number; default: number }; /** not used currently. */
  data?: { distance: number, address: string, defaultAddress: string, latLng: number[], defaultLatLng: number[], distanceMin: number, distanceMax: number }; /** for location */
}

const filtersPreset: Filter[] = [
  { _id: 'location', item_text: 'Location', type: 'location', payloadName: '', active: false, data: { distance: 100, address: '', defaultAddress: '', latLng: null, defaultLatLng: null, distanceMin: 5, distanceMax: 100, } },
  // { _id: 'zipcode', item_text: 'Zip Code', type: 'input', payloadName: 'zipcode', active: false, data: {value: '', placeholder: 'Please input zip code'} },
  // { _id: 'distance', item_text: 'Distance', type: 'slider', payloadName: 'miles', active: false, range: { min: 5, max: 100, current: 100, default: 100 } },
  {
    _id: 'gender', item_text: 'Gender', type: 'checkbox', payloadName: 'gender', active: false, options: [
      // {_id: 'all', item_text: 'All', active: false, subans: false},
      { _id: 'male', item_text: 'Male', active: false, subans: false },
      { _id: 'female', item_text: 'Female', active: false, subans: false },
      { _id: 'nonbinary', item_text: 'Non-Binary', active: false, subans: false}
    ]
  },
  {
    _id: 'rating', item_text: 'Rating', type: 'radio', payloadName: 'rating', active: false, options: [
      // {_id: '0', item_text: 'All', active: false, subans: false},
      { _id: '5', item_text: '5 Stars', active: false, subans: false },
      { _id: '4', item_text: '4 Stars', active: false, subans: false },
      { _id: '3', item_text: '3 Stars', active: false, subans: false },
    ]
  },
  { _id: 'language', item_text: 'Language', type: 'checkbox', payloadName: 'languageId', active: false, options: [/** use server data */] },
  { _id: 'availability', item_text: 'Availability', type: 'checkbox', payloadName: 'typical_hours', active: false, options: [/** use server data */] },
  { _id: 'serviceOffer', item_text: 'Service type', type: 'checkbox', payloadName: 'serviceOfferIds', active: false, options: [/** use server data */] },
  {
    _id: 'pricing', item_text: 'Pricing', type: 'checkbox', payloadName: 'price_per_hours', active: false, options: [
      { _id: '< $50', item_text: '$ < 50', active: false, subans: false },
      { _id: '$50-100', item_text: '$ 50-100', active: false, subans: false },
      { _id: '$100-200', item_text: '$ 100-200', active: false, subans: false },
      { _id: '$200-500', item_text: '$ 200-500', active: false, subans: false },
      { _id: '$500-1000', item_text: '$ 500-1000', active: false, subans: false },
      { _id: '$1000', item_text: '$ > 1000', active: false, subans: false },
    ]
  },
  {
    _id: 'age', item_text: 'Age Group', type: 'checkbox', payloadName: 'age_range', active: false, options: [
      // { _id: '5eb1a4e199957471610e6cd7', item_text: 'Not Critical', active: false, subans: false },
      { _id: '5eb1a4e199957471610e6cd8', item_text: 'Child (<12)', active: false, subans: false },
      { _id: '5eb1a4e199957471610e6cd9', item_text: 'Adolescent (12-18)', active: false, subans: false },
      { _id: '5eb1a4e199957471610e6cda', item_text: 'Adult (18+)', active: false, subans: false },
      { _id: '5eb1a4e199957471610e6cdb', item_text: 'Senior (>64)', active: false, subans: false },
    ]
  },
];

const payloadInitial = {
  ids: [],
  services: [],
  serviceOfferIds: [],
  customer_health: [],
  zipcode: '',
  languageId: [],
  typicalHoursId: '',
  rating: 0,
  miles: 100,
  latLong: '',
  age_range: [],
  name: '',
  // type: 'service',
  price_per_hours: [],
  gender: [],
  typical_hours: [],
  keyword: '',
  virtual: false,
};
