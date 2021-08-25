import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { GetQuery } from 'src/app/models/get-query';
import { Partner } from 'src/app/models/partner';
import { Professional } from 'src/app/models/professional';
import { Profile } from 'src/app/models/profile';
import { IGetFollowingsResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-follow-list',
  templateUrl: './profile-follow-list.component.html',
  styleUrls: ['./profile-follow-list.component.scss']
})
export class ProfileFollowListComponent implements OnInit {

  public profile: Professional | Partner;

  public follows: Profile[] = null;
  public existsMore: boolean = true;
  public isLoading: boolean = false;

  private countPerPage = 40;

  private subscription: Subscription;

  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _location: Location,
    private _router: Router,
    private _route: ActivatedRoute,
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    const profile = this._socialService.selectedProfile;
    this.onProfileChanged(profile);

    this.subscription = this._socialService.selectedProfileChanged().subscribe(p => {
      this.onProfileChanged(p);
    })
  }

  onProfileChanged(p: Professional | Partner) {
    this.profile = p;
    if(!p) {
      this.goback();
    } else{    
      if (p.followings) {
        this.follows = p.followings;
        this.checkExistMore();
      } else {
        this.fetchFollowData();
      }  
    }
  }

  fetchFollowData() {
    const page = (this.follows && this.follows.length > 0) ? Math.ceil(this.follows.length / this.countPerPage) : 1;
    const query = new GetQuery({count: this.countPerPage, page: page});
    const path = 'social/get-followings/' + this.profile._id;

    this.isLoading = true;
    this._sharedService.get(path + query.toQueryParamsString()).subscribe((res: IGetFollowingsResult) => {
      if(res.statusCode == 200) {
        this.profile.setFollowings(res.data);
        this.follows = this.profile.followings;
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
    const total = this.profile.numFollowing;
    this.existsMore = !!(this.follows.length < total);
  }

  goback() {
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1) {
      const profileId = this._route.snapshot.params.userid;
      if(profileId) {
        this._router.navigate(['/community/profile', profileId]);
      } else {
        this._router.navigate(['/community/feed']);
      }
    } else {
      this._location.back();
    }
  }
}
