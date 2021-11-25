import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { LoginStatusType, ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { GetQuery } from 'src/app/models/get-query';
import { Profile } from 'src/app/models/profile';
import { IGetFollowingsResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.scss']
})
export class FollowListComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get followTypeFormatted() { return this.followType == 'following' ? 'Followings' : 'Followers'; }
  
  public follows: Profile[] = null;
  public existsMore: boolean = true;
  public isLoading: boolean = false;

  public followType: FollowType;
  private countPerPage = 40;

  private subscriptionLoginStatus: Subscription;

  constructor(
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _location: Location,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
  ) { }


  ngOnDestroy() {
    if(this.subscriptionLoginStatus){
      this.subscriptionLoginStatus.unsubscribe();
    }
  }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Follow list | PromptHealth Community',
      robots: 'noindex',
    });

    this._route.data.subscribe((data: {type: FollowType}) => {
      this.followType = data.type;
      this.observeLoginStatus();
    });
  }


  observeLoginStatus() {
    const status = this._profileService.loginStatus;
    this.onChangeLoginStatus(status);

    this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe((status) => {
      this.onChangeLoginStatus(status);
    });
  }

  onChangeLoginStatus(status: LoginStatusType) {
    if(status == 'loggedIn') {
      this.initFollowData();
    } else if (status == 'notLoggedIn') {
      this._router.navigate(['/community/feed'], {replaceUrl: true});
    }
  }

  initFollowData() {
    const follows = this.followType == 'following' ? this.user.followings : this.user.followers;
    if(follows) {
      this.follows = follows;
      this.checkExistMore();
    } else {
      this.fetchFollowData()
    }
  }

  fetchFollowData() {
    const page = (this.follows && this.follows.length > 0) ? Math.ceil(this.follows.length / this.countPerPage) : 1;
    const query = new GetQuery({count: this.countPerPage, page: page});
    const path = this.followType == 'following' ? 'social/get-followings' : 'social/get-followeds';
    this.isLoading = true;
    this._sharedService.get(path + query.toQueryParamsString()).subscribe((res: IGetFollowingsResult) => {
      if(res.statusCode == 200) {
        if(this.followType == 'following') {
          this.user.setFollowings(res.data);
        } else {
          this.user.setFollowers(res.data);
        }

        this.follows = this.followType == 'following' ? this.user.followings : this.user.followers;
        this.checkExistMore();
      } else {
        this._toastr.error('Something went wrong. Please try again later');
      }
    }, error => {
      console.log(error);
      this._toastr.error('Something went wrong. Please try again later');
    }, () => {
      this.isLoading = false;
    });
  }

  checkExistMore() {
    const total = this.followType == 'following' ? this.user.numFollowing : this.user.numFollower;
    this.existsMore = !!(this.follows.length < total);
  }
}

type FollowType = 'following' | 'followed';
