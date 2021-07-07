import { Component, Input, OnInit } from '@angular/core';
import { Blog } from 'src/app/models/blog';
import { CardPostOption, ICardPostOption } from '../card-post/card-post.component';

@Component({
  selector: 'card-event',
  templateUrl: './card-event.component.html',
  styleUrls: ['./card-event.component.scss']
})
export class CardEventComponent implements OnInit {

  @Input() data: Blog;
  @Input() size: 'large' | 'medium' = 'medium';
  @Input() option: ICardPostOption;
  @Input() showCategory: boolean = false;

  get sizeL() { return (this.size == 'large') ? true : false; }
  get sizeM() { return (this.size == 'medium') ? true : false; }
  get sizeS() { return false; }

  public _option: CardPostOption;

  constructor() { }

  ngOnInit(): void {
    this._option = new CardPostOption(this.option);
  }

}
