import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SocialNote } from 'src/app/models/social-note';

@Component({
  selector: 'card-item-note',
  templateUrl: './card-item-note.component.html',
  styleUrls: ['./card-item-note.component.scss'],
})
export class CardItemNoteComponent implements OnInit {

  @Input() post: SocialNote;
  @Input() shorten: boolean = true;

  get images(): string[] {
    return this.post?.images || [];
  }

  get voice(): string {
    return this.post?.voice || null;
  }


  constructor(
    private _location: Location,
  ) { }

  ngOnInit(): void {
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }
}
