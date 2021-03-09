import { Component, OnInit, ElementRef, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';
import { environment } from 'src/environments/environment';

import { HeaderStatusService } from '../../shared/services/header-status.service';
import { _FEATURE_CONFIGS } from '@ngrx/store/src/tokens';
import { QuestionnaireService, Questionnaire, QuestionnaireAnswer } from '../questionnaire.service';
// import { rootEffectsInit } from '@ngrx/effects';
// import { FitBoundsService } from '@agm/core/services/fit-bounds';
import { Professional } from '../../models/professional';
import { slideVerticalAnimation, expandVerticalAnimation } from '../../_helpers/animations';
import { CategoryService, Category } from '../../shared/services/category.service';


@Component({
  selector: 'app-listing',
  templateUrl: './listing.html',
  styleUrls: ['./listing.scss'],
  animations: [expandVerticalAnimation, slideVerticalAnimation],
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
    private _qService: QuestionnaireService,
    private _maps: MapsAPILoader,
    _el: ElementRef,
  ) {
    this.host = _el.nativeElement;
  }

  @ViewChild('searchGlobal')
  public searchGlobalElementRef: ElementRef;
  public AWS_S3 = '';

  public isVirtual = false;
  public serviceSet: Category[];
  public customerHealthSet: QuestionnaireAnswer[];

  public mapdata: { lat: number, lng: number, zoom: number } = { lat: 53.89, lng: -111.25, zoom: 3 };
  public searchCenter: { lat: number, lng: number, radius: number } = { lat: 53.89, lng: -111.25, radius: 0 };
  public initialLocation: {lat: number, lng: number, zoom: number,  radius: number, address: string, isLocationEnabled: boolean} = {lat: 53.89, lng: -111.25, zoom: 3, radius: 0, address: '', isLocationEnabled: false}

  public mapInfoWindowPrevious: any = null;
  private isMapInfoWindowReady: boolean = false;
  public isGettingCurrentLocation = false;
  public isGetLocationButtonShown = true;

  public isFinderSticked = false;
  public isMapView = false;
  public isMapSizeBig = false;
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
  id;

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

  get listingContainerClass() {
    let c = '';
    if (!this.isVirtual) {
      if (this.isMapView) { c = 'd-none'; } else if (this.isMapSizeBig) { c = 'col-md-6 col-lg-3'; } else { c = 'col-md-6 col-lg-9'; }
    }
    return c;
  }

  get listingItemClass() {
    let c = '';
    if (this.isVirtual) { c = 'col-md-6 col-lg-3'; } else if (!this.isMapSizeBig) { c = 'col-lg-4'; }
    return c;
  }

  get isMainFilterOn(){
    return (
      this.keyword && this.keyword.length > 0 ||
      (this.listingPayload.services && this.listingPayload.services.length > 0) ||
      this.isCustomerHealthOn
    )
  }
  get isCustomerHealthOn(){
    return (this.listingPayload.customer_health && this.listingPayload.customer_health.length > 0)
  }

  getServiceName(id: string){
    let name = '';
    if(this.serviceSet){
      for(let s of this.serviceSet){
        if(s._id == id){ name = s.item_text; break; }
        for(let sSub of s.subCategory){
          if(sSub._id == id){ name = sSub.item_text; break; }
        }
        if(name && name.length > 0){ break; }
      }  
    }
    return name;
  }

  getCustomerHealthName(id: string){
    let name = '';
    if(this.customerHealthSet){
      for(let c of this.customerHealthSet){
        if(c._id == id){ name = c.item_text; break; }
      }
    }
    return name;
  }

  ngOnDestroy() {
    localStorage.removeItem('typical_hours');
    this._headerService.showHeader();
  }

  async ngOnInit() {
    this.AWS_S3 = environment.config.AWS_S3;
    this.serviceSet = await this._catService.getCategoryAsync();
    
    //if options which has to be fetched from server is not set correctly, fetch.
    if(this.filters[3].options.length == 0 || this.filters[4].options.length  == 0 || this.filters[4].options.length == 0){
      this.getProfileQuestion();
    }

    /** init geo location */
    const [latDefault, lngDefault] = [53.89, -111.25];
    const [ipLat, ipLng] = [localStorage.getItem('ipLat'), localStorage.getItem('ipLong')];
    let [lat, lng]: [number, number] = [null, null];

    if (ipLat && ipLng) { [lat, lng] = [Number(ipLat), Number(ipLng)]; } else {
      try { [lat, lng] = await this.getCurrentLocation(); } 
      catch (err) {
        const message = (err.code === 1) ? 'You need to enable your location in order to see options in your geographical area. Alternatively you can only view virtual options!' : 'Could not get current location';
        this.toastr.success(message);
      }
    }

    this.searchCenter = (lat & lng) ? { lat: lat, lng: lng, radius: 100 * 1000 } : { lat: null, lng: null, radius: 0 };
    this.setMapdata((lat && lng) ? { lat: lat, lng: lng, zoom: 10 } : { lat: latDefault, lng: lngDefault, zoom: 3 });
    this.listingPayload.latLong = `${this.searchCenter.lng}, ${this.searchCenter.lat}`;

    if(lat && lng){ 
      this.initialLocation.lat = lat;
      this.initialLocation.lng = lng;
      this.initialLocation.zoom = 10;
      this.initialLocation.radius = 100 * 1000;
      this.initialLocation.isLocationEnabled = true;

      this.getZipcodeFromLocation([lat, lng]).then(zipcode=>{
        this.initialLocation.address = zipcode;

        const f = this.getFilter('location');
        f.data.address = zipcode;
      });
    }

    /** if personal match exists, reset all filter menu and payload. then set filter menu and payload using personalMatch */
    const personalMatch = this._sharedService.getPersonalMatch();
    if (personalMatch) {
        this.customerHealthSet = this._qService.getQuestionnaire('background').answers;
        this.filters.forEach(f=>{
        f.active = false;
        if(f.options){ f.options.forEach(o=>{ o.active = false; }); }
        if(f.range){ f.range.current = f.range.default; }
        this.updateFilter(f._id, false);
      });
      if(personalMatch.customer_health && personalMatch.customer_health.length > 0){
        this.listingPayload.customer_health = personalMatch.customer_health;
      }
      if(personalMatch.services && personalMatch.services.length > 0){
        this.listingPayload.services = personalMatch.services;
      }
//      this.listingPayload.ids = personalMatch.ids ? personalMatch.ids : [];
      this.listingPayload.age_range = personalMatch.age_range;
      this.listingPayload.typicalHoursId = personalMatch.typical_hours.length > 1 ? '' : personalMatch.typical_hours[0];
      this.listingPayload.typical_hours = personalMatch.typical_hours.length > 0 ? personalMatch.typical_hours : [];
      // this.listingPayload.type = personalMatch.type;

      if(this.filters[3].options.length > 0 && this.filters[4].options.length  > 0 && this.filters[5].options.length > 0){
        this.setFilterByPersonalMatch();
      }else{
      /** update filter menu when filter data is fetched from server (it will be done in getProfileQuestion function) */
      }
    }



    this.route.queryParams.subscribe(queryParams => {
      this.isVirtual = (queryParams.virtual == 'true') ? true : false;
      this.id = queryParams.id;
      // this.type = queryParams.type;
      this.keyword = queryParams.keyword;

      this.listingPayload.keyword = this.keyword || '';
      this.listingPayload.virtual = this.isVirtual;
      this.listingPayload.latLong = this.isVirtual ? '' : `${this.searchCenter.lng}, ${this.searchCenter.lat}`;

      this.loggedInUser = localStorage.getItem('loginID');
      this.loggedInRole = localStorage.getItem('roles');
      if (localStorage.getItem('typical_hours')) {
        this.typical_hours = localStorage.getItem('typical_hours').split(',');
      }

      // if (this.id && this.type) {
      //   this.listingPayload.ids = [this.id];
      //   this.listingPayload.type = this.type;
      // }
      if(this.id) {
        this.listingPayload.services = [this.id];
      }
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
      const message = (err.code === 1) ? 'You need to enable your location in order to see options in your geographical area. Alternatively you can only view virtual options!' : 'Could not get current location';
      this.toastr.success(message);
    }

    this.isGettingCurrentLocation = false;
  }

  getCurrentLocation(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resp => {
        const [lat, lng] = [resp.coords.latitude, resp.coords.longitude];
        localStorage.setItem('ipLat', lat.toString());
        localStorage.setItem('ipLong', lng.toString());
        this.initialLocation.lat = lat;
        this.initialLocation.lng = lng;
        resolve([lat, lng]);
      },
        err => {
          this.isGetLocationButtonShown = false;
          reject(err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 1000000 });
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

  onClickMap(){
    if(this.mapInfoWindowPrevious && this.mapInfoWindowPrevious.content.isConnected && this.isMapInfoWindowReady){ 
      this.closeMapInfoWindow();
    }  
  }

  onClickMapMarker(infoWindow: any){
    if(this.mapInfoWindowPrevious && this.mapInfoWindowPrevious.content.isConnected){ 
      this.closeMapInfoWindow();
    }
    setTimeout(()=>{ 
      this.isMapInfoWindowReady = true
      this.mapInfoWindowPrevious = infoWindow;
    }, 1000);
  }

  closeMapInfoWindow(){
    this.mapInfoWindowPrevious.close();
    this.mapInfoWindowPrevious = null;
    this.isMapInfoWindowReady = false;
  }

  setMapdata(data: { lat?: number, lng?: number, zoom?: number }, updateListing: boolean = false) {
    if (data.lat && this.mapdata.lat != data.lat) { this.mapdata.lat = data.lat; }
    if (data.lng && this.mapdata.lng != data.lng) { this.mapdata.lng = data.lng; }
    if (data.zoom && this.mapdata.zoom != data.zoom) { this.mapdata.zoom = data.zoom; }

    //    this.listingPayload.latLong = data.lng + ', ' + data.lat;
    //    if (updateListing) { this.listing(this.listingPayload, false); }
  }

  async searchInThisArea() {
    this.searchCenter.lat = this.mapdata.lat;
    this.searchCenter.lng = this.mapdata.lng;
    this.searchCenter.radius = this.listingPayload.miles * 1000;
    
    try{ 
      const zipcode = await this.getZipcodeFromLocation([this.mapdata.lat, this.mapdata.lng]); 
      const f = this.getFilter('location');
      f.data.address = zipcode;
    }
    catch(err){ console.log('error'); }
    
    this.listingPayload.latLong = `${this.searchCenter.lng}, ${this.searchCenter.lat}`;
    this.listing(this.listingPayload);
  }


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

        this.setFilterByPersonalMatch();

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
    if(filterCopy.customer_health && filterCopy.customer_health.length > 0){
      filterCopy.services = filterCopy.services.concat(filterCopy.customer_health)
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
          professional.setMapIcon();
          if (languageSet && languageSet.length > 0) { professional.populate('languages', languageSet); }
          professionals.push(professional);
        });

        this.professionals = professionals;
        // this.professionals = this.professionals.sort((a, b) => a.distance - b.distance);

        //        this.createNameList(this.doctorsListing); // todo: can be deleted

        this.filterProfessionalsByPage();
        this.pages.current = 1;

        this._sharedService.loader('hide');
      } else {
        this.toastr.error(res.message);
      }
    }, err => {
      this._sharedService.loader('hide');
    });
  }


  /** set default value to selected listingPayload property */
  removeFilterOne(payloadName: string) {
    let val: any;
    switch (payloadName) {
      case 'rating': val = 0; break;
      case 'miles': val = 100; break;
      case 'latLong': val = `${localStorage.getItem('ipLong')}, ${localStorage.getItem('ipLat')}`; break;
      // case 'type': val = this.type; break;
      case 'ids':
      case 'age_range':
      case 'typical_hours':
      case 'serviceOfferIds':
          val = [];
        break;

      case 'zipcode':
      case 'languageId':
      case 'typicalHoursId':
      case 'name':
      case 'gender':
      case 'price_per_hours':
        val = '';
        break;
    }

    if(payloadName == 'typical_hours'){ this.listingPayload.typicalHoursId = ''; }
    this.listingPayload[payloadName] = val;
  }

  /** set formatted value to selected listingPayload property  */
  setFilterOne(val: string | string[] | number, payloadName: string) {
    if (payloadName === 'rating') {
      this.listingPayload[payloadName] = (typeof val === 'string') ? Number(val) : (typeof val === 'number') ? val : 0;
    }
    else if (payloadName === 'miles') {
      this.listingPayload[payloadName] = (typeof val === 'string') ? Number(val) : (typeof val === 'number') ? val : 100;
      this.searchCenter.radius = this.listingPayload.miles * 1000;
    }

    else if (payloadName === 'typical_hours' && typeof val === 'object') {
      if(val.length > 1){ 
        this.listingPayload.typicalHoursId = "";
        this.listingPayload.typical_hours = val;
      }
      else{
        this.listingPayload.typicalHoursId = val[0]
        this.listingPayload.typical_hours = [];
      } 
    }

    else { this.listingPayload[payloadName] = val; }

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
      this.router.navigate(['/dashboard/listingCompare']);
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
  toggleView() { this.isMapView = !this.isMapView; }

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
    if (i === null) { this.filterTarget = null; } else if (this.filterTarget) {
      if (this.filters[i]._id == this.filterTarget._id) { this.filterTarget = null; } else { this.filterTarget = this.filters[i]; }
    } else {
      this.filterTarget = this.filters[i];
    }
  }

  /** if personalMatch exists, filter menu will be set by the personalMatch information and then clear personalMatch*/
  setFilterByPersonalMatch() {
    
    const personalMatch = this._sharedService.getPersonalMatch();
    if (personalMatch) {
      const answers: string[] = [];
      Object.keys(personalMatch).forEach((k) => {
        if (k.match(/ids|age_range|typical_hours/)) {
          personalMatch[k].forEach((id: string) => { answers.push(id); });
        }
      });
      this.filters.forEach(f => {
        if (f.options) {
          f.options.forEach(o => {
            for (let i = 0; i < answers.length; i++) {
              if (o._id === answers[i]) {
                o.active = true;
                f.active = true;
                break;
              }
            }
          });
        }
      });
      this._sharedService.clearPersonalMatch();
    }
  }

  getLocationFromZipcode(zipcode: string): Promise<[number, number]>{
    return new Promise((resolve, reject)=>{
      this._maps.load().then(()=>{
        new google.maps.Geocoder().geocode({'address': zipcode}, (results, status)=>{
          if(status !== 'OK'){ reject(); }
          else{
            const data = results[0].geometry.location;
            resolve([data.lat(), data.lng()]);
          }
        });
      })
    })  
  }
  getZipcodeFromLocation(location: [number, number]): Promise<string>{
    return new Promise((resolve, reject) => {
      this._maps.load().then(() => {
        new google.maps.Geocoder().geocode({location: {lat: location[0], lng: location[1]}}, (results, status)=>{
          if(status == 'OK' && results.length > 0){
            const data = results[0].address_components;
            let zipcode: string;
            for(let d of data){
              if(d.types.indexOf('postal_code') != -1){
                zipcode = d.long_name;
                break;
              }
            }
            if(zipcode){ resolve(zipcode); }
            else{ reject(); }
          }
          else{ reject(); }
        })
      });
    })
  }

  /** trigger when click save / clear in zipcode filter menu and update listingPayload & map. then start listing */
  async updateFilterLocation(type: string){
    const f = this.getFilter('location');
    this.listingPayload.miles = f.data.distance;
      
    const zipcode = f.data.address.replace(/\s{2,}/g, '');
    this._sharedService.loader('show');
    if(zipcode.length > 0){
      let latLng: [number, number];
      try { 
        latLng = await this.getLocationFromZipcode(zipcode); 
        f.active = true;
        this.listingPayload.latLong = latLng[1] + ',' + latLng[0];
        this.searchCenter = {lat: latLng[0], lng: latLng[1], radius: this.listingPayload.miles * 1000 }
        this.setMapdata({lat: latLng[0], lng: latLng[1], zoom: 10});
        this.filterTarget = null;
        this.listing(this.listingPayload);
      }
      catch(err){
        f.active = false;
        this._sharedService.loader('hide');
        this.toastr.error('Please enter valid zip code.');
      }
    }
    /** if user click 'clear' or 'save' without address */
    else{ 
      this.filterTarget = null;
      f.active = (f.data.distance == 100) ? false : true;
      f.data.address = this.initialLocation.address;

      this.listingPayload.latLong = (this.initialLocation.isLocationEnabled) ? (this.initialLocation.lng + ',' + this.initialLocation.lat) : '';
      this.searchCenter = {lat: this.initialLocation.lat, lng: this.initialLocation.lng, radius: this.initialLocation.radius};
      this.setMapdata({lat: this.initialLocation.lat, lng: this.initialLocation.lng, zoom: this.initialLocation.zoom });

      this.listing(this.listingPayload);
    }    
  }

  /** trigger when click save / clear in filter menu and update listingPayload. then start listing (optional) */
  updateFilter(id: string, listing: boolean = true) {
    const f = this.getFilter(id);

    if (f.type === 'radio') {
      let val: string = null;
      let selected: QuestionnaireAnswer;
      for (let i = 0; i < f.options.length; i++) {
        if (f.options[i].active) { selected = f.options[i]; break; }
      }
      val = selected ? selected._id : null;

      f.active = val ? true : false;
      if (!val) { this.removeFilterOne(f.payloadName); } else { this.setFilterOne(val, f.payloadName); }

    } else if (f.type === 'checkbox') {
      const vals: string[] = [];
      f.options.forEach(o => { if (o.active) { vals.push(o._id); } });

      f.active = (vals.length > 0) ? true : false;
      if (vals.length > 0) { this.setFilterOne(vals, f.payloadName); } else { this.removeFilterOne(f.payloadName); }
    } else if (f.type === 'slider') {
      this.setFilterOne(f.range.current, f.payloadName);
      f.active = (f.range.current !== f.range.default);
    }

    if(listing){
      this.listing(this.listingPayload);
      this.setFilterTarget(null);  
    }
  }

  removeFilterAll(){
    const o = this.listingPayload;
//    o.ids = [];
//    o.type = 'service';
//    o.keyword = '';

    this.filters.forEach(f=>{
      if(f.range){ f.range.current = f.range.default; }
      if(f.options){
        f.options.forEach(o=>{ o.active = false; });
      }
      this.updateFilter(f._id, false);
    });
    this.listing(this.listingPayload);
  }

  removeService(i: number){
    const id = this.listingPayload.services[i];
    this.listingPayload.services.splice(i,1);

    if(id == this.id){
      this.id = null;
      this.setQueryParams();
    }else{
      this.listing(this.listingPayload);
    }
  }
  removeKeyword(){ 
    this.keyword = '';
    this.setQueryParams();
  }
  removeCustomerHealth(i: number){
    this.listingPayload.customer_health.splice(i, 1);
    this.listing(this.listingPayload);
  }

  setQueryParams(){
    const params: {id?: string, keyword?: string} = {};
    if(this.keyword && this.keyword.length > 0){ params.keyword = this.keyword; }
    if(this.id && this.id.length > 0){ params.id = this.id; }

    this.router.navigate(['./'], {
      queryParams: params,
      relativeTo: this.route
    });
  }

  changePage(i: number) {
    if (i <= 0) { i = 1; } else if (i > this.pages.data.length) { i = this.pages.data.length; }
    this.pages.current = i;

    setTimeout(() => {
      const rectF = this.host.querySelector('#expertFinder').getBoundingClientRect();;
      const rectL = this.host.querySelector('#professionalList').getBoundingClientRect();
      window.scrollBy(0, rectF.top - rectF.height + rectL.top);
    });
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
  range?: { min: number; max: number; current: number; default: number };
  data?: {distance: number, address: string} /** for location */
}

const filtersPreset: Filter[] = [
  { _id: 'location', item_text: 'Location', type: '', payloadName: '', active: false, data: {distance: 100, address: ''}},
  // { _id: 'zipcode', item_text: 'Zip Code', type: 'input', payloadName: 'zipcode', active: false, data: {value: '', placeholder: 'Please input zip code'} },
  // { _id: 'distance', item_text: 'Distance', type: 'slider', payloadName: 'miles', active: false, range: { min: 5, max: 100, current: 100, default: 100 } },
  {
    _id: 'gender', item_text: 'Gender', type: 'radio', payloadName: 'gender', active: false, options: [
      // {_id: 'all', item_text: 'All', active: false, subans: false},
      { _id: 'male', item_text: 'Male', active: false, subans: false },
      { _id: 'female', item_text: 'Female', active: false, subans: false }
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
  { _id: 'language', item_text: 'Language', type: 'radio', payloadName: 'languageId', active: false, options: [/** use server data */] },
  { _id: 'availability', item_text: 'Availability', type: 'checkbox', payloadName: 'typical_hours', active: false, options: [/** use server data */] },
  { _id: 'serviceOffer', item_text: 'Service type', type: 'checkbox', payloadName: 'serviceOfferIds', active: false, options: [/** use server data */] },
  {
    _id: 'pricing', item_text: 'Pricing', type: 'radio', payloadName: 'price_per_hours', active: false, options: [
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
  languageId: '',
  typicalHoursId: '',
  rating: 0,
  miles: 100,
  latLong: '',
  age_range: [],
  name: '',
  // type: 'service',
  price_per_hours: '',
  gender: '',
  typical_hours: [],
  keyword: '',
  virtual: false,
}