import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ICommentCreateResult } from 'src/app/models/response-data';
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
  public FRONTEND_URL = environment.config.BASE_URL
  
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
    const isLikedCurrent = this.post.isLiked;
    this.changeLikeStatus(!this.post.isLiked);

    if(this.post) {
      this.isUploading = true;
      this._sharedService.post({}, 'blog/like/' + this.post._id).subscribe(res => {
        if(res.statusCode != 200) {
          console.log(res.message);
          this.changeLikeStatus(isLikedCurrent);
          this._toastr.error('Something went wrong');          
        }
      }, error => {
        console.log(error);
        this.changeLikeStatus(isLikedCurrent);
        this._toastr.error('Something went wrong');          
      }, () => {
        this.isUploading = false;
      });
    }
  }

  changeLikeStatus(isLiked: boolean) {
    if(isLiked) {
      this.post.like();
    } else {
      this.post.unlike();
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

  onClickBookmark(e: Event) {
    this.stopPropagation(e);
    
    setTimeout(() => {
      this.post.isBookmarked = this.post.isBookmarked == true ? false : true;
    }, 500);
  }

  onSubmitComment() {
    if(!this.user) {
      this._modalService.show('login-menu');
    } else {
      this.isUploading = true;
      this._sharedService.post(this.formComment.value, 'blog/comment/' + this.post._id).subscribe((res: ICommentCreateResult) => {
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
        this._toastr.error('Could not post your comment. Please try again');
      }, () => {
        this.isUploading = false;
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
