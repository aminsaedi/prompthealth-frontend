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

  constructor() { }

  ngOnInit(): void {
  }

}
