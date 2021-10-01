import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ISocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-article',
  templateUrl: './card-item-article.component.html',
  styleUrls: ['./card-item-article.component.scss'],
})
export class CardItemArticleComponent implements OnInit {

  @Input() post: ISocialPost;
  @Input() shorten: boolean = true;

  public isPopupPostMenuShown = false;

  constructor(
    private _location: Location,
  ) { }

  ngOnInit(): void {
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }
}
