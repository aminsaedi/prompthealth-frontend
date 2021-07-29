import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-post',
  templateUrl: './card-item-post.component.html',
  styleUrls: ['./card-item-post.component.scss']
})
export class CardItemPostComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;

  @Output() onClickButton = new EventEmitter<string>();

  constructor(
    private _location: Location,
  ) { }

  ngOnInit(): void {
  }

  _onClickButton(e: Event, buttonName: string) {
    e.stopPropagation();
    e.preventDefault();
    this.onClickButton.emit(buttonName);
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }

}
