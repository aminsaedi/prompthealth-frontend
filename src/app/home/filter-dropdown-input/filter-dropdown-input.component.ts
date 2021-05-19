import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges,  } from '@angular/core';

@Component({
  selector: 'filter-dropdown-input',
  templateUrl: './filter-dropdown-input.component.html',
  styleUrls: ['./filter-dropdown-input.component.scss']
})
export class FilterDropdownInputComponent implements OnInit {

  @Input() target: string; /* zipcode */
  @Input() data: InputData;

  @Output() changeState = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  reset() {
    this.data.value = '';
    this.changeState.emit(this.target);
  }
  save() {
    let value = this.data.value.trim().toUpperCase();
    switch(this.target){
      case 'zipcode':
        // value = value.replace(/\s/g, '');
        break;
    }

    this.data.value = value;
    this.changeState.emit(this.target); 
  }

}

interface InputData{
  value: string;
  placeholder: string;
}