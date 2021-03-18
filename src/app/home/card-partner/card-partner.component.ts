import { Component, Input, OnInit } from '@angular/core';
import { Partner } from 'src/app/models/partner';

@Component({
  selector: 'card-partner',
  templateUrl: './card-partner.component.html',
  styleUrls: ['./card-partner.component.scss']
})
export class CardPartnerComponent implements OnInit {

  @Input() data: Partner;
  
  constructor() { }

  ngOnInit(): void {
  }

}
