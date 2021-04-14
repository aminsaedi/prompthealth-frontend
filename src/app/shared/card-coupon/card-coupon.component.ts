import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'card-coupon',
  templateUrl: './card-coupon.component.html',
  styleUrls: ['./card-coupon.component.scss']
})
export class CardCouponComponent implements OnInit {

  @Input() couponCode: string;
  
  constructor() { }

  ngOnInit(): void {
  }

}
