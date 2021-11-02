import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { IBellResult, IFollowResult, IUnfollowResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { SocialService } from '../social.service';

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


  get user() {
    return this._profileService.profile;
  }

  public isPopupPostMenuShown = false;

  private subscription: Subscription;

  constructor(
    private _modalService: ModalService,
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
    console.log(this.post);
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
    });
  }

  unfollow() {
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
    });
  }

  bell() {
    const data = {
      id: this.post.authorId,
    }

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
    });
  }

  unbell() {
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
    });
  }
}
