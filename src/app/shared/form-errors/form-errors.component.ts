import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-errors',
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss']
})
export class FormErrorsComponent implements OnInit {

  @Input() label: string = '';
  @Input() submitted: boolean = false;
  @Input() controller: FormControl;

  constructor() { }

  ngOnInit(): void {
  }

}
