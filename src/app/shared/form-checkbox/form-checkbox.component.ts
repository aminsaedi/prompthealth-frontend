import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-checkbox',
  templateUrl: './form-checkbox.component.html',
  styleUrls: ['./form-checkbox.component.scss']
})
export class FormCheckboxComponent implements OnInit {

  @Input() name: string = '';
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
