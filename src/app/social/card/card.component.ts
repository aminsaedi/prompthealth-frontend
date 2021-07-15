import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;

  constructor(
    private _router: Router,
    private _location: Location,
  ) { }

  ngOnInit(): void {
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