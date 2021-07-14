import { Component, Input, OnInit } from '@angular/core';
import { SocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-eyecatch',
  templateUrl: './card-item-eyecatch.component.html',
  styleUrls: ['./card-item-eyecatch.component.scss']
})
export class CardItemEyecatchComponent implements OnInit {

  @Input() post: SocialPost;
  
  constructor() { }

  ngOnInit(): void {
  }

}
