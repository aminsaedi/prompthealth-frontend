import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() option: IOptionCard;

  public _option: OptionCard;

  constructor() { }

  ngOnInit(): void {
    this._option = new OptionCard(this.option);
  }

}

interface IOptionCard {
  paddingZero?: boolean; //default: false
  hideToolbar?: boolean; // default: false
  hideHeader?: boolean; //default: false
  hideOverflow?: boolean; // default: false
}

class OptionCard {
  get paddingZero() { return  this.data.paddingZero === true ? true : false; }
  get hideToolbar() { return this.data.hideToolbar === true ? true : false; }
  get hideHeader() { return this.data.hideHeader === true ? true : false; }
  get hideOverflow() { return this.data.hideOverflow === true ? true : false; }

  constructor(private data: IOptionCard = {}) {}
}