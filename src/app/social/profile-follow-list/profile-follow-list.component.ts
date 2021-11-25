import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GetQuery } from 'src/app/models/get-query';
import { Partner } from 'src/app/models/partner';
import { Professional } from 'src/app/models/professional';
import { Profile } from 'src/app/models/profile';
import { IGetFollowingsResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-follow-list',
  templateUrl: './profile-follow-list.component.html',
  styleUrls: ['./profile-follow-list.component.scss']
})
export class ProfileFollowListComponent implements OnInit {

  get linkToBack() {
    const profileId = this._route.snapshot.params.userid;
    let link: string[];
    if(profileId) {
      link = ['/community/profile', profileId];
    } else {
      link = ['/community/feed'];
    }
    return link;
}

  public profile: Professional | Partner;

  public follows: Profile[] = null;
  public existsMore: boolean = true;
  public isLoading: boolean = false;

  private countPerPage = 40;


  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _location: Location,
    private _router: Router,
    private _route: ActivatedRoute,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe((params: {userid: string}) => {
      this.profile = this._socialService.profileOf(params.userid);
      this.onProfileChanged(this.profile);
    });
  }

  onProfileChanged(p: Professional | Partner) {
    this.profile = p;
    if(!p) {
      this.goback();
    } else{    
      this.setMeta();
      if (p.followings) {
        this.follows = p.followings;
        this.checkExistMore();
      } else {
        this.fetchFollowData();
      }  
    }
  }

  setMeta() {
    this._uService.setMeta(this._router.url, {
      title: `${this.profile.name}'s follow list | PromptHealth Community`
    });
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
