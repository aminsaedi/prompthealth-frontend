import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'form-item-comment',
  templateUrl: './form-item-comment.component.html',
  styleUrls: ['./form-item-comment.component.scss']
})
export class FormItemCommentComponent implements OnInit {

  public form: FormControl;

  constructor() { }

  ngOnInit(): void {
    this.form = new FormControl('', validators.comment);
  }

  onClickCancel(e: Event) {
    this.stopPropagation(e);
  }

  stopPropagation(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

}
