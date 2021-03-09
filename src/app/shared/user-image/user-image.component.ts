import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'user-image',
  templateUrl: './user-image.component.html',
  styleUrls: ['./user-image.component.scss']
})
export class UserImageComponent implements OnInit {

  @Input() verifiedUser: boolean = false;
  @Input() image: string;
  @Input() alt: string;

  @Input() showBadge: boolean = true;

  @Input() borderColor: string = '#B9B9B9';
  @Input() borderColorVerified: string = '#277ee2';

  @Input() borderWidth: number = 0;
  @Input() borderWidthVerified: number = 5;

  @Input() shadow = null;
  @Input() shadowVerified = "0 0 3px #307dd6";

  @Input() badgeSize: number = 32;


  get imageUrl(){
    return !this.image ? null : (this.image.match(/\?ver/)) ? this.image : this.image + '?ver=1.0.2';
  }

  get containerStyle() {
    return {
      borderWidth: (this.verifiedUser ? this.borderWidthVerified : this.borderWidth) + 'px',
      borderColor: this.verifiedUser ? this.borderColorVerified : this.borderColor,
      boxShadow: this.verifiedUser ? this.shadowVerified : this.shadow,
    }
  }

  get badgeStyle(){
    return {
      fontSize: this.badgeSize + 'px'
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
