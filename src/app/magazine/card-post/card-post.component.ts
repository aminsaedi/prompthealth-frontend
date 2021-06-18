import { Component, Input, OnInit } from '@angular/core';
import { Blog } from 'src/app/models/blog';

@Component({
  selector: 'card-post',
  templateUrl: './card-post.component.html',
  styleUrls: ['./card-post.component.scss']
})
export class CardPostComponent implements OnInit {

  @Input() data: Blog;
  @Input() size: 'large' | 'medium' | 'small' = 'medium';
  @Input() showCategory: boolean = true;
  @Input() option: ICardPostOption;

  get sizeL() { return (this.size == 'large') ? true : false; }
  get sizeM() { return (this.size == 'medium') ? true : false; }
  get sizeS() { return (this.size == 'small') ? true : false; }

  public _option: CardPostOption;

  constructor() { }

  ngOnInit(): void {
    this._option = new CardPostOption(this.option);
  }

}

interface ICardPostOption {
  colorLightForDummy?: string;
}

class CardPostOption {
  
  get colorLightForDummy() { return this.data.colorLightForDummy || 'white'; }

  constructor(private data: ICardPostOption = {}) {  }
}