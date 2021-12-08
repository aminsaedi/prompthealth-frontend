import { Location } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ISocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'card-item-article',
  templateUrl: './card-item-article.component.html',
  styleUrls: ['./card-item-article.component.scss'],
})
export class CardItemArticleComponent implements OnInit {

  @Input() post: ISocialPost;
  @Input() shorten: boolean = true;

  @ViewChild('content') private content: ElementRef;

  public isPopupPostMenuShown = false;
  public isContentGradientShown: boolean = false;

  constructor(
    private _location: Location,
  ) { }

  ngAfterViewInit() {
    const el = this.content.nativeElement as HTMLDivElement;
    this.isContentGradientShown = (el.clientHeight >= (this.post?.isAcademy ? 400 : 200));
  }

  ngOnInit(): void {
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }

  onClickExternalLink(e: Event) {
    e.stopPropagation();
  }
}
