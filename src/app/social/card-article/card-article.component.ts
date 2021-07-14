import { Component, Input, OnInit } from '@angular/core';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-article',
  templateUrl: './card-article.component.html',
  styleUrls: ['./card-article.component.scss']
})
export class CardArticleComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;
  constructor() { }

  ngOnInit(): void {
  }

}
