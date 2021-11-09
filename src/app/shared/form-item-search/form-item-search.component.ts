import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormItemSearchData, IFormItemSearchData } from 'src/app/models/form-item-search-data';
import { FormItemSearchOption, IFormItemSearchOption } from 'src/app/models/form-item-textfield-option';

@Component({
  selector: 'form-item-search',
  templateUrl: './form-item-search.component.html',
  styleUrls: ['./form-item-search.component.scss']
})
export class FormItemSearchComponent implements OnInit {

  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';

  @Input() searchData: IFormItemSearchData[] = [];

  @Input() disabled: boolean = false;
  @Input() submitted: boolean = false;

  @Input() prepend: string = null;
  @Input() prependIcon: string = null

  @Input() autocomplete: string = 'off';
  @Input() autocapitalize: string = 'on';


  @Input() controller: FormControl;
  @Input() max: number = null;

  @Input() option: IFormItemSearchOption = {};

  @Output() onSelect = new EventEmitter<FormItemSearchData>();

  get dataSelected(): FormItemSearchData { return this._dataSelected; }
  isDataSelected(data: FormItemSearchData) { return this.dataSelected && this.dataSelected.id == data.id; }

  public _option: FormItemSearchOption;
  private _searchData: FormItemSearchData[];
  public _searchDataFiltered: FormItemSearchData[];

  // public _idDataFocused: string = null;
  public _isSelectionsShown: boolean = false;
  private _dataSelected: FormItemSearchData = null;

  @ViewChild('selections') _elSelections: ElementRef;
  @ViewChild('container') _elContainer: ElementRef;

  constructor(
    private _changeDetector: ChangeDetectorRef,
  ) { }

  onChangeFocusStatus(isFocus: boolean) {
    if(this._option.showSelectionsImmediately && isFocus) {
      this.showSelections();
      this.filterData(this.controller.value);
      // const data = this.getClosestData();
      // this._idDataFocused = data? data.id : null;
    }
  }

  onChangeValue(value: string) {
    this._dataSelected = null;

    if(value.length > 0) {
      this.showSelections();
    } else if(!this._option.showSelectionsImmediately){
      this.hideSelections();
    }

    if(this._isSelectionsShown && this._searchData?.length > 0) {
      this.filterData(value);
      // const data = this.getClosestData(value);
      // this._idDataFocused = data ? data.id : null;
    }
  }

  onClickOutside(e: MouseEvent | PointerEvent | TouchEvent) {
    const container = this._elContainer.nativeElement as HTMLElement;
    const path = e.composedPath()
    let isClickOutside = true;
    for(let p of path) {
      if(p === (container)){
        isClickOutside = false;
        break;
      }
    }
    if(isClickOutside) {
      this.hideSelections();
    }
  }

  @HostListener('keydown', ['$event']) windowKeydown(e: KeyboardEvent) {
    if(this._searchData?.length > 0){
      switch(e.key){
        case 'ArrowUp': 
          e.preventDefault();
          break;
        case 'ArrowDown': 
          e.preventDefault();
          break;
        case 'Enter':
          if(this._isSelectionsShown && this._searchDataFiltered.length > 0){
            e.preventDefault();
            // this.selectDataFocused();
            // this.hideSelections();  
          }
          break;
				case 'Escape':
					e.preventDefault();
          this.hideSelections();
      }
    }
  }

  ngOnChanges(e: SimpleChanges) {
    if(e?.searchData) {
      this.initSearchData();
    }
  }

  ngOnInit(): void {
    this._option = new FormItemSearchOption(this.option);
  }

  initSearchData() {
    if(this._searchData?.length > 0) {
      console.log('searchData is already initialized.')
    }
    else if(this.searchData?.length > 0) {
      const searchData = [];
      this.searchData.forEach(data => {
        searchData.push(new FormItemSearchData(data));
      });
      this._searchData = searchData;
      console.log('searchData is ready.', this.name);
    } else {
      console.error('cannot initialize searchData yet.', this.name);
    }
  }

  showSelections() { 
    if(!this._isSelectionsShown) {
      this._isSelectionsShown = true;
    }
  }
  hideSelections() { this._isSelectionsShown = false; }

  filterData(word?: string) {
    const filtered = [];
    this._searchData.forEach(data => {
      const d = data.filter(word);
      if(!!d) {
        filtered.push(d);
      }
    });
    this._searchDataFiltered = filtered;
  }

  // moveSelection(to: number) {
  //   this._idxDataFocused = to % this._searchData.length;

  //   const selections = this._elSelections.nativeElement;
  //   const selection = selections.nativeElement.querySelectorAll('selections li a')[this._idxDataFocused];
      
  //   const rect0 = selections.getBoundingClientRect();
  //   const rect1 = selection.getBoundingClientRect();

  //   if(rect1.bottom > rect0.bottom) { selections.scrollBy({top: rect1.top - rect0.top, left: 0, behavior: 'smooth'}); }
  //   else if(rect1.top < rect0.top) { selections.scrollBy({top: rect1.bottom - rect0.bottom, left: 0, behavior: 'smooth'}); }

  // }

  getClosestData(value: string = ''): FormItemSearchData {
    if (this._searchDataFiltered.length == 0) {
      return null;
    } else {
      return this._searchDataFiltered[0].getClosest(value);
    }
  }

  selectData(data: FormItemSearchData) {
    this.controller.setValue(data.label);
    // this._idDataFocused = data.id;
    this._dataSelected = data;
  }

  // selectDataFocused() {
  //   this._dataSelected = null;
  //   for(let item of this._searchData) {
  //     let data: FormItemSearchData;
  //     if(data = item.getDataOf(this._idDataFocused)) {
  //       this.selectData(data);
  //       break;
  //     }
  //   }
  // }

  emitData() {
    this.onSelect.emit(this._dataSelected);
  }
}
