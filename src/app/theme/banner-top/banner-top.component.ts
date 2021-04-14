import { Component, OnInit } from '@angular/core';
import { expandVerticalAnimation } from '../../_helpers/animations';

@Component({
  selector: 'banner-top',
  templateUrl: './banner-top.component.html',
  styleUrls: ['./banner-top.component.scss'],
  animations: [expandVerticalAnimation]
})
export class BannerTopComponent implements OnInit {

  public isBannerShown: boolean;

  constructor() { }

  ngOnInit(): void {
    const status = sessionStorage.getItem('bannerTopStatus');
    this.isBannerShown = (status == 'close')? false : true;
  }

  close(){
    this.isBannerShown = false;
    sessionStorage.setItem('bannerTopStatus', 'close');
  }
}
