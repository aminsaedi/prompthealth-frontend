import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ICommentCreateResult } from 'src/app/models/response-data';
import { ISocialComment, ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'card-item-comment',
  templateUrl: './card-item-comment.component.html',
  styleUrls: ['./card-item-comment.component.scss']
})
export class CardItemCommentComponent implements OnInit {

  @Input() post: ISocialPost;

  get f() { return this.form.controls; }
  get user() { return this._profileService.profile; }
  get _user() { return this._profileService.user; }

  get comments() {
    if(!this.post || !this.post.comments) {
      return null;
    } else {
      const comments = [];
      this.post.comments.forEach(c => {
        if(!c.replyTo) {
          comments.push(c);
        }
      });
      return comments;
    }
  }

  repliesOf(id: string) {
    if(!this.post || !this.post.comments) {
      return null;
    } else {
      const replies = [];
      this.post.comments.forEach(c => {
        if(c.replyTo == id) {
          replies.push(c);
        }
      });
      return replies;
    }
  }

  hasReply(id: string) {
    if(!this.post || !this.post.comments) {
      return false;
    } else {
      let hasReply = false;
      for(let c of this.post.comments) {
        if(c.replyTo == id) {
          hasReply = true;
          break;
        }
      }
      return hasReply;
    }
  }

  nameReplyTo(id: string) {
    let name = null;
    for(let c of this.post.comments) {
      if(c._id == id) {
        name = c.author.firstName;
        break;
      }
    }
    return name;
  }


  public targetCommentIdForReply: string;
  public targetCommentIdsForShow: string[] = [];
  public isUploading = false;

  isReplyOpened(commentId: string) {
    return (this.targetCommentIdsForShow.includes(commentId));
  }

  private form: FormGroup;

  constructor(
    private _modalService: ModalService,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _location: Location,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      body: new FormControl('', validators.comment),
      replyTo: new FormControl(),
    });

    if(this.post && !this.post.isCommentDoneInit) {
      this.fetchComments();
    }
  }

  fetchComments() {
    this._sharedService.getNoAuth('blog/comment/' + this.post._id).subscribe((res: any) => {
      this.post.setComments(res.data as any);
    });
  }

  onClickReply(c: ISocialComment) {
    this.targetCommentIdForReply = c._id;
  }

  onCancelReply() {
    this.targetCommentIdForReply = null;
    this.f.body.setValue(null);
  }

  onSubmitReply() {
    if(!this.user) {
      this._modalService.show('login-menu');
    } else {
      this.f.replyTo.setValue(this.targetCommentIdForReply);
      this.f.body.setValue((this.f.body.value || '').replace(/(<p><br><\/p>)+$/, ''));

      this.isUploading = true;
      this._sharedService.post(this.form.value, 'blog/comment/' + this.post._id).subscribe((res: ICommentCreateResult) => {
        this.isUploading = false;
        if(res.statusCode == 200) {
          res.data.comment.author = this._user;
          this.post.setComment(res.data.comment, res.data.post.numComments);
          this.onClickShowReply(this.targetCommentIdForReply);
          this.targetCommentIdForReply = null;
          this.form.reset();
        } else {
          console.log(res.message);
          this._toastr.error('Could not post your comment. Please try again');
        }
      }, error => {
        console.log(error);
        this.isUploading = false;
        this._toastr.error('Could not post your comment. Please try again');
      });
    }
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

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }

}
