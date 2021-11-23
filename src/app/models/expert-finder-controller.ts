import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Params } from "@angular/router";
import { priceRange } from "../shared/form-item-pricing/form-item-pricing.component";
import { SearchKeywords } from "../shared/search-bar/search-bar.component";
import { GeoLocationType } from "../shared/services/user-location.service";
import { locations } from "../_helpers/location-data";
import { findAbbrByFullnameOf, findFullnameByAbbrOf } from "../_helpers/questionnaire-answer-map";
import { Professional } from "./professional";
import { IGetPractitionersResult } from "./response-data";

export interface IExpertFinderFilterParams extends Params {
  categoryId: string,
  city: string,
  typeOfProviderId: string
}

export interface IExpertFinderFilterQueryParams extends Params {
  gndr: string, //m,f (array) --> gender
  rate: string, //3 (string) --> rating
  lng: string, //en,cn (array) --> languageId
  aval: string, //1,2,3 (array) --> typica_hours
  offr: string, // 1,2,3 (array) --> serviceOfferIds
  prmin: string, //50 (string) --> price_per_hours
  prmax: string, //100 (string) --> price_per_hours
  age: string,  //1,2,3  (array) --> age_range
  lt: string, //123.09475 (string) --> latLong
  lg: string, //49.09934 (string) --> latLong
  svc: string, //1,2,3 (array) --> services (customerHealth, category, typeOfProvider, treatmentModality)
  keyword: string, ///adfaer (string)
  keyloc: string, ///british columbia (string)
  zoom: string, //8 (string)
  dist: string,
  vr: string, 
  pg: string, // --> page number
}

export interface IFilterData extends IExpertFinderFilterQueryParams, IExpertFinderFilterParams {}


export class ExpertFinderController {

  get gender() { return this._gender; }
  get languageId() { return this._languageId; }
  get typical_hours() { return this._typical_hours; }
  get price_per_hours() { return this._price_per_hours; }
  get age_range() { return this._age_range; }
  get serviceOfferIds() { return this._serviceOfferIds; }
  get category() { return this._category || []; }
  get typeOfProvider() { return this._typeOfProvider || []; }
  get customerHealth() { return this._customerHealth || []; }
  get services() { return this._category.concat(this._typeOfProvider).concat(this._customerHealth); }

  // get rating() { return this._rating; }
  // get virtual() { return this._virtual; }

  get locationInitializedByFilter() { return this._locationInitializedByFilter; }

  get professionalsInitialized() { return this._professionalsInitialized; }
  get professionals() { return this._professionalsPerPage; }
  get professionalsAll() { return this._professionals; }
  get countAll() { return this._professionals.length; }
  get countPerPage() { return this._countPerPage; }

  get paginator() { return this._paginator; }

  get mapData() {
    return (this._lat && this._lng && this._zoom) ? {
      lat: this._lat,
      lng: this._lng,
      zoom: this._zoom,
    } : {
      lat: 53.89,
      lng: -111.25,
      zoom: 3,
    }
  }

  get isFilterApplied() { return this._isFilterApplied; }
  get isVirtual() { return this._virtual; }

  private _gender: string[] = [];
  private _languageId: string[] = [];
  private _typical_hours: string[] = [];
  private _age_range: string[] = [];
  private _serviceOfferIds: string[] = [];
  private _category: string[] = [];
  private _typeOfProvider: string[] = [];
  private _customerHealth: string[] = [];

  private _price_per_hours: string[] = [];

  private _rating: number = 0;
  private _lat: number = null;
  private _lng: number = null;
  private _zoom: number = null;
  private _dist: number = null;
  private _virtual: boolean;
  private _keyword: string = null;
  private _keyloc: string = null;

  private _locationInitializedByFilter = false;
  private _professionalsInitialized = false;

  private _professionals: Professional[] = [];
  private _professionalsPerPage: Professional[] = [];
  private _paginator: any = [[]];

  private _countPerPage: number;
  private _isFilterApplied: boolean = false;

  constructor(data: IFilterData, option: IOptionExpertFinderController = {}) {
    const o = new OptionExpertFinderController(option);
    this._countPerPage = o.countPerPage;

    if(data.categoryId) { this._category.push(data.categoryId); }
    if(data.typeOfProviderId) { this._typeOfProvider.push(data.typeOfProviderId); }

    this._lat = Number(data.lt) || null;
    this._lng = Number(data.lg) || null;
    this._zoom = Number(data.zoom) || null;
    this._dist = Number(data.dist) || 100;

    if ((!this._lat || !this._lng) && data.city) {
      const city = locations[data.city];
      this._lat = city.lat;
      this._lng = city.lng;
      this._zoom = city.zoom;
      this._dist = city.distance;
    } 

    this._locationInitializedByFilter = !!(this._virtual || (this._lat && this._lng));

    const fields = {
      gender: 'gndr',
      languageId: 'lng',
      typical_hours: 'aval',
      age_range: 'age',
      serviceOfferIds: 'offr',
      category: 'cat',
      customerHealth: 'cnd',
    }

    for (let key in fields) {
      const array = (data[fields[key]] || '').split(',');
      array.forEach((d: string) => {
        const val = findFullnameByAbbrOf(d, fields[key]);
        if(val){
          this['_' + key].push(val);
        }
      });
    }

    const prmin = Number(data.prmin) || 0;
    const prmax = Number(data.prmax) || 0;
    if(prmin>=0 && prmax>=0 && prmax>prmin) {
      priceRange.forEach(p => {
        const [min, max] = p.minmax;
        if(prmin <= min && prmax >= max) {
          this._price_per_hours.push(p.value);
        }
      });
    }

    this._rating = Number(data.rate) || 0;
    this._virtual = !!(data.vr == '1');
    this._keyword = data.keyword || null;
    this._keyloc = data.keyloc || null;

    this.checkIfFilterApplied();
  }

  updateFilter(id: FilterFieldName, data: string[] | boolean | number | string) {
    this['_' + id] = data;
    this.checkIfFilterApplied();
  }

  updateFilterByKeywords(keywords: SearchKeywords) {
    this._keyword = keywords.searchBySituation;
    this._keyloc = keywords.searchByLocation;
    if(keywords.searchByArea) {
      const area = locations[keywords.searchByArea];
      this._keyloc = null;
      this.updateFilterByMap({lat: area.lat, lng: area.lng, zoom: area.zoom, dist: area.distance});
    }
  }

  updateFilterByUserLocation(location: GeoLocationType) {
    if (location) {
      this._lat = location.lat;
      this._lng = location.lng;
      this._zoom = 12;
    }
    // this.checkIfFilterApplied();
  }

  updateFilterByProfessionalsLocation() {
    this._keyloc = null;

    let [lng, lat] = [0,0]
    this.professionalsAll.forEach(p => {
      lng += p.location[0];
      lat += p.location[1];
    });
    this.updateFilterByUserLocation({
      lat: lat / this.professionalsAll.length,
      lng: lng / this.professionalsAll.length
    });
  }

  updateFilterByMap(data: {lat: number, lng: number, zoom: number, dist: number}) {
    this._lat = data.lat;
    this._lng = data.lng;
    this._zoom = data.zoom;
    this._dist = data.dist;
    // this.checkIfFilterApplied();
  }

  createForm(): FormGroup {
    return new FormGroup({
      gender: new FormArray([]),
      languageId: new FormArray([]),
      typical_hours: new FormArray([]),
      price_per_hours: new FormArray([]),
      age_range: new FormArray([]),
      serviceOfferIds: new FormArray([]),
      rating: new FormControl(this._rating),
      virtual: new FormControl(this._virtual),
      distance: new FormControl(this._dist),
      category: new FormGroup({}),
      customerHealth: new FormGroup({}),
    });
  }

  toQueryParams(): Params {
    const res: Params = {};

    const fields = {
      gender: 'gndr',
      languageId: 'lng',
      typical_hours: 'aval',
      age_range: 'age',
      serviceOfferIds: 'offr',
      category: 'cat',
      customerHealth: 'cnd'
    }

    for (let key in fields) {
      const data: string[] = this['_' + key];
      if(data?.length > 0) {
        const abbrs = [];
        data.forEach(d => {
          const val = findAbbrByFullnameOf(d, fields[key]);
          if(val) {
            abbrs.push(val);
          }
        });
        if(abbrs.length > 0) {
          res[fields[key]] = abbrs.join(',');
        }
      }
    }

    if(this._lat) { res.lt = Math.round(this._lat * 10000) / 10000; }
    if(this._lng) { res.lg = Math.round(this._lng * 10000) / 10000; }
    if(this._zoom) { res.zoom = this._zoom; }
    if(this._dist) { res.dist = Math.floor(this._dist); }
    if(this._virtual == true) { res.vr = 1; }
    if(this._keyword) { res.keyword = this._keyword; }
    if(this._keyloc) { res.keyloc = this._keyloc; }
    if(this._rating) { res.rate = this._rating; }

    if(this.price_per_hours) {
      let prmax = -10000;
      let prmin = 100000;
      this.price_per_hours.forEach(p=> {
        for (let data of priceRange) {
          if(p == data.value) {
            const [min, max] = data.minmax;
            if (min < prmin) {
              prmin = min;
            }
            if (max > prmax) {
              prmax = max;
            }
          }
        }
      });
      if(prmax > 0) {
        res.prmax = prmax;
      }
      if(prmin <= 10000) {
        res.prmin = prmin;
      }
    }
    return res;
  }

  // toQueryParamsString(): string {
  //   const params = this.toQueryParams();
  //   let res = '?';
  //   for(let key in params) {
  //     res += key + '=' + params[key] + '&';
  //   }
  //   return res.slice(0,-1);
  // }

  toPayload() {
    const res: {[k: string]: any} = {
      // ids: [],
      rating: this._rating,
      gender: this.gender,
      languageId: this.languageId,
      typical_hours: this.typical_hours,
      price_per_hours: this.price_per_hours,
      age_range: this.age_range,
      serviceOfferIds: this.serviceOfferIds,    
      services: this.services,
      ...this._keyword && {keyword: this._keyword},
      ...this._keyloc && {keyloc: this._keyloc},
    };

    if (this._virtual) {
      res.virtual = true;
    } 
    // else if(this._keyword || this._keyloc){
    //   res.latLong = '';
    //   res.miles = null;
    // } 
    else if(this._lat && this._lng) {
      res.latLong = this._lng + ', ' + this._lat;
      res.miles = this._dist;
    } else {
      res.latLong = '';
      res.miles = null;
    }
    return res;
  }

  disposeProfesionnals() {
    this._professionalsPerPage = [];
    this._professionals = [];
    this._paginator = [[]];
    this._professionalsInitialized = false;
  }

  setProfessionals(data: IGetPractitionersResult['data']['dataArr']) {
    const professionals = [];
    data.forEach(d => {
      const p = new Professional(d.userId, d.userData)
      p.setMapIcon();
      professionals.push(p);
    });

    this._professionals = professionals;
    this._professionalsInitialized = true;
  }

  setProfesionnalsPerPage(pageCurrent: number = 1) {
    const from = (pageCurrent - 1) * this._countPerPage;
    const to = from + this._countPerPage;
    this._professionalsPerPage = this._professionals.slice(from, to);
  }

  initPaginator(pageCurrent: number) {
    const pageTotal = Math.ceil(this._professionals.length / this._countPerPage);
    const paginator: {page: number; shown : boolean}[] = [];
    
    for(let i=1; i<=pageTotal; i++) {
      let shown = false;
      if(i == 1 || i == pageTotal) { 
        shown = true; 
      } else {
        const dist = (pageCurrent == 1 || pageCurrent == pageTotal) ? 2 : 1;
        if(Math.abs(i - pageCurrent) > dist) {
          shown = false;
        } else {
          shown = true;
        }
      }

      paginator.push({
        page: i,
        shown: shown,
      });
    }

    this._paginator = [[]];
    paginator.forEach(p => {
      if(p.shown) {
        this._paginator[this._paginator.length - 1].push(p.page);
      } else {
        if(this._paginator[this._paginator.length - 1].length > 0) {
          this._paginator.push([]);
        }
      }
    });
  }

  checkIfFilterApplied() {
    let applied = false;
    applied = this._rating > 0;
    const arrayFields: FilterFieldName[] = ['gender', 'languageId', 'typical_hours', 'price_per_hours', 'age_range', 'serviceOfferIds', 'category', 'customerHealth'];
    for(let name of arrayFields) {
      const data = this['_' + name];
      if(data && data.length > 0) {
        applied = true;
        break;
      }
    }
    if(this._dist != 100) {
      applied = true;
    }
    if(this._rating > 0) {
      applied = true;
    }
    this._isFilterApplied = applied;
  }

}

export type FilterFieldName = 
  'gender' | 'languageId' | 'serviceOfferIds' | 'typical_hours' | 'price_per_hours' | 'age_range' | //string[]
  'category' | 'customerHealth' | //string[]. merged into services
  'rating' | 'lat' | 'lng' | 'zoom' | 'dist' |  // number
  'keyword' | 'keyloc' | // string
  'virtual'; // boolean

interface IOptionExpertFinderController {
  countPerPage?: number;
}

class OptionExpertFinderController {

  get countPerPage() { return this.data.countPerPage ? this.data.countPerPage : 20; }
  constructor(private data: IOptionExpertFinderController) {}
}