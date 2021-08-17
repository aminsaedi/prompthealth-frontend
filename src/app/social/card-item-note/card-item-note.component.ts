import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-note',
  templateUrl: './card-item-note.component.html',
  styleUrls: ['./card-item-note.component.scss']
})
export class CardItemNoteComponent implements OnInit {

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
