import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl, FormArray, FormBuilder, FormGroup, NumberValueAccessor } from '@angular/forms';

@Component({
  selector: 'filter-dropdown-slider',
  templateUrl: './filter-dropdown-slider.component.html',
  styleUrls: ['./filter-dropdown-slider.component.scss']
})
export class FilterDropdownSliderComponent implements OnInit {

  @Input() target: string;
  @Input() range: { min: number; max: number; current: number; default: number; } = { min: 0, max: 10000, current: 0, default: 0 };

  @Output() changeState = new EventEmitter<string>();


  constructor() { }

  ngOnInit(): void {
  }

  reset() {
    this.range.current = this.range.default;
    this.changeState.emit(this.target);
  }

  save() { this.changeState.emit(this.target); }
}
