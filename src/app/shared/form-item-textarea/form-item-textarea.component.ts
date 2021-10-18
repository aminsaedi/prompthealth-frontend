import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-item-textarea',
  templateUrl: './form-item-textarea.component.html',
  styleUrls: ['./form-item-textarea.component.scss']
})
export class FormItemTextareaComponent implements OnInit {

  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() submitted: boolean = false;
  @Input() disabled: boolean = false;

  @Input() controller: FormControl;
  @Input() max: number = null;

  @Input() option: ITextareaOption = {};

  public rows: number;
  public _option: TextareaOption;

  constructor() { }

  ngOnInit(): void {
    this._option = new TextareaOption(this.option);
    this.rows = this._option.rows;
  }
}

interface ITextareaOption {
  rows?: number;
  transparent?: boolean;
  paddingZero?: boolean;
}

class TextareaOption implements ITextareaOption{
  get rows() { return this.data.rows || 3; }
  get transparent() { return this.data.transparent || false; }
  get paddingZero() { return this.data.paddingZero || false; }

  constructor(private data: ITextareaOption = {}) {}
}