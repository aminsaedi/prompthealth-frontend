import { Component, Input, OnInit } from '@angular/core';
import { Partner } from 'src/app/models/partner';

@Component({
  selector: 'card-product',
  templateUrl: './card-product.component.html',
  styleUrls: ['./card-product.component.scss']
})
export class CardProductComponent implements OnInit {

  @Input() data: Partner;
  
  constructor() { }

  ngOnInit(): void {
  }

}
