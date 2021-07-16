import { Component, Input, OnInit } from '@angular/core';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-post',
  templateUrl: './card-item-post.component.html',
  styleUrls: ['./card-item-post.component.scss']
})
export class CardItemPostComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
