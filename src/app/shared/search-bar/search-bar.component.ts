import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IFormItemSearchData } from 'src/app/models/form-item-search-data';
import { locationsNested } from 'src/app/_helpers/location-data';
import { FormItemSearchComponent } from '../form-item-search/form-item-search.component';
import { CategoryService } from '../services/category.service';
import { ModalService } from '../services/modal.service';
import { QuestionnaireService, Questionnaire } from '../services/questionnaire.service';
import { SearchBarService } from '../services/search-bar.service';

@Component({
  selector: 'search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  
  @Input() option: IOptionSearchBar = {};

  get f() { return this._form.controls; }

  public _option: OptionSearchBar;
  public searchDataLocation: IFormItemSearchData[] = locationsNested;
  public searchDataSituation: IFormItemSearchData[];
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
    private _qService: QuestionnaireService,
    private _searchBarService: SearchBarService,
  ) { }

  ngOnDestroy() {
    this.subscriptionCategory?.unsubscribe();
  }

  ngOnInit(): void {
    this._form = this._fb.group({
      searchBySituation: new FormControl(),
      searchByLocation: new FormControl(),
    });

    this._option = new OptionSearchBar(this.option);

    this.initSearchBySituation();
  }

  ngAfterViewInit() {
    this._afterViewInit = true;
    this._changeDetector.detectChanges();
  }

  initSearchBySituation() {
    const promiseAll: Promise<any>[] = [this._qService.getSitemap()];
    if(!this._catService.categoryList) {
      promiseAll.push(this.waitForFetchingCategory());
    }
    Promise.all(promiseAll).then(results => {
      const cat = this._catService.categoryList;
      const typeOfProvider: Questionnaire = results[0].typeOfProvider;

      this.searchDataSituation = [{
        id: 'category',
        selectable: false,
        label: 'Category',
        subitems: cat.map(item => { 
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
        }),
      }, {
        id: 'typeOfProvider',
        selectable: false,
        label: 'Provider type',
        subitems: typeOfProvider.answers.map(item => {
          return {
            id: item._id,
            label: item.item_text,
          }
        })
      }];
    })

  }

  waitForFetchingCategory(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.subscriptionCategory = this._catService.observeCategoryService().subscribe(() => {
        this.subscriptionCategory.unsubscribe();
        resolve();
      })  
    })
  }

  initSearchByCategory() {
    const cats = this._catService.categoryList;
    this.searchDataSituation = [{
      id: 'category',
      selectable: false,
      label: 'Category',
      subitems: cats.map(item => { 
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
      }),
    }];
  }

  retrieveData() {
    const keyword = this._searchBarService.getKeyword();
    if(keyword) {
      this.f.searchBySituation.setValue(keyword);
      const dataSituation = this._searchBarService.get('selectedSituation');
      if(dataSituation) {
        this.searchSituation.selectData(dataSituation);
      }
    }

    const keyloc = this._searchBarService.getKeyloc();
    if(keyloc) {
      this.f.searchByLocation.setValue(keyloc);
      const dataLocation = this._searchBarService.get('selectedLocation');
      if(dataLocation) {
        this.searchLocation.selectData(dataLocation);
      }
    }
  }

  setKeyword(val: string) {
    this.f.searchBySituation.setValue(val);
  }

  setLocation(val: string) {
    this.f.searchByLocation.setValue(val);
  }

  findSituationTypeById(id: string): string {
    let result = null;
    for(let i=0; i<this.searchDataSituation.length; i++) {
      if(this.searchDataSituation[i].subitems.findIndex(item => id == item.id) >= 0) {
        result = this.searchDataSituation[i].id;
        break;
      }
      for(let j=0; j<this.searchDataSituation[i].subitems.length; j++) {
        if(this.searchDataSituation[i].subitems[j].subitems?.findIndex(item => id == item.id) >= 0) {
          result = this.searchDataSituation[i].id;
          break;
        }
      }
    }
    return result;
  }

  _onSubmit() {
    const dataLocation = this.searchLocation.dataSelected;
    if(dataLocation) {
      this._searchBarService.set('selectedLocation', dataLocation);
      this._searchBarService.setKeyloc(dataLocation.label);
    } else if (this.f.searchByLocation.value) {
      this._searchBarService.remove('selectedLocation');
      this._searchBarService.setKeyloc(this.f.searchByLocation.value);
    } else {
      this._searchBarService.remove('selectedLocation');
      this._searchBarService.setKeyloc(null);
    }

    const dataSituation = this.searchSituation.dataSelected;
    if(dataSituation) {
      this._searchBarService.set('selectedSituation', dataSituation);
      this._searchBarService.setKeyword(dataSituation.label);
    } else if(this.f.searchBySituation.value) {
      this._searchBarService.remove('selectedSituation');
      this._searchBarService.setKeyword(this.f.searchBySituation.value);
    } else {
      this._searchBarService.remove('selectedSituation');
      this._searchBarService.setKeyword(null);
    }

    const area = dataLocation?.id || null;
    const keyloc = !area ? this._searchBarService.getKeyloc() : null;
    
    const category = dataSituation && this.findSituationTypeById(dataSituation.id) == 'category' ? dataSituation.id : null;
    const typeOfProvider = dataSituation && this.findSituationTypeById(dataSituation.id) == 'typeOfProvider' ? dataSituation.id : null;
    const keyword = (!category && !typeOfProvider) ? this._searchBarService.getKeyword() : null;

    let [path, queryParams] = this._modalService.currentPathAndQueryParams;
    queryParams = {
      ...queryParams,
      ...(keyword) && {keyword: keyword},
      ...(keyloc) && {keyloc: keyloc},
    }
    delete queryParams.modal;
    delete queryParams.menu;

    let route = ["/practitioners"];
    if(category || typeOfProvider) {
      route = category ? route.concat('category', category) : route.concat('type', typeOfProvider);

      delete queryParams.keyword;
      delete queryParams.svc;

      if(area) {
        route.push(area);
        delete queryParams.keyloc;
        delete queryParams.zoom;
        delete queryParams.dist;
        delete queryParams.lt;
        delete queryParams.lg;
      }


    } else if (area){
      route = route.concat('area', area);
      delete queryParams.keyloc;
      delete queryParams.zoom;
      delete queryParams.dist;
      delete queryParams.lt;
      delete queryParams.lg;
    }

    this._router.navigate(route, {queryParams: queryParams});
  }

}

export interface SearchKeywords {
  searchBySituation: string;
  searchByLocation: string;
  searchByArea: string;
  searchByCategory: string;
  searchByTypeOfProvider: string;
}

interface IOptionSearchBar {
  navigateToListing?: boolean;
  fixAlignHorizontal?: boolean;
}

class OptionSearchBar implements IOptionSearchBar {

  get fixAlignHorizontal() { return (this.data.fixAlignHorizontal === true) ? true : false; }
  
  constructor(private data: IOptionSearchBar){}
}