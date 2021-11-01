import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-item-checkbox',
  templateUrl: './form-item-checkbox.component.html',
  styleUrls: ['./form-item-checkbox.component.scss']
})
export class FormItemCheckboxComponent implements OnInit {

  @Input() type: 'checkbox' | 'radio' | 'chip' = 'checkbox';
  @Input() name: string = ''; /** used for id */
  @Input() value: string | number | boolean = ''; /** this is for radio */
  @Input() group: string; /** this is for radio. group name */
  @Input() controller: FormControl;
  @Input() label: string = '';
  @Input() option: IOptionFormItemCheckbox = {
    actionIconForChip: 'plus',
    actionIconForChipSelected: 'check',
  };
  
  @Output() changeValue = new EventEmitter<boolean>();

  public _option: OptionFormItemCheckbox
  constructor() { }

  ngOnInit(): void {
    this._option = new OptionFormItemCheckbox(this.option);
  }

  onChange(){
    this.changeValue.emit(this.controller.value);
  }

}

interface IOptionFormItemCheckbox {
  actionIconForChip?: string;
  actionIconForChipSelected?: string;
}

class OptionFormItemCheckbox implements IOptionFormItemCheckbox {
  get actionIconForChip() { return this.data.actionIconForChip; }
  get actionIconForChipSelected() { return this.data.actionIconForChipSelected; }

  constructor(private data: IOptionFormItemCheckbox = {}) {

  }
}