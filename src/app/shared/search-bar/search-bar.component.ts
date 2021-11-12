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
      console.log(results)
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
    const valArea = dataLocation ? dataLocation.id : null;
    const valLocation = valArea ? null : this.f.searchByLocation.value;

    const dataSituation = this.searchSituation.dataSelected;
    let valCategory: string;
    let valTypeOfProvider: string;
    if(dataSituation) {
      const selectedSituationType = this.findSituationTypeById(dataSituation.id);
      valCategory = selectedSituationType == 'category' ? dataSituation.id : null;
      valTypeOfProvider = selectedSituationType == 'typeOfProvider' ? dataSituation.id : null;
    }    
    const valSituation = (valCategory || valTypeOfProvider) ? null : this.f.searchBySituation.value;

    this.onSubmit.emit({
      searchBySituation: valSituation || '',
      searchByLocation: valLocation || '',
      searchByArea: valArea || '',
      searchByCategory: valCategory || '',
      searchByTypeOfProvider: valTypeOfProvider || '',
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
      if(valCategory || valTypeOfProvider) {
        route = valCategory ? route.concat('category', valCategory) : route.concat('type', valTypeOfProvider);

        delete queryParams.keyword;
        delete queryParams.svc;

        if(valArea) {
          route.push(valArea);
          delete queryParams.keyloc;
        }
 
 
      } else if (valArea){
        route = route.concat('area', valArea);
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
  searchByTypeOfProvider: string;
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