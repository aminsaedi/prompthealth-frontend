import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { EditorService } from '../../social/editor.service';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IBellResult, IContentCreateResult, IFollowResult, IUnfollowResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { SocialService } from '../../social/social.service';
import { Profile } from 'src/app/models/profile';

@Component({
  selector: 'popup-post-menu',
  templateUrl: './popup-post-menu.component.html',
  styleUrls: ['./popup-post-menu.component.scss']
})
export class PopupPostMenuComponent implements OnInit {

  @Input() post: ISocialPost;

  get eligibleToShowPostMenu() {
    return this.post && this.user;
  }

  get eligibleToMarkAsNews() {
    return this.eligibleToDelete && this.post.isArticle && this.user.isSA;
  }

  get eligibleToEdit() {
    return this.eligibleToDelete && (this.post.isArticle || this.post.isEvent);
  }

  get eligibleToDelete() {
    return this.post.authorId == this.user._id;
  }

  get eligibleToFollow() {
    return (
      this.post.authorId != this.user._id && 
      this.post.authorId != environment.config.idSA
    );
  }

  get eligibleToBell() {
    return this.post.authorId != this.user._id;
  }

  get eligibleToRecommend() {
    return this.post.authorId != this.user._id && this.user.eligibleToRecommend;
  }

  // check the post author is already recommended by loggedin user
  // how to: (this data is not populated by backend. need to populate in frotnend)
  //// get referrals the loggedin user has created at initializing socialModule (socialModule.baseComponent.ts)
  //// save the referrals in MyProfile (myProfile.ts)
  //// check if the post author is recommended here
  get isAuthorRecommended() {
    return !!this.user.recommendationsByMe.find(item => item.to == this.post.authorId);
  }


  get user() {
    return this._profileService.profile;
  }

  public isPopupPostMenuShown = false;
  public isUploading = false;

  private subscription: Subscription;

  constructor(
    private _modalService: ModalService,
    private _editorService: EditorService,
    private _router: Router,
    private _location: Location,
    private _profileService: ProfileManagementService,
    private _changeDetector: ChangeDetectorRef,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _socialService: SocialService,
  ) { }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.post.changed().subscribe(() => {
      this._changeDetector.detectChanges();
    })
  }

  showPopup(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.isPopupPostMenuShown = true;
    this._changeDetector.detectChanges();
  }

  onClickWriteRecommendation(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this._socialService.setProfileForReferral(new Profile(this.post.author));
    this._router.navigate(['/community/profile', this.post.authorId, 'new-recommend']);
  }

  toggleMarkAsNews(e: Event, markAsNews: boolean) {
    this.hidePopup(e);

    this.isUploading = true;
    this._sharedService.put({isNews: markAsNews}, 'blog/update-status-news/' + this.post._id).subscribe((res: IContentCreateResult) => {
      if(res.statusCode == 200) {
        if(markAsNews) {
          this.post.markAsNews();
        } else {
          this.post.markAsUnnews();
        }
        this._toastr.success(markAsNews ? 'Marked as news' : 'Marked as NOT news');
      } else {
        console.log(res.message);
        this._toastr.error('Something wrong');
      }
    }, error => {
      console.log(error);
      this._toastr.error('Something wrong');
    }, () => {
      this.isUploading = false;
    });
  }

  editContent(e: Event) {
    this.hidePopup(e);
    this._editorService.setData(this.post.decode());
    this.markCurrentPosition();

    const route = 
      this.post.isArticle ?  ['/community/editor/article', this.post._id] :
      this.post.isEvent ? ['/community/editor/event', this.post._id] :
      this.post.isNote ? ['community/editor/note', this.post._id] : 
      ['community/editor/article', this.post._id];

    this._router.navigate(route);
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }
  
  hidePopup(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.isPopupPostMenuShown = false;
    this._changeDetector.detectChanges();
  }

  toggleFollow(e: Event) {
    this.hidePopup(e);
    if(this.post.authorFollowed) {
      this.unfollow();
    } else {
      this.follow();
    }
  }

  toggleBell(e: Event) {
    this.hidePopup(e);
    if(this.post.authorBelled) {
      this.unbell();
    } else {
      this.bell();
    }
  }

  deleteContent(e: Event) {
    this.hidePopup(e);    
    this._modalService.show('delete-post-alert', this.post);
  }

  follow() {
    const data = {
      id: this.post.authorId,
      type: 'user',
    }

    this.isUploading = true;
    this._sharedService.post(data, 'social/follow').subscribe((res: IFollowResult) => {
      if(res.statusCode == 200) {
        this.user.setFollowing(this.post.author, true);

        const profile = this._socialService.profileOf(this.post.authorId);
        profile?.countupFollower();

        const posts = this._socialService.findPostsByUserId(this.post.authorId);
        posts.forEach(post => {
          post.markAsFollow();
        });

        this._toastr.success(this.post.authorName + ' has been followed.');
      } else {
        console.log(res.message);
        this._toastr.error('Something wrong. Could not follow.');
      }
    }, error => {
      console.log(error);
      this._toastr.error('Something wrong. Could not follow.');
    }, () => {
      this.isUploading = false;
    });
  }

  unfollow() {
    this.isUploading = true;
    this._sharedService.deleteContent('social/follow/' + this.post.authorId).subscribe((res: IUnfollowResult) => {
      if (res.statusCode == 200) {
        this.user.removeFollowing(this.post.author, true);

        const profile = this._socialService.profileOf(this.post.authorId);
        profile?.countdownFollower();

        const posts = this._socialService.findPostsByUserId(this.post.authorId);
        posts.forEach(post => {
          post.markAsUnfollow();
        });

        this._toastr.success(this.post.authorName + ' has been unfollowed.');

      } else {
        console.log(res.message);
        this._toastr.error('Something wrong. Could not unfollow.');
      }
    }, error => {
      console.log(error);
      this._toastr.error('Something wrong. Could not unfollow.');
    }, () => {
      this.isUploading = false;
    });
  }

  bell() {
    const data = {
      id: this.post.authorId,
    }

    this.isUploading = true;
    this._sharedService.post(data, 'social/bell').subscribe((res: IBellResult) => {
      if(res.statusCode == 200) {
        const posts = this._socialService.findPostsByUserId(this.post.authorId);
        posts.forEach(post => {
          post.markAsBell();
        });
        this._toastr.success(`You will receive notifications when ${this.post.authorName} create new contents.`);

      } else {
        console.log(res.message);
        this._toastr.error('Something wrong. Could not follow.');
      }
    }, error => {
      console.log(error);
      this._toastr.error('Something wrong. Could not follow.');
    }, () => {
      this.isUploading = false;
    });
  }

  unbell() {
    this.isUploading = true;
    this._sharedService.deleteContent('social/bell/' + this.post.authorId).subscribe((res: IUnfollowResult) => {
      if (res.statusCode == 200) {
        const posts = this._socialService.findPostsByUserId(this.post.authorId);
        posts.forEach(post => {
          post.markAsUnbell();
        });

        this._toastr.success(`The notification from ${this.post.authorName} has been turned off.`);

      } else {
        console.log(res.message);
        this._toastr.error('Something wrong. Could not turn on notification.');
      }
    }, error => {
      console.log(error);
      this._toastr.error('Something wrong. Could not turn on notification.');
    }, () => {
      this.isUploading = false;
    });
  }
}
