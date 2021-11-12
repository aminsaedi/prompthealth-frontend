import { Component, Input, OnInit } from '@angular/core';
import { ISocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-eyecatch',
  templateUrl: './card-item-eyecatch.component.html',
  styleUrls: ['./card-item-eyecatch.component.scss']
})
export class CardItemEyecatchComponent implements OnInit {

  @Input() post: ISocialPost;

  get image() {
    if(this.post.isArticle || this.post.isEvent) {
      return this.post.coverImage;
    } else {
      return null;
    }
  }

  get title() {
    if(this.post.isArticle || this.post.isEvent) {
      return this.post.title;
    } else {
      return null;
    }
  }

  get eventStartAt() {
    if(this.post.isEvent) {
      return this.post.startAt;
    } else {
      return null;
    }
  }

  get isEventFinished() {
    if(this.post.isEvent) {
      return this.post.isFinished;
    } else {
      return false;
    }
  }
  
  constructor() { }

  ngOnInit(): void {
  }

}
