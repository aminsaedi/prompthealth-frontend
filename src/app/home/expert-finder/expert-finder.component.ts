import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { ExpertFinderController, FilterFieldName, IExpertFinderFilterParams, IExpertFinderFilterQueryParams, IFilterData } from 'src/app/models/expert-finder-controller';
import { Questionnaire } from 'src/app/models/questionnaire';
import { IGetPractitionersResult } from 'src/app/models/response-data';
import { FormItemCheckboxGroupComponent } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService, QuestionnairesProfileService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { GeoLocationService } from 'src/app/shared/services/user-location.service';
import { getDistanceFromLatLng } from 'src/app/_helpers/latlng-to-distance';

@Component({
  selector: 'app-expert-finder',
  templateUrl: './expert-finder.component.html',
  styleUrls: ['./expert-finder.component.scss']
})
export class ExpertFinderComponent implements OnInit {

  get sizeS() { return !window || window.innerWidth < 768; }
  get f() { return this.formFilter.controls; }

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

  @ViewChildren('filter') private filters: QueryList<FormItemCheckboxGroupComponent>;

  constructor(
    private _geoService: GeoLocationService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _changeDetector: ChangeDetectorRef,
    private _modalService: ModalService,
    private _qService: QuestionnaireService,
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

  async ngOnInit() {
    this.initController();
    this.questionnaires = await this._qService.getProfilePractitioner('SP');

    this._route.params.pipe(skip(1)).subscribe(() => {
      console.log('params changed')
      this.initController();
    });

    // this._route.queryParams.pipe(skip(1)).subscribe(() => {
      
    //   this.initController();
    // });
  }



  initController() {
    const filterData: IFilterData = {
      ...this._route.snapshot.queryParams as IExpertFinderFilterQueryParams,
      ...this._route.snapshot.params as IExpertFinderFilterParams,
    }
    this.controller = new ExpertFinderController(filterData, {countPerPage: 3});
    this.formFilter = this.controller.createForm();

    if (!this.controller.locationInitializedByFilter) {
      this._geoService.getCurrentLocation().then(location => {
        this.controller.updateFilterByUserLocation(location);
        this.search();
      }, () => {
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
    const isVirtual = this.f.virtual.value; 
    this.controller.updateFilter('virtual', isVirtual);
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
    this.mapDataCurrent.dist = dist;
  }

  onMapClicked(e) {

  }

  onMapMarkerClicked(e) {}

  changePage(i: number) {
    //change route by location (not router)

    this.pageCurrent = i;
    this.controller.setProfesionnalsPerPage(i);
    this.controller.initPaginator(i);
  }

  onClickButtonUpdateUserLocation() {
    this._geoService.updateCurrentLocation().then(location => {
      this.controller.updateFilterByUserLocation(location);
    });
  }

  onClickButtonSearchInThisArea() {
    this.controller.updateFilterByMap(this.mapDataCurrent);

    const [path, query] = this._modalService.currentPathAndQueryParams;
    this._router.navigate([path], {queryParams: this.controller.toQueryParams()});
    this.search();
  }

  onClickButtonMapSize() {
    this.viewState.style = (this.viewState.style == 'list') ? 'map' : 'list';
  }

  updateCompareList() {}

  onFilterReseted() {
    this.filters.forEach(filter => {
      filter.deselectAll();
      this.controller.updateFilter(filter.id as FilterFieldName, []);
    });
  }

  onFilterSaved() {
    this.filters.forEach(filter => {
      this.controller.updateFilter(filter.id as FilterFieldName, filter.getSelected());
    });
    this.closeModalAndStartSearch();
  }

  closeModalAndStartSearch() {
    const [path, query] = this._modalService.currentPathAndQueryParams;
    this._modalService.hide(true, [path], this.controller.toQueryParams());
    this.search();
  }

  search() {
    const payload = this.controller.toPayload();
    this.controller.disposeProfesionnals();
    this._sharedService.postNoAuth(payload, 'user/filter').subscribe((res: IGetPractitionersResult) => {
      this.controller.setProfessionals(res.data);
      this.changePage(1);
    })
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