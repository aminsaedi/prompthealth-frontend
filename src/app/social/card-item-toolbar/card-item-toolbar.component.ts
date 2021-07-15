import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { validators } from 'src/app/_helpers/form-settings';

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
  
  public formComment: FormControl;

  constructor() { }

  ngOnInit(): void {
    this.onWindowResize();
    this.formComment = new FormControl('', validators.comment);
  }

  onClickLike(e: Event) {
    this.stopPropagation(e);
    setTimeout(() => {
      this.data.like = this.data.like == true ? false : true;
    }, 500);
  }

  onClickComment(e: Event) {
    this.stopPropagation(e);
    this.showFormComment();
  }

  onClickBookmark(e: Event) {
    this.stopPropagation(e);

    setTimeout(() => {
      this.data.bookmark = this.data.bookmark == true ? false : true;
    }, 500);
  }

  onCancelComment() {
    this.hideFormComment();
  }

  onSubmitComment() {
    console.log('form comment submitted');
  }

  showFormComment() {
    this.isFormCommentShown = true;
  }

  hideFormComment() {
    this.isFormCommentShown = false;
  }

  stopPropagation(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

}
