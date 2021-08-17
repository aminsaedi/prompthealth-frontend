import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialEvent } from 'src/app/models/social-note';
import { SocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'card-item-event',
  templateUrl: './card-item-event.component.html',
  styleUrls: ['./card-item-event.component.scss']
})
export class CardItemEventComponent implements OnInit {

  @Input() post: SocialEvent;
  @Input() shorten: boolean = true;

  @Output() onClickButton = new EventEmitter<string>();

  public alreadySubscribed: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _location: Location,
    private _uService: UniversalService,
  ) { }



  ngOnInit(): void {
    this._route.queryParams.subscribe(() => {
      this.alreadySubscribed = this._uService.localStorage.getItem('subscribed') === 'true' ? true : false;
    });
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
