import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-item-checkbox',
  templateUrl: './form-item-checkbox.component.html',
  styleUrls: ['./form-item-checkbox.component.scss']
})
export class FormItemCheckboxComponent implements OnInit {

  @Input() type: 'checkbox' | 'radio' = 'checkbox';
  @Input() name: string = ''; /** used for id */
  @Input() value: string | number | boolean = ''; /** this is for radio */
  @Input() group: string; /** this is for radio. group name */
  @Input() controller: FormControl;
  @Input() label: string = '';

  @Output() changeValue = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  onChange(){
    this.changeValue.emit(this.controller.value);
  }

}
