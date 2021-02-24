import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'filter-dropdown-location',
  templateUrl: './filter-dropdown-location.component.html',
  styleUrls: ['./filter-dropdown-location.component.scss']
})
export class FilterDropdownLocationComponent implements OnInit {

  @Input() data: Data;
  @Output() changeState = new EventEmitter<string>();

  public min: number = 5;
  public max: number = 100;

  constructor() { }

  ngOnInit(): void {
  }

  reset() {
    this.data.distance = this.max;
    this.data.address = '';
    this.changeState.emit('clear');
  }

  save() {
    this.data.address = this.data.address.trim(); 
    this.changeState.emit('save'); 
  }
}

interface Data{
  address: string;
  distance: number;  
}