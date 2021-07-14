import { Component, Input, OnInit } from '@angular/core';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-post',
  templateUrl: './card-post.component.html',
  styleUrls: ['./card-post.component.scss']
})
export class CardPostComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
