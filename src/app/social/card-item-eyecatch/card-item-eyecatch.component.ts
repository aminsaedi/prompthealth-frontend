import { Component, Input, OnInit } from '@angular/core';
import { SocialArticle, SocialEvent } from 'src/app/models/social-note';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-eyecatch',
  templateUrl: './card-item-eyecatch.component.html',
  styleUrls: ['./card-item-eyecatch.component.scss']
})
export class CardItemEyecatchComponent implements OnInit {

  @Input() post: SocialArticle | SocialEvent;

  get image() {
    console.log(this.post.isArticle)
    if(this.post.isArticle || this.post.isEvent) {
      console.log(this.post.image);
      return this.post.image;
    } else {
      return null;
    }
  }

  get title() {
    if(this.post.isArticle || this.post.isEvent) {
      return (this.post as SocialArticle).title;
    } else {
      return null;
    }
  }

  get eventStartAt() {
    if(this.post.isEvent) {
      return (this.post as SocialEvent).startAt;
    } else {
      return null;
    }
  }

  get isEventFinished() {
    if(this.post.isEvent) {
      return (this.post as SocialEvent).isFinished;
    } else {
      return false;
    }
  }
  
  constructor() { }

  ngOnInit(): void {
  }

}
