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

  constructor() { }

  ngOnInit(): void {
    const option = new TextareaOption(this.option);
    this.rows = option.rows;
  }
}

interface ITextareaOption {
  rows?: number;
}

class TextareaOption implements ITextareaOption{
  get rows() { return this.data.rows || 3; }

  constructor(private data: ITextareaOption = {}) {}
}