import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  @Output() onChange = new EventEmitter<CheckboxSelectionItem[] | CheckboxSelectionItem>();
  get label() { return this.isActive ? this.selectedItems?.map(item => item.label).join(', ') : this.labelInitial; }

  get isActive() { return this.selectedItems.length > 0; }
  isItemActive(data: CheckboxSelectionItem) {
    return this.selectedItemsPre?.findIndex(item => item.id == data.id) >= 0;
  }

  private selectedItems: CheckboxSelectionItem[] = [];
  private selectedItemsPre: CheckboxSelectionItem[] = [];
  public isMenuShown: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  onClick(open: boolean = null) {
    this.toggleMenuVisibility(open);
  }

  onClickItem(e: Event, data: CheckboxSelectionItem) {
    e.stopPropagation();
    e.preventDefault();

    if (this.multiple) {
      if(this.isItemActive(data)) {
        this.selectedItemsPre = this.selectedItemsPre.filter(item => item.id != data.id);
      } else {
        this.selectedItemsPre.push(data);
      }  
    } else {
      const item = this.selectedItems[0];
      if(!item || item.id != data.id) {
        this.selectedItems = [data];
        this.onChange.emit(data);
      }
      this.toggleMenuVisibility(false);
    }
  }

  onReset(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if(this.selectedItems) {
      this.selectedItems = [];
      this.selectedItemsPre = [];
      this.onChange.emit(this.selectedItems);
    }

    this.toggleMenuVisibility(false);
  }

  onSave(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    
    this.selectedItems = this.selectedItemsPre;
    this.selectedItemsPre = null;
    this.onChange.emit(this.selectedItems);
    this.toggleMenuVisibility(false);
  }

  toggleMenuVisibility(open: boolean = null) {
    if(open === null) {
      this.isMenuShown = !this.isMenuShown;
    } else {
      this.isMenuShown = open;
    }

    if(this.isMenuShown) {
      this.selectedItemsPre = Array.from(this.selectedItems);
    }
  }

}
