import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormItemTextfieldOption, IFormItemTextfieldOption } from 'src/app/models/form-item-textfield-option';

@Component({
  selector: 'form-item-input',
  templateUrl: './form-item-input.component.html',
  styleUrls: ['./form-item-input.component.scss']
})
export class FormItemInputComponent implements OnInit {

  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() disabled: boolean = false;
  @Input() submitted: boolean = false;
  @Input() prepend: string = null;
  @Input() prependIcon: string = null
  @Input() autocomplete: string = 'off';
  @Input() autocapitalize: string = 'on'

  @Input() controller: FormControl;
  @Input() max: number = null;

  @Input() option: IFormItemTextfieldOption = {};

  @Output() onFocus = new EventEmitter<boolean>()
  @Output() onChangeValue = new EventEmitter<string>();


  public _type: string;
  public _option: FormItemTextfieldOption;

  constructor() { }

  ngOnInit(): void {
    this._type = this.type;
    this._option = new FormItemTextfieldOption(this.option);
    this.controller.valueChanges.subscribe(val => {
      this.onChangeValue.emit(val);
    });
  }

  _onFocus(){
    this.onFocus.emit(true);
  }

  _onBlur(){
    this.onFocus.emit(false);
  }

  onClickLock() {
    this._type = (this._type == 'text') ? 'password' : 'text';
  }

  onClickReset() {
    this.controller.setValue('');
  }
}

