import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ICommentCreateResult, IResponseData } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
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

  @Input() post: ISocialPost;

  get isLiked() { return this.post.isLiked; }
  get isBookmarked() { return this.post.isBookmarked; }
  get f() { return this.formComment.controls; }
  get user() { return this._profileService.profile; }
  get _user() { return this._profileService.user; }

  @HostListener('window:resize') onWindowResize() {
    this.isViewSm = (window && window.innerWidth >= 768) ? false : true;
  }

  public isViewSm: boolean = true;
  public isFormCommentShown = false;
  public isUploading = false;
  public FRONTEND_URL = environment.config.FRONTEND_BASE
  
  private formComment: FormGroup;

  constructor(
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.onWindowResize();
    this.formComment = new FormGroup({
      body: new FormControl('', validators.comment),
    });
  }

  onClickLike(e: Event) {
    this.stopPropagation(e);

    if(!this.user) {
      this._modalService.show('login-menu');
      return;
    }

    const numLikesCurrent = this.post.numLikes || 0;
    const isLikedCurrent = this.post.isLiked;
    this.changeLikeStatus(!this.post.isLiked, numLikesCurrent + (isLikedCurrent ? -1 : 1));

    if(this.post) {
      this.isUploading = true;
      this._sharedService.post({}, 'blog/like/' + this.post._id).subscribe(res => {
        this.isUploading = false;
        if(res.statusCode != 200) {
          console.log(res.message);
          this.changeLikeStatus(isLikedCurrent, numLikesCurrent);
          this._toastr.error('Something went wrong');          
        }
      }, error => {
        this.isUploading = false;
        console.log(error);
        this.changeLikeStatus(isLikedCurrent, numLikesCurrent);
        this._toastr.error('Something went wrong');          
      });
    }
  }

  changeLikeStatus(isLiked: boolean, numLikes: number) {
    if(isLiked) {
      this.post.like(true, numLikes);
    } else {
      this.post.unlike(true, numLikes);
    }
  }

  async onClickBookmark(e: Event) {
    this.stopPropagation(e);

    const isBookmarkedCurrent = this.post.isBookmarked;
    this.changeBookmarkStatus(!isBookmarkedCurrent)

    this.isUploading = true;
    const request = isBookmarkedCurrent ? this.unbookmark() : this.bookmark();
    try {
      await request;
      this.user.markAsBookmarkChanged();
    } catch (error) {
      this._toastr.error('Something went wrong. Please try again later.');
      this.changeBookmarkStatus(isBookmarkedCurrent);
    }
    this.isUploading = false;
  }

  bookmark(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._sharedService.post({}, 'social/bookmark/' + this.post._id).subscribe((res: IResponseData) => {
        if(res.statusCode == 200) {
          resolve();
        } else {
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      });
    })
  }

  unbookmark(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._sharedService.deleteContent('social/bookmark/' + this.post._id).subscribe((res: IResponseData) => {
        if (res.statusCode == 200) {
          resolve();
        } else {
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      });
    });
  }

  changeBookmarkStatus(isBookmarked: boolean) {
    if(isBookmarked) {
      this.post.bookmark();
    } else {
      this.post.unbookmark();
    }
  }

  onClickComment(e: Event) {
    this.stopPropagation(e);
    if(this.isFormCommentShown) {
      this.hideComment();
    } else {
      this.showComment();
    }
  }

  onSubmitComment() {
    if(!this.user) {
      this._modalService.show('login-menu');
    } else {
      this.f.body.setValue((this.f.body.value || '').replace(/(<p><br><\/p>)+$/, '').trim());

      this.isUploading = true;
      this._sharedService.post(this.formComment.value, 'blog/comment/' + this.post._id).subscribe((res: ICommentCreateResult) => {
        this.isUploading = false;
        if(res.statusCode == 200) {
          this.formComment.reset();
          res.data.comment.author = this._user;
          this.post.setComment(res.data.comment, res.data.post.numComments);
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
