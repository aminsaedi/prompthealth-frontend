import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormItemSearchData, IFormItemSearchData } from 'src/app/models/form-item-search-data';
import { validators } from 'src/app/_helpers/form-settings';
import { locationsNested } from 'src/app/_helpers/location-data';
import { FormItemSearchComponent } from '../form-item-search/form-item-search.component';
import { CategoryService } from '../services/category.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  
  @Input() option: IOptionSearchBar = {};
  @Output() onSubmit = new EventEmitter<SearchKeywords>()

  get f() { return this._form.controls; }

  public _option: OptionSearchBar;
  public _cities: IFormItemSearchData[] = locationsNested;
  public categories: IFormItemSearchData[];
  public _afterViewInit: boolean = false;
  private _form: FormGroup;

  private subscriptionCategory: Subscription;

  @ViewChild('searchLocation') private searchLocation: FormItemSearchComponent;
  @ViewChild('searchSituation') private searchSituation: FormItemSearchComponent;

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _changeDetector: ChangeDetectorRef,
    private _catService: CategoryService,
    private _modalService: ModalService,
  ) { }


  ngOnInit(): void {
    this._form = this._fb.group({
      searchBySituation: new FormControl(),
      searchByLocation: new FormControl(),
    });

    this._option = new OptionSearchBar(this.option);

    if(this._catService.categoryList) {
      this.initSearchByCategory();
    } else {
      this.subscriptionCategory = this._catService.observeCategoryService().subscribe(() => {
        this.subscriptionCategory.unsubscribe();
        this.initSearchByCategory();
      });
    }
  }

  ngAfterViewInit() {
    this._afterViewInit = true;
    this._changeDetector.detectChanges();
  }

  initSearchByCategory() {
    const cats = this._catService.categoryList;
    this.categories = cats.map(item => { 
      return {
        id: item._id,
        label: item.item_text,
        subitems: item.subCategory.map(sub => {
          return {
            id: sub._id,
            label: sub.item_text,
          }
        })
      }
    });
    console.log(this.categories);
  }

  setKeyword(val: string) {
    this.f.searchBySituation.setValue(val);
  }

  setLocation(val: string) {
    this.f.searchByLocation.setValue(val);
  }

  _onSubmit() {
    const dataLocation = this.searchLocation.dataSelected;
    const valArea = dataLocation ? dataLocation.id : null;
    const valLocation = valArea ? null : this.f.searchByLocation.value;

    const dataSituation = this.searchSituation.dataSelected;
    const valCategory = dataSituation ? dataSituation.id : null;
    const valSituation = valCategory ? null : this.f.searchBySituation.value;

    this.onSubmit.emit({
      searchBySituation: valSituation || '',
      searchByLocation: valLocation || '',
      searchByArea: valArea || '',
      searchByCategory: valCategory || '',
    });

    if(this._option.navigateToListing) {
      let [path, queryParams] = this._modalService.currentPathAndQueryParams;
      queryParams = {
        ...queryParams,
        ...(valSituation && valSituation.length > 0) && {keyword: valSituation},
        ...(valLocation && valLocation.length > 0) && {keyloc: valLocation},
      }
      delete queryParams.modal;
      delete queryParams.menu;

      let route = ["/practitioners"];
      if(!!valCategory && !!valArea) {
        route = route.concat(['category', valCategory, valArea]);
        delete queryParams.keyword;
        delete queryParams.keyloc;
        delete queryParams.svc;
      } else if(!!valCategory) {
        route = route.concat(['category', valCategory]);
        delete queryParams.keyword;
        delete queryParams.svc;
      } else if (!!valArea) {
        route = route.concat(['area', valArea]);
        delete queryParams.keyloc;
      }


      this._router.navigate(route, {queryParams: queryParams});
    }
  }

}

export interface SearchKeywords {
  searchBySituation: string;
  searchByLocation: string;
  searchByArea: string;
  searchByCategory: string;
}

interface IOptionSearchBar {
  navigateToListing?: boolean;
  fixAlignHorizontal?: boolean;
}

class OptionSearchBar implements IOptionSearchBar {

  get navigateToListing() { return (this.data.navigateToListing === false) ? false : true; }
  get fixAlignHorizontal() { return (this.data.fixAlignHorizontal === true) ? true : false; }
  
  constructor(private data: IOptionSearchBar){}
}