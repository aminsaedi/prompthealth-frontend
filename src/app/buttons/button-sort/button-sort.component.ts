import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'button-sort',
  templateUrl: './button-sort.component.html',
  styleUrls: ['./button-sort.component.scss'],
  animations: [expandVerticalAnimation],
})
export class ButtonSortComponent implements OnInit {

  @Input() sortType: SortType = 'number';
  @Input() initialId: string = null;
  @Input() labelInitial: string = 'Sort by';

  @Input() items: SortItem[] = [
    {id: 'latest', label: 'Latest', type: 'number', order: 'desc'},
    {id: 'oldest', label: 'Oldest', type: 'number', order: 'asc'},
  ];

  @Output() onChange = new EventEmitter<SortItem>();

  public isMenuShown: boolean = false;
  private selectedItem: SortItem = null;

  get icon() {
    let icon: string = this.selectedItem ? 
      this.selectedItem.order == 'asc' ?
        this.selectedItem.type == 'alphabet' ? 'sort-text' : 'sort-number' : 
        this.selectedItem.type == 'alphabet' ? 'sort-text-reverse' : 'sort-number-reverse' 
      : 'line-height-2';

    return icon;
  }

  get label() {
    return this.selectedItem ? (this.selectedItem.labelShort || this.selectedItem.label): this.labelInitial;
  }

  get isActive() {
    return !!this.selectedItem;
  }

  isItemActive(item: SortItem) {
    return this.selectedItem?.id == item.id;
  } 


  constructor() { }


  ngOnInit(): void {
    if(this.initialId) {
      this.selectedItem = this.items.find(item => item.id == this.initialId);
    }
  }


  onClick(open: boolean = null) {
    this.toggleMenuVisibility(open);
  }

  onClickItem(item: SortItem) {
    if(!this.selectedItem || this.selectedItem.id != item.id) {
      this.selectedItem = item;
      this.onChange.emit(item);  
    }
    this.toggleMenuVisibility(false);
  }


  toggleMenuVisibility(open: boolean = null) {
    if(open === null) {
      this.isMenuShown = !this.isMenuShown;
    } else {
      this.isMenuShown = open;
    }
  }


}

type SortType = 'number' | 'alphabet';
type OrderType = 'asc' | 'desc';
export type SortItem = {
  id: string;
  label: string;
  labelShort?: string;
  type: SortType;
  order: OrderType;
  sortBy?: string;
}