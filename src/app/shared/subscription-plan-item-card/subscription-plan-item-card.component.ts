import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';

@Component({
  selector: 'subscription-plan-item-card',
  templateUrl: './subscription-plan-item-card.component.html',
  styleUrls: ['./subscription-plan-item-card.component.scss']
})
export class SubscriptionPlanItemCardComponent implements OnInit {

  @Input() type: string; /* basic | provider | centre | partner */
  @Input() data: any;
  @Input() hideButton = false;

  @Input() isPriceMonthly = true;

  @Output() select = new EventEmitter<string>(); /* basic | provider | center | partner */

  public color: string;
  public features: string[];
  public isLoggedIn = false;

  constructor() { }

  // ngOnChanges(e: SimpleChanges) {

  // }

  ngOnInit(): void {
    this.color = this.type === 'provider' ? 'blue' : this.type === 'centre' ? 'red' : 'green';
    if (localStorage.getItem('token')) { this.isLoggedIn = true; }

  }


  getTabName() {
    let name = '';

    switch (this.type) {
      case 'basic': name = 'Free'; break;
      case 'partner': name = 'Coming Soon'; break;

      case 'provider':
      case 'centre':
        if (this.data) {
          name = `$${this.isPriceMonthly ? (this.data.price + '/Monthly') : (this.data.yearlyPrice + '/Annually')}`;
        }
    }
    return name;
  }

  getLinkToSignin() {
    const link = ['/auth', 'registration'];
    switch (this.type) {
      case 'basic':
      case 'provider':
        link.push('sp');
        break;

      case 'centre':
        link.push('c');
        break;

      case 'partner':
      /* todo: add link */

    }
    return link;

  }

  triggerButtonClick() { this.select.emit(this.type); }

}
