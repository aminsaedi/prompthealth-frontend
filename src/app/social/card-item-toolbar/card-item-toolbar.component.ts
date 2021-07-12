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

  constructor() { }

  ngOnInit(): void {
    this.onWindowResize();
  }

  onClickLike(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      this.data.like = this.data.like == true ? false : true;
    }, 500);
  }

  onClickBookmark(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    setTimeout(() => {
      this.data.bookmark = this.data.bookmark == true ? false : true;
    }, 500);
  }

}
