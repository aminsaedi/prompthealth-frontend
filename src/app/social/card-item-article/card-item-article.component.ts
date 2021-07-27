import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-article',
  templateUrl: './card-item-article.component.html',
  styleUrls: ['./card-item-article.component.scss']
})
export class CardItemArticleComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;

  constructor(
    private _location: Location
  ) { }

  ngOnInit(): void {
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }

}
