import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FormItemSearchData, IFormItemSearchData } from 'src/app/models/form-item-search-data';
import { validators } from 'src/app/_helpers/form-settings';
import { locationsNested } from 'src/app/_helpers/location-data';
import { FormItemSearchComponent } from '../form-item-search/form-item-search.component';

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
  public _afterViewInit: boolean = false;
  private _form: FormGroup;

  @ViewChild('searchLocation') private searchLocation: FormItemSearchComponent;

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _changeDetector: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    this._form = this._fb.group({
      searchBySituation: new FormControl(),
      searchByLocation: new FormControl(),
    });

    this._option = new OptionSearchBar(this.option);
  }

  ngAfterViewInit() {
    this._afterViewInit = true;
    this._changeDetector.detectChanges();
  }

  setKeyword(val: string) {
    this.f.searchBySituation.setValue(val);
  }

  setLocation(val: string) {
    this.f.searchByLocation.setValue(val);
  }

  // findClosestLocation(s: string): string {
  //   if(!s || s.length == 0) {
  //     return null;
  //   } else {
  //     const regex = new RegExp('^' + s.toLowerCase());
  //     let locationId: string;
  //     for(let state of this._cities) {
  //       for(let city of state.subitems) {
  //         if(city.label.toLowerCase().match(regex)) {
  //           locationId = city.id;
  //           break;
  //         }  
  //       }
  //       if(locationId) {
  //         break;
  //       }
  //     }
  //     return locationId;    
  //   }
  // }

  _onSubmit() {
    const dataLocation = this.searchLocation.dataSelected;
    const valArea = dataLocation ? dataLocation.id : null;
    const valLocation = dataLocation ? null : this.f.searchByLocation.value;
    const valSituation = this.f.searchBySituation.value;

    this.onSubmit.emit({
      searchBySituation: valSituation || '',
      searchByLocation: valLocation || '',
      searchByArea: valArea || '',
    });

    if(this._option.navigateToListing) {
      let route = ["/practitioners"];
      if(!!dataLocation){ 
        route = route.concat(['area', dataLocation.id]);
      }

      let params: NavigationExtras = {
        queryParams: {
          ...(valSituation && valSituation.length > 0) && {keyword: valSituation},
          ...(valLocation && valLocation.length > 0) && {keyloc: valLocation},
        }
      };
      this._router.navigate(route, params);
    }
  }

}

interface SearchKeywords {
  searchBySituation: string;
  searchByLocation: string;
  searchByArea: string;
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