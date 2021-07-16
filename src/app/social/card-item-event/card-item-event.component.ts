import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialPost } from 'src/app/models/social-post';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'card-item-event',
  templateUrl: './card-item-event.component.html',
  styleUrls: ['./card-item-event.component.scss']
})
export class CardItemEventComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;


  public alreadySubscribed: boolean = false;


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _socialService: SocialService,
  ) { }

  ngOnInit(): void {
    this._route.queryParams.subscribe(() => {
      this.alreadySubscribed = this._uService.localStorage.getItem('subscribed') === 'true' ? true : false;
    });
  }

  onClickCalendarMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    this._socialService.setTargetForEventModal(this.post);
    this.showCalendarMenu();
  }

  showCalendarMenu() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: 'calendar-menu'}});
  }

  onClickSubscribeMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    this._socialService.setTargetForEventModal(this.post);
    this.showSubscribeMenu();
  }

  showSubscribeMenu() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: 'subscribe-menu'}});
  }
}
