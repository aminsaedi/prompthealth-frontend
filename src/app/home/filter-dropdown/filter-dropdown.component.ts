import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'filter-dropdown',
  templateUrl: './filter-dropdown.component.html',
  styleUrls: ['./filter-dropdown.component.scss']
})
export class FilterDropdownComponent implements OnInit {

  @Input() target: string;
  @Input() option: {id: string, label: string}[] = [];
  
  constructor() { }

  ngOnInit(): void {
    
  }

  onSliderChange([min,max]: [number, number]){
    
  }
}
