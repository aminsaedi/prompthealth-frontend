import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren , OnDestroy } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Subscription , Subject } from 'rxjs';
import { skip , take, takeUntil } from 'rxjs/operators';
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
import { slugify } from 'src/app/_helpers/slugify';
import { BreadcrumbItem } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';

@Component({
  selector: 'app-expert-finder',
  templateUrl: './expert-finder.component.html',
  styleUrls: ['./expert-finder.component.scss'],
  animations: [slideVerticalAnimation, fadeAnimation, expandVerticalAnimation],
})
export class ExpertFinderComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get sizeS() { return !window || window.innerWidth < 768; }
  get f() { return this.formFilter?.controls; }
  get fCompare() { return this.formCompare.controls; }
  get isFilterApplied() { return this.controller.isFilterApplied; }
  get isVirtual() { return this.controller.isVirtual; }

  // list of selected category & typeOfProvider
  // used for showing which field are selected. 
  get selectedTypesLabel() {
    return this.selectedTypes.length == 0 ? 
        'all different fields' :
        this.selectedTypes.length == 1 ? 
          this.selectedTypes[0].item_text : 
          'several fields that you select';
  }
  get selectedTypes() {
    const result = [];
    if(this._catService.categoryList && this.questionnaires) {
      this.controller.category.forEach(id => {
        const cat = this._catService.categoryListFlatten.find(item => item._id == id);
        if(cat) {
          result.push(cat);
        }
      });
      
      this.controller.typeOfProvider.forEach(id => {
        const type = this.questionnaires.typeOfProvider.answers.find(item => item._id == id);
        if(type) {
          result.push(type);
        }
      })
    }
    return result;
  }



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
  public breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Practitioners' }
  ];
  public pageCurrent: number = 1;
  public pageHeading: string = 'Find Health Care Providers in Canada';

  public questionnaires: QuestionnaireMapProfilePractitioner;

  private mapDataCurrent: {lat: number, lng: number, zoom: number, dist: number} = {lat: null, lng: null, zoom: null, dist: null};
  private formFilter: FormGroup;
  private formCompare: FormGroup;

  private queryParamsCurrent: Params;
  private _jsonLdSet = false;
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
    private _jsonLdService: JsonLdService,
    private _transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  private subscriptionGeoLocation: Subscription;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._jsonLdService.removeJsonLd();
    this._jsonLdSet = false;
    if(this.subscriptionGeoLocation) {
      this.subscriptionGeoLocation.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    if (isPlatformServer(this.platformId)) return;
    const mapRect = this.getMapBoundingRect();
    if(mapRect.top != this.mapRect.top || mapRect.height != this.mapRect.height) {
      this.mapRect = mapRect;
      this._changeDetector.detectChanges();
    }
  }

  ngAfterViewInit() {
    if (isPlatformServer(this.platformId)) return;
    this.searchBar.retrieveData();
    const el = this.blurSearchBar.nativeElement as HTMLDivElement;
    el?.click();
  }

  async ngOnInit() {
    this.questionnaires = await this._qService.getProfilePractitioner('SP');

    await this._catService.getCategoryAsync();

    if (isPlatformServer(this.platformId)) {
      // SSR path: initialize controller and fetch listing data.
      // Kept minimal to avoid zone.js timing issues with stability detection.
      this.initController();
      await this.prefetchListingForSSR();
      // Always set BreadcrumbList JSON-LD during SSR — this only depends on
      // route params, not API results, so it works even if the listing API fails.
      this.ensureBreadcrumbJsonLd();
      this.setMeta();
      return;
    }

    // Client-side fallback: redirect old ObjectId URLs to slug URLs (type)
    const params = this._route.snapshot.params as IExpertFinderFilterParams;
    if (params.typeOfProviderSlug && /^[0-9a-f]{24}$/i.test(params.typeOfProviderSlug)) {
      const answer = this.questionnaires?.typeOfProvider?.answers?.find(
        a => a._id === params.typeOfProviderSlug
      );
      if (answer) {
        const slug = slugify(answer.item_text);
        const segments = params.city
          ? ['/practitioners/type', slug, params.city]
          : ['/practitioners/type', slug];
        this._router.navigate(segments, { replaceUrl: true });
        return;
      }
    }

    // Client-side fallback: redirect old ObjectId URLs to slug URLs (category)
    if (params.categorySlug && /^[0-9a-f]{24}$/i.test(params.categorySlug)) {
      const cat = this._catService.categoryListFlatten.find(
        c => c._id === params.categorySlug
      );
      if (cat) {
        const slug = slugify(cat.item_text);
        const segments = params.city
          ? ['/practitioners/category', slug, params.city]
          : ['/practitioners/category', slug];
        this._router.navigate(segments, { replaceUrl: true });
        return;
      }
    }

    this.initController();

    this._route.params.pipe(skip(1)).pipe(takeUntil(this.destroy$)).subscribe(() => {
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

    this.setMeta();
  }

  async setMeta() {
    const param = this._route.snapshot.params as IExpertFinderFilterParams;

    let category = null;
    if(param.categorySlug) {
      await this._catService.getCategoryAsync();
      category = this._catService.titleOfBySlug(param.categorySlug).toLowerCase();
    } else if(param.categoryId) {
      await this._catService.getCategoryAsync();
      category = this._catService.titleOf(param.categoryId).toLowerCase();
    }

    let typeOfProvider: string = null;
    if(param.typeOfProviderSlug) {
      const answer = this.questionnaires?.typeOfProvider?.answers?.find(
        item => slugify(item.item_text) === param.typeOfProviderSlug
      );
      typeOfProvider = answer ? answer.item_text.toLowerCase() : null;
    } else if(param.typeOfProviderId) {
      const answer = this.questionnaires?.typeOfProvider?.answers?.find(item => item._id == param.typeOfProviderId);
      typeOfProvider = answer ? answer.item_text.toLowerCase() : null;
    }

    let city = param.city ? titleCaseOf(param.city) : null;
    
    let specialist = category ? `${category} specialists` : typeOfProvider ? `${typeOfProvider}` : 'health care providers';
    let area = city ? city : 'Canada';

    this.pageHeading = `Find Best ${titleCaseOf(specialist)} in ${area}`;

    let desc = 'Use our Expert Finder to find a top-rated ';
    desc +=

    this._uService.setMeta(this._router.url, {
      title: `Find best ${specialist} in ${area} | PromptHealth`,
      description: `Use our Expart Finder to find a top-rated ${specialist} in ${area} or offering virtual appointment.`,
    });  

  }

  setListingJsonLd(professionals: Professional[]) {
    const items = professionals.slice(0, 10).map((p, i) => {
      const item: any = {
        '@type': 'ListItem',
        'position': i + 1,
        'item': {
          '@type': 'ProfessionalService',
          'name': p.name,
          'url': p.slug ? `https://www.prompthealth.ca/practitioners/${p.slug}` : `https://www.prompthealth.ca/community/profile/${p._id}`,
          ...(p.profileImageFull ? { 'image': p.profileImageFull } : {}),
          ...(p.city || p.state ? {
            'address': {
              '@type': 'PostalAddress',
              ...(p.city ? { 'addressLocality': p.city } : {}),
              ...(p.state ? { 'addressRegion': p.state } : {}),
              'addressCountry': 'CA',
            }
          } : {}),
          ...(p.rating > 0 && p.ratingCount > 0 ? {
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': p.rating,
              'reviewCount': p.ratingCount,
              'bestRating': 5,
            }
          } : {}),
          ...(p.priceFull && p.priceFull !== 'N/A' ? { 'priceRange': p.priceFull + ' / hr' } : {}),
        },
      };
      return item;
    });

    if (items.length > 0) {
      const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'Healthcare Practitioners',
        'numberOfItems': professionals.length,
        'itemListElement': items,
      };

      const breadcrumbSchema = this.buildBreadcrumbSchema();

      this._jsonLdService.setJsonLd(
        breadcrumbSchema ? [itemListSchema, breadcrumbSchema] : [itemListSchema]
      );
      this._jsonLdSet = true;
    }
  }

  private buildBreadcrumbSchema(): object | null {
    const param = this._route.snapshot.params as IExpertFinderFilterParams;

    let specialtyLabel: string = null;
    if (param.categorySlug) {
      specialtyLabel = this._catService.titleOfBySlug(param.categorySlug);
    } else if (param.typeOfProviderSlug && this.questionnaires?.typeOfProvider?.answers) {
      const answer = this.questionnaires.typeOfProvider.answers.find(
        a => slugify(a.item_text) === param.typeOfProviderSlug
      );
      specialtyLabel = answer ? answer.item_text : null;
    }

    const cityLabel = param.city ? titleCaseOf(param.city) : null;

    const breadcrumbItems: object[] = [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.prompthealth.ca' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Find Practitioners', 'item': 'https://www.prompthealth.ca/practitioners' },
    ];

    let position = 3;

    if (specialtyLabel) {
      const pathSegment = param.categorySlug
        ? `category/${param.categorySlug}`
        : `type/${param.typeOfProviderSlug}`;
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': position++,
        'name': specialtyLabel,
        'item': `https://www.prompthealth.ca/practitioners/${pathSegment}`,
      });
    }

    if (cityLabel) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': position,
        'name': cityLabel,
      });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbItems,
    };
  }

  /**
   * Ensures BreadcrumbList JSON-LD is present in the SSR output even when the
   * listing API call fails or returns no results.  If setListingJsonLd() already
   * injected JSON-LD (which includes both ItemList + BreadcrumbList), this is a
   * no-op because the flag is set.
   */
  private ensureBreadcrumbJsonLd(): void {
    if (this._jsonLdSet) return;
    try {
      const breadcrumbSchema = this.buildBreadcrumbSchema();
      if (breadcrumbSchema) {
        this._jsonLdService.setJsonLd([breadcrumbSchema]);
      }
    } catch (e) {
      // Non-critical — don't let breadcrumb injection crash SSR
    }
  }

  private resolveTypeOfProviderSlug(slug: string): string | null {
    if (!this.questionnaires?.typeOfProvider?.answers) return null;
    const answer = this.questionnaires.typeOfProvider.answers.find(
      a => slugify(a.item_text) === slug
    );
    return answer ? answer._id : null;
  }

  private resolveCategorySlug(slug: string): string | null {
    if (!this._catService.categoryList) return null;
    const cat = this._catService.categoryListFlatten.find(
      c => slugify(c.item_text) === slug
    );
    return cat ? cat._id : null;
  }

  initController() {
    const filterData: IFilterData = {
      ...this._route.snapshot.queryParams as IExpertFinderFilterQueryParams,
      ...this._route.snapshot.params as IExpertFinderFilterParams,
    }

    // Resolve typeOfProviderSlug to typeOfProviderId for the controller
    if (filterData.typeOfProviderSlug && !filterData.typeOfProviderId) {
      const resolvedId = this.resolveTypeOfProviderSlug(filterData.typeOfProviderSlug);
      if (resolvedId) {
        filterData.typeOfProviderId = resolvedId;
      }
    }

    // Resolve categorySlug to categoryId for the controller
    if (filterData.categorySlug && !filterData.categoryId) {
      const resolvedId = this.resolveCategorySlug(filterData.categorySlug);
      if (resolvedId) {
        filterData.categoryId = resolvedId;
      }
    }

    this.controller = new ExpertFinderController(filterData, {countPerPage: 10});
    if (!this.formFilter) {
      this.formFilter = this.controller.createForm();
      this.f.distance.valueChanges.subscribe(() => {
        this.showFilterDistanceLabel();
      });
    }

    // During SSR, skip search() — prefetchListingForSSR() handles data fetching
    // so zone.js properly tracks the HTTP call and Angular Universal waits for it.
    if (isPlatformServer(this.platformId)) {
      return;
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

  // onSearchBarSubmitted(e: SearchKeywords) {
  //   this.controller.updateFilterByKeywords(e);
  //   const [path, query] = this._modalService.currentPathAndQueryParams;
  //   this._router.navigate([path], {queryParams: this.controller.toQueryParams()});
  // }
  
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

  private prefetchListingForSSR(): Promise<void> {
    const LISTING_KEY = makeStateKey<any>('listing-ssr-data');
    const payload = this.controller.toPayload();
    const params = this._route.snapshot.params as IExpertFinderFilterParams;
    return new Promise<void>((resolve) => {
      this._sharedService.postNoAuth(payload, 'user/filter').pipe(take(1)).subscribe(
        (res: IGetPractitionersResult) => {
          try {
            this._transferState.set(LISTING_KEY, res);
            if (res?.data?.dataArr) {
              this.controller.setProfessionals(res.data.dataArr, false);
              const professionals = this.controller.professionalsAll;
              if (professionals && professionals.length > 0) {
                this.setListingJsonLd(professionals);
              } else if (params.city && payload.latLong) {
                // Geo-filtered query returned 0 results for a combined
                // specialty+city page. Retry without geo filter so we can
                // still emit ItemList JSON-LD for SEO purposes.
                const fallbackPayload = { ...payload, latLong: '', miles: null };
                this._sharedService.postNoAuth(fallbackPayload, 'user/filter')
                  .pipe(take(1)).subscribe(
                    (fallbackRes: IGetPractitionersResult) => {
                      try {
                        if (fallbackRes?.data?.dataArr) {
                          const fallbackPros = fallbackRes.data.dataArr.map(
                            d => new Professional(d.userId, d.userData)
                          );
                          if (fallbackPros.length > 0) {
                            this.setListingJsonLd(fallbackPros);
                          }
                        }
                      } catch (e) {
                        // Non-critical — don't let fallback crash SSR
                      }
                      resolve();
                    },
                    () => { resolve(); }
                  );
                return; // resolve() is handled by the fallback subscription
              }
            }
          } catch (e) {
            // Gracefully handle data processing errors during SSR
          }
          resolve();
        },
        () => { resolve(); }
      );
    });
  }

  search() {
    const LISTING_KEY = makeStateKey<any>('listing-ssr-data');
    const cached = this._transferState.get(LISTING_KEY, null);
    if (cached) {
      this._transferState.remove(LISTING_KEY);
      const res = cached as IGetPractitionersResult;
      this.controller.setProfessionals(res.data.dataArr, this._uService.isBrowser);
      const professionals = this.controller.professionalsAll;
      this.formCompare = new FormGroup({});
      if (professionals) {
        professionals.forEach(p => {
          this.formCompare.addControl(p._id, new FormControl());
        });
        if (this.queryParamsCurrent && this.queryParamsCurrent.keyloc) {
          this.controller.updateFilterByProfessionalsLocation();
        }
        this.setListingJsonLd(professionals);
      }
      this.changePage(1);
      return;
    }

    const payload = this.controller.toPayload();
    this.controller.disposeProfesionnals();
    this._sharedService.postNoAuth(payload, 'user/filter').pipe(takeUntil(this.destroy$)).subscribe((res: IGetPractitionersResult) => {
      this.controller.setProfessionals(res.data.dataArr, this._uService.isBrowser);
      const professionals = this.controller.professionalsAll;
      this.formCompare = new FormGroup({});
      if(professionals){
        professionals.forEach(p => {
          this.formCompare.addControl(p._id, new FormControl());
        });
        if(this.queryParamsCurrent.keyloc) {
          this.controller.updateFilterByProfessionalsLocation();
        }
        this.setListingJsonLd(professionals);
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