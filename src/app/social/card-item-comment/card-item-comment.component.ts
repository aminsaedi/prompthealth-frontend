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
  public formReply: FormControl;
  public targetCommentIdForReply: string;

  constructor() { }

  ngOnInit(): void {
    this.form = new FormControl('', validators.comment);
    this.formReply = new FormControl('', validators.comment);
  }

  onClickReply(c: ISocialComment) {
    this.formReply.setValue(null);
    this.targetCommentIdForReply = c._id;
  }
}
