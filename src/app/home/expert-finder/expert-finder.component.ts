import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { ExpertFinderController, FilterFieldName, IExpertFinderFilterParams, IExpertFinderFilterQueryParams, IFilterData } from 'src/app/models/expert-finder-controller';
import { Professional } from 'src/app/models/professional';
import { IGetPractitionersResult } from 'src/app/models/response-data';
import { FormItemCheckboxGroupComponent } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { SearchBarComponent } from 'src/app/shared/search-bar/search-bar.component';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { GeoLocationService } from 'src/app/shared/services/user-location.service';
import { expandVerticalAnimation, fadeAnimation, slideVerticalAnimation } from 'src/app/_helpers/animations';
import { getDistanceFromLatLng } from 'src/app/_helpers/latlng-to-distance';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';
import { titleCaseOf } from 'src/app/_helpers/titlecase';

@Component({
  selector: 'app-expert-finder',
  templateUrl: './expert-finder.component.html',
  styleUrls: ['./expert-finder.component.scss'],
  animations: [slideVerticalAnimation, fadeAnimation, expandVerticalAnimation],
})
export class ExpertFinderComponent implements OnInit {

  get sizeS() { return !window || window.innerWidth < 768; }
  get f() { return this.formFilter.controls; }
  get fCompare() { return this.formCompare.controls; }
  get isFilterApplied() { return this.controller.isFilterApplied; }
  get isVirtual() { return this.controller.isVirtual; }

  professionalOf(id: string) {
    const professionals = this.controller.professionalsAll
    let res: Professional = null;
    if(professionals) {
      for(let p of professionals) {
        if(p._id == id) {
          res = p;
          break;  
        }
      }
    }
    return res;
  }

  public viewState: IViewState = {
    style: 'list',
    isGettingUserLocation: false,
  }

  public mapRect = {
    top: 0,
    height: 0,
  }

  public controller: ExpertFinderController;
  public pageCurrent: number = 1;

  public questionnaires: QuestionnaireMapProfilePractitioner;

  private mapDataCurrent: {lat: number, lng: number, zoom: number, dist: number} = {lat: null, lng: null, zoom: null, dist: null};
  private formFilter: FormGroup;
  private formCompare: FormGroup;

  private queryParamsCurrent: Params;
  public selectedProfessionalInMap: Professional;
  public compareList: Professional[] = [];

  public distanceFilterData = {
    min: 5,
    max: 100,
    step: 1,
    isLabelShown: false,
  }

  @ViewChildren('filter') private filters: QueryList<FormItemCheckboxGroupComponent>;
  @ViewChild('searchBar') private searchBar: SearchBarComponent;
  @ViewChild('blurSearchbar') private blurSearchBar: ElementRef;

  constructor(
    private _geoService: GeoLocationService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _changeDetector: ChangeDetectorRef,
    private _modalService: ModalService,
    private _qService: QuestionnaireService,
    private _toastr: ToastrService,
    private _catService: CategoryService,
  ) { }

  private subscriptionGeoLocation: Subscription;

  ngOnDestroy() {
    if(this.subscriptionGeoLocation) {
      this.subscriptionGeoLocation.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    const mapRect = this.getMapBoundingRect();
    if(mapRect.top != this.mapRect.top || mapRect.height != this.mapRect.height) {
      this.mapRect = mapRect;
      this._changeDetector.detectChanges();
    }
  }

  ngAfterViewInit() {
    const query = this._route.snapshot.queryParams as IExpertFinderFilterQueryParams;
    if(query.keyword) {
      this.searchBar.setKeyword(query.keyword);
    }
    if(query.keyloc) {
      this.searchBar.setLocation(query.keyloc);
    }

    const param = this._route.snapshot.params as IExpertFinderFilterParams;
    if(param.city) {
      this.searchBar.setLocation(param.city);
      const el = this.blurSearchBar.nativeElement as HTMLDivElement;
      if(el) {
        el.click();
      }
    }
  }

  async ngOnInit() {
    this.initController();

    this._route.params.pipe(skip(1)).subscribe(() => {
      this.initController();
    });

    this._route.queryParams.subscribe((param: IExpertFinderFilterQueryParams) => {
      if(param.modal) {
        this.showFilterDistanceLabel();
      }
      const p = {...param};
      delete p.page;
      delete p.modal;
      delete p['modal-data'];
      delete p.menu;

      if(this.queryParamsCurrent && JSON.stringify(p) != JSON.stringify(this.queryParamsCurrent)) {
        this.initController();
      }

      this.queryParamsCurrent = p;
    });

    this.questionnaires = await this._qService.getProfilePractitioner('SP');
    this.setMeta();
  }

  async setMeta() {
    const param = this._route.snapshot.params as IExpertFinderFilterParams;

    let category = null;
    if(param.categoryId) {
      await this._catService.getCategoryAsync(); 
      category = this._catService.titleOf(param.categoryId).toLowerCase();
    }

    let typeOfProvider: string = null;
    if(param.typeOfProviderId) {
      const answer = this.questionnaires.typeOfProvider.answers.find(item => item._id == param.typeOfProviderId);
      typeOfProvider = answer ? answer.item_text.toLowerCase() : null;
    }

    let city = param.city ? titleCaseOf(param.city) : null;
    
    let specialist = category ? `${category} specialists` : typeOfProvider ? `${typeOfProvider}` : 'health care providers';
    let area = city ? city : 'Canada';


    let desc = 'Use our Expert Finder to find a top-rated ';
    desc += 

    this._uService.setMeta(this._router.url, {
      title: `Find best ${specialist} in ${area} | PromptHealth`,
      description: `Use our Expart Finder to find a top-rated ${specialist} in ${area} or offering virtual appointment.`,
    });  

  }

  initController() {
    const filterData: IFilterData = {
      ...this._route.snapshot.queryParams as IExpertFinderFilterQueryParams,
      ...this._route.snapshot.params as IExpertFinderFilterParams,
    }
    this.controller = new ExpertFinderController(filterData, {countPerPage: 10});
    if(!this.formFilter) {
      this.formFilter = this.controller.createForm();
      this.f.distance.valueChanges.subscribe(() => {
        this.showFilterDistanceLabel();
      });
    }

    if (!this.controller.locationInitializedByFilter) {
      this.viewState.isGettingUserLocation = true;
      this._geoService.getCurrentLocation().then(location => {
        this.viewState.isGettingUserLocation = false;
        this.controller.updateFilterByUserLocation(location);
        this.search();
      }, () => {
        this.viewState.isGettingUserLocation = false;
        this.search();
      });
    } else {
      this.search();
    }
  }

  getMapBoundingRect(): IRect {
    if(!this._uService.isServer) {
      const header = document.getElementsByTagName('header')[0] as HTMLElement;
      const h = window.innerHeight;
      const hHeader = header.clientHeight;
      return {top: hHeader, height: h - hHeader}; 
    } else {
      return {top: 0, height: 0};
    }
  }

  onClickButtonToggleVirtual() { 
    this.controller.updateFilter('virtual', !this.isVirtual);

    const [path, query] = this._modalService.currentPathAndQueryParams;
    this._router.navigate([path], {queryParams: this.controller.toQueryParams()});
    // this.search();
  }
  
  onMapZoomChanged(e: number) {
    this.mapDataCurrent.zoom = e;
  }

  onMapMoved(e: google.maps.LatLngBounds) {
    const bounds = e.toJSON();
    const center = e.getCenter();    
    const dist = getDistanceFromLatLng(bounds.north, bounds.east, bounds.south, bounds.west);
    this.mapDataCurrent.lat = center.lat();
    this.mapDataCurrent.lng = center.lng();
    this.mapDataCurrent.dist = Math.floor(dist);
  }

  onMapClicked(e: Event) {
    this.selectedProfessionalInMap = null;
  }

  onMapMarkerClicked(professional: Professional) {
    if(this.selectedProfessionalInMap && professional._id == this.selectedProfessionalInMap._id) {
      this.selectedProfessionalInMap.setMapIcon();
      this.selectedProfessionalInMap = null;
    } else {
      if(this.selectedProfessionalInMap) {
        this.selectedProfessionalInMap.setMapIcon();
      }
      
      this.selectedProfessionalInMap = professional;
      this.selectedProfessionalInMap.setMapIcon(true);
      this._changeDetector.detectChanges();  
    }
  }

  changePage(i: number) {
    //change route by location (not router)

    this.pageCurrent = i;
    this.controller.setProfesionnalsPerPage(i);
    this.controller.initPaginator(i);
    if(this._uService.isBrowser) {
      smoothWindowScrollTo(0);
    }
  }

  onClickButtonUpdateUserLocation() {
    this.viewState.isGettingUserLocation = true;
    this._geoService.updateCurrentLocation().then(location => {
      this.viewState.isGettingUserLocation = false;
      this.controller.updateFilterByUserLocation(this.mapDataCurrent);
      setTimeout(() => {
        this.controller.updateFilterByUserLocation(location);
        this._changeDetector.detectChanges();  
      }, 100);
    }, error => {
      this.viewState.isGettingUserLocation = false;
      if (error.code == 1) {
        this._toastr.success('Please enable your location in order to see options in your geographical area. Alternatively you can only view virtual options!')
      } else {
        this._toastr.error('Could not get current location');
      }
    });
  }

  onClickButtonSearchInThisArea() {
    this.controller.updateFilterByMap(this.mapDataCurrent);
    this.f.distance.setValue(this.mapDataCurrent.dist);

    const [path, query] = this._modalService.currentPathAndQueryParams;
    this._router.navigate([path], {queryParams: this.controller.toQueryParams()});
    // this.search();
  }

  onClickButtonMapSize() {
    this.viewState.style = (this.viewState.style == 'list') ? 'map' : 'list';
  }

  onClickButtonFilterRating(i: number) {
    const valueCurrent = this.f.rating.value;
    const valueNext = valueCurrent == i ? 0 : i;
    this.f.rating.setValue(valueNext);
  }

  onFilterReseted() {
    this.filters.forEach(filter => {
      filter.deselectAll();
      this.controller.updateFilter(filter.id as FilterFieldName, []);
    });
    this.f.distance.setValue(100);
    this.f.rating.setValue(0);

    this.controller.updateFilter('dist', this.f.distance.value);
    this.controller.updateFilter('rating', this.f.rating.value);

    this.closeModal();
  }

  onFilterSaved() {
    this.filters.forEach(filter => {
      this.controller.updateFilter(filter.id as FilterFieldName, filter.getSelected());
    });

    this.controller.updateFilter('dist', this.f.distance.value);
    this.controller.updateFilter('rating', this.f.rating.value);

    this.closeModal();
  }

  private timerFilterDistance: any;
  showFilterDistanceLabel() {
    this.distanceFilterData.isLabelShown = true;
    if(this.timerFilterDistance) {
      clearTimeout(this.timerFilterDistance);
    }
    this.timerFilterDistance = setTimeout(() => {
      this.distanceFilterData.isLabelShown = false;
    }, 1200);
  } 
  getDistanceFilterLabelPosition(val: number) {
    const d = this.distanceFilterData;
    const left = 100 / (d.max - d.min) * (val - d.min);
    return left > 100 ? 100 : left < 0 ? 0 : left;
  }

  closeModal() {
    const [path, query] = this._modalService.currentPathAndQueryParams;
    this._modalService.hide(true, [path], this.controller.toQueryParams());
  }

  preventDefaultClickAction(e: Event, stopPropagation = true) {
    e.preventDefault();
    if(stopPropagation) {
      this.stopPropagation(e);
    }
  }

  stopPropagation(e: Event) {
    e.stopPropagation();    
  }

  search() {
    const payload = this.controller.toPayload();
    this.controller.disposeProfesionnals();
    this._sharedService.postNoAuth(payload, 'user/filter').subscribe((res: IGetPractitionersResult) => {
      this.controller.setProfessionals(res.data.dataArr);
      const professionals = this.controller.professionalsAll;
      this.formCompare = new FormGroup({});
      if(professionals){
        professionals.forEach(p => {
          this.formCompare.addControl(p._id, new FormControl());
        });  
        if(this.queryParamsCurrent.keyloc) {
          this.controller.updateFilterByProfessionalsLocation();

        }
      }
      this.changePage(1);
    })
  }

  onChangeCompareValue(id: string) {
    const selected = this.fCompare[id].value;
    if(selected) {
      this.addToCompareList(id);
    } else {
      this.removeFromCompareList(id, false);
    }
  }
  removeFromCompareList(id: string, updateValue: boolean = true) {
    this.compareList = this.compareList.filter(p => p._id != id);
    const controller = this.fCompare[id];
    if(updateValue && controller) {
      controller.setValue(false);
    }
  }

  addToCompareList(id: string) {
    const exist = this.compareList.find(p => p.id == id);
    if(!exist) {
      this.compareList.push(this.professionalOf(id));
    }
  }

  setCompare() {
    this._sharedService.setCompareList(this.compareList);
    this._router.navigate(['/compare-practitioners']);
  }

}

interface IViewState {
  style: 'list' | 'map';
  isGettingUserLocation: boolean;
}

interface IRect {
  top: number,
  height: number
}