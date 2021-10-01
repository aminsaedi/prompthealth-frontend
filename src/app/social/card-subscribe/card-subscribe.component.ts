import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'card-subscribe',
  templateUrl: './card-subscribe.component.html',
  styleUrls: ['./card-subscribe.component.scss']
})
export class CardSubscribeComponent implements OnInit {

  public form: FormControl;
  public isSubmitted: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.form = new FormControl('', validators.email);
  }

  onSubmit() {
    this.isSubmitted = true;
  }
}
