import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-item-errors',
  templateUrl: './form-item-errors.component.html',
  styleUrls: ['./form-item-errors.component.scss']
})
export class FormItemErrorsComponent implements OnInit {

  @Input() label: string = '';
  @Input() submitted: boolean = false;
  @Input() controller: FormControl;

  constructor() { }

  ngOnInit(): void {
  }

}
