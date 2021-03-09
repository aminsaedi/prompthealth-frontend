import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-textarea',
  templateUrl: './form-textarea.component.html',
  styleUrls: ['./form-textarea.component.scss']
})
export class FormTextareaComponent implements OnInit {

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
