import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'section-subscription',
  templateUrl: './section-subscription.component.html',
  styleUrls: ['./section-subscription.component.scss']
})
export class SectionSubscriptionComponent implements OnInit {

  constructor() { }
  public form: FormControl;

  ngOnInit(): void {
    this.form = new FormControl();
  }

}
