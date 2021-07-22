import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Professional } from 'src/app/models/professional';
import { IGetProfileResult, IResponseData } from 'src/app/models/response-data';
import { SocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { slideInSocialProfileChildRouteAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [slideInSocialProfileChildRouteAnimation],
})
export class ProfileComponent implements OnInit {
  
  public profileId: string;
  public profile: Professional;


  get sizeS() { return (!window || window.innerWidth < 768) ? true : false; }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _sharedService: SharedService,
    private _socialService: SocialService,
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe((param: {userid: string}) => {
      this.profileId = param.userid;
      this.initProfile();
    });
  }

  initProfile() {
    const profile = this._socialService.profileOf(this.profileId);
    if(profile) {
      this.profile = profile.userdata;
    } else {
      this.fetchProfile(this.profileId).then(p => {
        this.profile = p;
        this._socialService.setProfile(p);
      });
    }
  }

  fetchProfile(id: string): Promise<Professional> {
    return new Promise((resolve, reject) => {
      const path = `user/get-profile/${id}`;
      this._sharedService.getNoAuth(path).subscribe((res: IGetProfileResult) => {
        if(res.statusCode === 200) {
          const p = res.data[0];
          const profile = new Professional(p._id, p);
          resolve(profile);
        } else {
          console.log(res.message);
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      });
    });
  }

  fetchPosts(): Promise<SocialPost[]> {
    return new Promise((resolve, reject) => {

    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.order;
  }

}
