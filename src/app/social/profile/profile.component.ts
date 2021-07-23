import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Professional } from 'src/app/models/professional';
import { IGetProfileResult } from 'src/app/models/response-data';
import { SocialPost } from 'src/app/models/social-post';
import { IUserDetail } from 'src/app/models/user-detail';
import { QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
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
    private _route: ActivatedRoute,
    private _sharedService: SharedService,
    private _socialService: SocialService,
    private _qService: QuestionnaireService,
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
      const promiseAll: [Promise<Professional>, Promise<void>] = [
        this.fetchProfile(this.profileId),
        this.getQuestionnaire(),
      ];

      Promise.all(promiseAll).then((vals) => {
        this.profile = vals[0];
        this._socialService.setProfile(this.profile);
      });
    }
  }

  getQuestionnaire(type: IUserDetail['roles'] = 'SP'): Promise<void> {
    return new Promise((resolve, reject) => {
      this._qService.getProfilePractitioner(type).then(() => {
        resolve();
      }, error => {
        console.log(error);
        reject();
      });  
    });
  }

  fetchProfile(id: string): Promise<Professional> {
    return new Promise((resolve, reject) => {
      const path = `user/get-profile/${id}`;
      this._sharedService.getNoAuth(path).subscribe((res: IGetProfileResult) => {
        if(res.statusCode === 200) {
          const p = res.data[0];
          const professional = new Professional(p._id, p);
          resolve(professional);
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
