import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'user-image',
  templateUrl: './user-image.component.html',
  styleUrls: ['./user-image.component.scss']
})
export class UserImageComponent implements OnInit {

  @Input() verified: boolean = false;
  @Input() image: string;  
  @Input() alt: string;
  @Input() shapedCircle: boolean = true;
  @Input() badgeSize: number = 32;
  @Input() option: IUserImageOption;

  /** not needed start */
  @Input() borderColor: string = '#B9B9B9';
  @Input() borderColorVerified: string = '#277ee2';

  @Input() borderWidth: number = 0;
  @Input() borderWidthVerified: number = 5;

  @Input() shadow = null;
  @Input() shadowVerified = "0 0 3px #307dd6";
  /** not needed end */


  get imageUrl(){
    return !this.image ? null : (this.image.match(/\?ver/)) ? this.image : this.image + '?ver=1.0.2';
  }

  get imageStyle() {
    return {
      border: this.verified ? this._option.borderVerified : this._option.border,
      boxShadow: this.verified ? this._option.shadowVerified : this._option.shadow, 
    }
  }

  get badgeStyle(){
    return {
      fontSize: this.badgeSize + 'px'
    }
  }

  constructor() { }

  private _option: UserImageOption;
  ngOnInit(): void {
    this._option = new UserImageOption(this.option);
  }

}

interface IUserImageOption {
  border?: string;
  shadow?: string;

  borderVerified?: string;
  shadowVerified?: string;

  badgeSize?: number;
}

class UserImageOption implements IUserImageOption{
  get border() { return this.data.border ? this.data.border : 'none'; }
  get shadow() { return this.data.shadow ? this.data.shadow : 'none'; }
  get borderVerified() { return this.data.borderVerified ? this.data.borderVerified : 'none'; }
  get shadowVerified() { return this.data.shadowVerified ? this.data.shadowVerified : 'none'; }

  constructor(private data: IUserImageOption = {}) {}
}