import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'card-item-event',
  templateUrl: './card-item-event.component.html',
  styleUrls: ['./card-item-event.component.scss'],
})
export class CardItemEventComponent implements OnInit {

  @Input() post: ISocialPost;
  @Input() shorten: boolean = true;

  public alreadySubscribed: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _location: Location,
    private _uService: UniversalService,
    private _modalService: ModalService,
  ) { }


  ngOnInit(): void {
    this._route.queryParams.subscribe(() => {
      this.alreadySubscribed = this._uService.localStorage.getItem('subscribed') === 'true' ? true : false;
    });
  }

  showMenu(e: Event, menuName: string) {
    e.stopPropagation();
    e.preventDefault();
    this._modalService.show(menuName);
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  } 
}
