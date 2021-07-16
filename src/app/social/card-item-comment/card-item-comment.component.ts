import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ISocialComment, SocialPost } from 'src/app/models/social-post';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'card-item-comment',
  templateUrl: './card-item-comment.component.html',
  styleUrls: ['./card-item-comment.component.scss']
})
export class CardItemCommentComponent implements OnInit {

  @Input() post: SocialPost;

  public form: FormControl;
  public targetCommentIdForReply: string;
  public targetCommentIdsForShow: string[] = [];

  isReplyOpened(commentId: string) {
    return (this.targetCommentIdsForShow.includes(commentId));
  }

  constructor() { }

  ngOnInit(): void {
    this.form = new FormControl('', validators.comment);
  }

  onClickReply(c: ISocialComment) {
    this.targetCommentIdForReply = c._id;
  }

  onCancelReply() {
    this.targetCommentIdForReply = null;
    this.form.setValue(null);
  }

  onSubmitReply() {
    console.log('reply submitted');
  }

  onClickShowReply(commentId: string) {
    if(!this.isReplyOpened(commentId)) {
      this.targetCommentIdsForShow.push(commentId);
    }
  }

  onClickHideReply(commentId: string) {
    const index = this.targetCommentIdsForShow.indexOf(commentId);
    if(index >= 0) {
      this.targetCommentIdsForShow.splice(index,1);
    }
  }

}
