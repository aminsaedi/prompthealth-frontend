import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { validators } from 'src/app/_helpers/form-settings';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'card-item-toolbar',
  templateUrl: './card-item-toolbar.component.html',
  styleUrls: ['./card-item-toolbar.component.scss'],
  animations: [expandVerticalAnimation],
})
export class CardItemToolbarComponent implements OnInit {

  get isLiked() { return this.post.like; }
  get isBookmarked() { return this.post.bookmark; }

  @Input() post: any = {};

  @HostListener('window:resize') onWindowResize() {
    this.isViewSm = (window && window.innerWidth >= 768) ? false : true;
  }

  public isViewSm: boolean = true;
  public isFormCommentShown = false;
  public FRONTEND_URL = environment.config.BASE_URL
  
  public formComment: FormControl;

  constructor() { }

  ngOnInit(): void {
    this.onWindowResize();
    this.formComment = new FormControl('', validators.comment);
  }

  onClickLike(e: Event) {
    this.stopPropagation(e);
    setTimeout(() => {
      this.post.like = this.post.like == true ? false : true;
    }, 500);
  }

  onClickComment(e: Event) {
    this.stopPropagation(e);
    if(this.isFormCommentShown) {
      this.hideComment();
    } else {
      this.showComment();
    }
  }

  onClickBookmark(e: Event) {
    this.stopPropagation(e);

    setTimeout(() => {
      this.post.bookmark = this.post.bookmark == true ? false : true;
    }, 500);
  }

  onSubmitComment() {
    console.log('form comment submitted');
  }

  showComment() {
    this.isFormCommentShown = true;
  }

  hideComment() {
    this.isFormCommentShown = false;
  }

  stopPropagation(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

}
