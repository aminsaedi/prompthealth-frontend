import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'card-item-toolbar',
  templateUrl: './card-item-toolbar.component.html',
  styleUrls: ['./card-item-toolbar.component.scss']
})
export class CardItemToolbarComponent implements OnInit {

  get isLiked() { return this.data.like; }
  get isBookmarked() { return this.data.bookmark; }

  @Input() data: any = {};

  @HostListener('window:resize') onWindowResize() {
    this.isViewSm = (window && window.innerWidth >= 768) ? false : true;
  }

  public isViewSm: boolean = true;
  public isFormCommentShown = false;

  constructor() { }

  ngOnInit(): void {
    this.onWindowResize();
  }

  onClickLike(e: Event) {
    this.stopPropagation(e);
    setTimeout(() => {
      this.data.like = this.data.like == true ? false : true;
    }, 500);
  }

  onClickComment(e: Event) {
    this.stopPropagation(e);
    this.isFormCommentShown = true;
  }

  onClickBookmark(e: Event) {
    this.stopPropagation(e);

    setTimeout(() => {
      this.data.bookmark = this.data.bookmark == true ? false : true;
    }, 500);
  }

  stopPropagation(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

}
