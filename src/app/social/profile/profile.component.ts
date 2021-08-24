import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';;
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { GetQuery } from 'src/app/models/get-query';
import { Partner } from 'src/app/models/partner';
import { Professional } from 'src/app/models/professional';
import { Profile } from 'src/app/models/profile';
import { IFollowResult, IGetFollowingsResult, IGetFollowStatusResult, IGetProfileResult, IUnfollowResult } from 'src/app/models/response-data';
import { IUserDetail } from 'src/app/models/user-detail';
import { DateTimeData, FormItemDatetimeComponent } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { slideInSocialProfileChildRouteAnimation } from 'src/app/_helpers/animations';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [slideInSocialProfileChildRouteAnimation],
})
export class ProfileComponent implements OnInit {

  get sizeS() { return (!window || window.innerWidth < 768) ? true : false; }
  get sizeM() { return !this.sizeS && (window.innerWidth < 992) ? true : false; }
  get f() { return this.formBooking.controls; }
  get isProfileMyself() { return this.user && this.user._id == this.profileId; }
  get user() { return this._profileService.profile; }

  linkToChildRoute(link: string) {
    const route = ['/community/profile', this.profileId];
    if(link) {
      route.push(link);
    }
    return route;
  }

  public profileId: string;
  public profile: Professional;

  public profileMenus: IProfileMenuItem[] = [];
  
  public isFollowing = false;

  public questionnaires: QuestionnaireMapProfilePractitioner;

  private formBooking: FormGroup;
  public submittedFormBooking = false;
  public minDateTime: DateTimeData;
  public maxBookingNote = minmax.bookingNoteMax;
  
  public isFollowLoading = false;
  public isBookingLoading: boolean = false;

  private subscriptionLoginStatus: Subscription;

  @ViewChild(FormItemDatetimeComponent) private formDateTimeComponent: FormItemDatetimeComponent;
  @ViewChild('#modalBooking') private modalBooking: ModalComponent;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _sharedService: SharedService,
    private _socialService: SocialService,
    private _qService: QuestionnaireService,
    private _modalService: ModalService,
    private _toastr: ToastrService,
    private _profileService: ProfileManagementService,
  ) { }

  ngOnDestroy() {
    this.subscriptionLoginStatus.unsubscribe();
  }

  ngOnInit(): void {
    this.observeLoginStatus();

    const now = new Date();
    this.minDateTime = {
      year: now.getFullYear(), 
      month: now.getMonth() + 1, 
      day: now.getDate() + 1,
      hour: 9,
      minute: 0
    };

    this.formBooking = new FormGroup({
      name: new FormControl('', validators.bookingName),
      email: new FormControl('', validators.bookingEmail),
      phone: new FormControl('', validators.bookingPhone),
      bookingDateTime: new FormControl('', validators.bookingDateTime),
      note: new FormControl('', validators.bookingNote),
    });

    this._route.params.subscribe((param: {userid: string}) => {
      this.profileId = param.userid;
      this.checkFollowStatus();
      this.initProfile();
    });

    // const query = new GetQuery({count: 50});
    // const path = 'social/get-followeds' + query.toQueryParamsString();
    // this._sharedService.get(path).subscribe((res: IGetFollowingsResult) => {
    //   console.log(res);
    // });
  }

  initProfile() {
    this._socialService.disposeProfile();
    const profile = this._socialService.profileOf(this.profileId);
    if(profile) {
      this.profile = profile;
      this.setProfileMenu();
      this._socialService.setProfile(this.profile);
    } else {
      const promiseAll: [Promise<Professional>, Promise<QuestionnaireMapProfilePractitioner>] = [
        this.fetchProfile(this.profileId),
        this.getQuestionnaire(),
      ];

      Promise.all(promiseAll).then((vals) => {
        this.profile = vals[0];
        this.questionnaires = vals[1];
        this.setProfileMenu();

        this._socialService.setProfile(this.profile);
      }, error => {
        this._toastr.error('Something went wrong.');
      });
    }
  }

  setProfileMenu() {
    this.profileMenus = this.profile.isSA ? profileMenusForPH : this.profile.isProvider ? profileMenusForProvider : profileMenusForCompany;
  }

  getQuestionnaire(type: IUserDetail['roles'] = 'SP'): Promise<QuestionnaireMapProfilePractitioner> {
    return new Promise((resolve, reject) => {
      this._qService.getProfilePractitioner(type).then((questionnaires) => {
        resolve(questionnaires);
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
        console.log(res.data)
        if(res.statusCode === 200) {
          const p = res.data;
          let professional: Professional | Partner;
          if(p.roles == 'P') {
            professional = new Partner(p);
          } else {
            professional = new Professional(p._id, p);
          }
          this._socialService.saveCacheProfile(professional);
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

  onClickBack() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      this._router.navigate(['/community/feed']);
    } else {
      this._location.back();
    }
  }

  onClickLogin() {
    this._modalService.show('login-menu');
  }

  onClickBook() {
    if(this.user) {
      this._modalService.show('booking');
    } else {
      this._modalService.show('login-menu');
    }
  }

  async onClickBookOutside() {
    this._sharedService.post({ _id: this.user._id }, '/booking/gain-booking-count').subscribe(res => {
      console.log(res);
    }, err => {
      console.error(err);
    });
    window.open(this.profile.bookingUrl, '_blank');
  }

  async onClickFollow() {
    const query = this.isFollowing ? this.unfollow() : this.follow();
    
    this.isFollowLoading = true;
    try {
      await query;
    } catch (error) {
      this._toastr.error('Something went wrong. Please try again later.');
    } finally {
      this.isFollowLoading = false;
    }
  }

  follow() {
    return new Promise((resolve, reject) => {
      const data = {
        id: this.profileId,
      }
      this._sharedService.post(data, 'social/follow').subscribe((res: IFollowResult) => {
        if(res.statusCode == 200) {
          this.isFollowing = true;
          resolve(true);
        } else {
          reject(false);
        }
      }, error => {
        console.log(error);
        reject(false);
      });  
    })
  }

  async unfollow() {
    return new Promise((resolve, reject) => {
      this._sharedService.deleteContent('social/follow/' + this.profileId).subscribe((res: IUnfollowResult) => {
        if (res.statusCode == 200) {
          this.isFollowing = false;
          resolve(true);
        } else {
          reject(false);
        }
      }, error => {
        console.log(error);
        reject(false);
      });
    });
  }

  onSubmitBooking() {
    this.submittedFormBooking = true;
    if (this.formBooking.invalid) {
      this._toastr.error('There are several items that requires your attention');
      return;
    } else {

      const data = {
        drId: this.profileId,
        customerId: this.user._id,
        ...this.formBooking.value,
      };

      data.phone = data.phone.toString();
      data.bookingDateTime = this.formDateTimeComponent.getFormattedValue().toString();
      this.isBookingLoading = true;
      const path = `booking/create`;
      this._sharedService.post(data, path).subscribe((res: any) => {
        this.isBookingLoading = false;
        if (res.statusCode === 200) {
          this.submittedFormBooking = false;
          this._toastr.success(res.message);
          this.modalBooking.hide();
        } else {
          this._toastr.error(res.message);
        }
      }, (error) => {
        this.isBookingLoading = false;
        this._toastr.error(error);
      });
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.order;
  }

  observeLoginStatus() {
    this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe((res) => {
      this.checkFollowStatus();
    });
  }

  checkFollowStatus() {
    if(this.isFollowLoading) {
      console.log('isFollowLoading.');
      return;
    }

    if(!this.user) {
      console.log('you are not logged in');
      return;
    }

    if(this.user && this.user._id == this.profileId) {
      console.log('this profile is myself');
      return;
    }

    console.log('checkFollowStatus');

    this.isFollowing = false;
    this.isFollowLoading = true;
    const path = 'social/get-follow-status/' + this.profileId;
    this._sharedService.get(path).subscribe((res: IGetFollowStatusResult) => {
      this.isFollowing = !!res.data;
    }, error => {
      console.log(error);
      this.isFollowing = false;
    }, () => {
      this.isFollowLoading = false;
    });
  }
}

const profileMenusForProvider: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'service', label: 'Service', relativeLink: 'service', },
  {id: 'feed',    label: 'Feed',    relativeLink: 'feed'},
  {id: 'review',  label: 'Review',  relativeLink: 'review'},
];

const profileMenusForCompany: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'promotion', label: 'Discounts', relativeLink: 'promotion', },
  {id: 'review', label: 'Recommendation', relativeLink: 'review', },
];

const profileMenusForPH: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'feed',    label: 'Feed',    relativeLink: 'feed'},
];

interface IProfileMenuItem {
  id: string;
  label: string;
  relativeLink: string;
}
