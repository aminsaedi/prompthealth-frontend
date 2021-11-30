import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { CheckboxSelectionItem } from '../form-item-checkbox-group/form-item-checkbox-group.component';

@Component({
  selector: 'form-item-select-box',
  templateUrl: './form-item-select-box.component.html',
  styleUrls: ['./form-item-select-box.component.scss'],
  animations: [expandVerticalAnimation],
})
export class FormItemSelectBoxComponent implements OnInit {

  @Input() multiple: boolean = false;

  @Input() labelInitial: string = 'Select';
  @Input() items: CheckboxSelectionItem[] = [];
  @Input() disabled: boolean = false;
  @Input() submitted: boolean = false;
  @Input() styles: any = {width: '100%'};
  @Input() controller: FormControl;

  @Output() onChange = new EventEmitter<CheckboxSelectionItem[] | CheckboxSelectionItem>();

  get selectedItem(): CheckboxSelectionItem { return this._selectedItems?.length > 0 ? this._selectedItems[0] : null; }
  get selectedItems(): CheckboxSelectionItem[] { return this._selectedItems ? this._selectedItems : []; }

  get label() { return this.isActive ? this._selectedItems?.map(item => item.label).join(', ') : this.labelInitial; }

  get isActive() { return this._selectedItems.length > 0; }
  isItemActive(data: CheckboxSelectionItem) {
    return this._selectedItemsPre?.findIndex(item => item.id == data.id) >= 0;
  }

  private _selectedItems: CheckboxSelectionItem[] = [];
  private _selectedItemsPre: CheckboxSelectionItem[] = [];
  public isMenuShown: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  setItem(item: CheckboxSelectionItem) {
    this._selectedItems = [item];
  }

  onClick(open: boolean = null) {
    this.toggleMenuVisibility(open);
  }

  onClickItem(e: Event, data: CheckboxSelectionItem) {
    e.stopPropagation();
    e.preventDefault();

    if (this.multiple) {
      if(this.isItemActive(data)) {
        this._selectedItemsPre = this._selectedItemsPre.filter(item => item.id != data.id);
      } else {
        this._selectedItemsPre.push(data);
      }  
    } else {
      const item = this._selectedItems[0];
      if(!item || item.id != data.id) {
        this._selectedItems = [data];
        this.onChange.emit(data);
      }
      this.toggleMenuVisibility(false);
    }
  }

  onReset(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if(this._selectedItems) {
      this._selectedItems = [];
      this._selectedItemsPre = [];
      this.onChange.emit(this._selectedItems);
    }

    this.toggleMenuVisibility(false);
  }

  onSave(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    
    this._selectedItems = this._selectedItemsPre;
    this._selectedItemsPre = null;
    this.onChange.emit(this._selectedItems);
    this.toggleMenuVisibility(false);
  }

  toggleMenuVisibility(open: boolean = null) {
    if(open === null) {
      this.isMenuShown = !this.isMenuShown;
    } else {
      this.isMenuShown = open;
    }

    if(this.isMenuShown) {
      this._selectedItemsPre = Array.from(this._selectedItems);
    }
  }

}
