import { Location } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ISocialPost } from 'src/app/models/social-post';
import { fadeFastAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'card-item-promo',
  templateUrl: './card-item-promo.component.html',
  styleUrls: ['./card-item-promo.component.scss'],
  animations: [fadeFastAnimation],
})
export class CardItemPromoComponent implements OnInit {

  @Input() shorten: boolean = true;
  @Input() post: ISocialPost;

  @ViewChild('inputCode') private inputCode: ElementRef;

  get images(): string[] {
    return this.post?.images || [];
  }

  public isCopiedMessageShown: boolean = false;

  constructor(
    private _location: Location,
  ) { }

  ngOnInit(): void {
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }

  onClickCode(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    const el: HTMLInputElement = this.inputCode?.nativeElement;

    if(this.post.isAvailable && el) {
      el.select();
      el.setSelectionRange(0, 9999);
      document.execCommand('copy');
      el.setSelectionRange(0,0);

      this.isCopiedMessageShown = true;

      setTimeout(() => { this.isCopiedMessageShown = false; }, 2000);
    }

    
  }

}
