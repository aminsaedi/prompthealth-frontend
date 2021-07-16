import { Location } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SocialPost } from 'src/app/models/social-post';
import { CardItemToolbarComponent } from '../card-item-toolbar/card-item-toolbar.component';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;

  @ViewChild('toolbar') private toolbar: CardItemToolbarComponent;

  constructor(
    private _router: Router,
    private _location: Location,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(e: SimpleChanges) {
    if(e && e.shorten && (e.shorten.currentValue != e.shorten.previousValue) && this.shorten && this.toolbar) {
      this.toolbar.hideComment();
    }
  }

  onClickClose(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      const [path, query] = this._location.path().split('?');
      const queryParams: any = {};

      if(query) {
        const array = query.split('&');
        array.forEach(s => {
          const array = s.split('=');
          queryParams[array[0]] = array[1] || null
        });
      }
    
      queryParams.post = null;
      this._router.navigate([path], {queryParams: queryParams, replaceUrl: true});
    } else {
      this._location.back();
    }  
  }
}