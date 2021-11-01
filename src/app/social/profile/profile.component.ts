import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';;
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { GetReferralsQuery } from 'src/app/models/get-referrals-query';
import { Partner } from 'src/app/models/partner';
import { Professional } from 'src/app/models/professional';
import { IBellResult, IFollowResult, IGetBellStatusResult, IGetFollowStatusResult, IGetProfileResult, IGetStaffResult, IGetReferralsResult, IUnbellResult, IUnfollowResult, IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { SocialPostSearchQuery } from 'src/app/models/social-post-search-query';
import { IUserDetail } from 'src/app/models/user-detail';
import { DateTimeData, FormItemDatetimeComponent } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation, slideInSocialProfileChildRouteAnimation } from 'src/app/_helpers/animations';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { smoothHorizontalScrolling } from 'src/app/_helpers/smooth-scroll';
import { environment } from 'src/environments/environment';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [slideInSocialProfileChildRouteAnimation, expandVerticalAnimation],
})
export class ProfileComponent implements OnInit {

  get sizeS() { return (!window || window.innerWidth < 768) ? true : false; }
  get sizeM() { return !this.sizeS && (window.innerWidth < 992) ? true : false; }
  get f() { return this.formBooking.controls; }
  get isProfileMyself() { return this.user && this.user._id == this.profileId; }
  get isProfilePH() { return this.profileId == environment.config.idSA; }
  get user() { return this._profileService.profile; }
  get questionnaires() { return this._qService.questionnaireOf('profilePractitioner') as QuestionnaireMapProfilePractitioner; }
  get countAvailablePromos(): number {
    const promos = this._socialService.promosOfUser(this.profileId);
    let count = 0;
    if(promos?.length > 0) {
      promos.forEach(p => {
        if(p.isAvailable) {
          count ++;
        }
      });
    }
    return count;
  }

  get canRecommend() {
    let canRecommend = false;
    if(this.user && this.profile && !this.isProfileMyself && this.profile.eligibleFeatureRecommendation && this.user.eligibleCreateRecommendation && this.profile.doneInitRecommendations) {
      canRecommend = true;
    }

    if(canRecommend) {
      const alreadyCreateRecomendation = !!this.profile.recommendations.find(item => item.from == this.user._id);
      canRecommend = !alreadyCreateRecomendation;
    }
    return canRecommend;
  }

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
  public isBelling = false;

  private formBooking: FormGroup;
  public submittedFormBooking = false;
  // public minDateTime: DateTimeData;
  public maxBookingNote = minmax.bookingNoteMax;

  public idxActiveRecommendationIndicator: number = 0;
  private timerRecommendationCarousel: any;
  
  public countPromoPerPage: number = 20;

  public isBellLoading = false;
  public isFollowLoading = false;
  public isBookingLoading: boolean = false;

  private subscriptionLoginStatus: Subscription;

  @ViewChild(FormItemDatetimeComponent) private formDateTimeComponent: FormItemDatetimeComponent;
  @ViewChild('modalBooking') private modalBooking: ModalComponent;
  @ViewChild('recommendationCarousel') private recommendationCarousel: ElementRef;

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
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnDestroy() {
    this.subscriptionLoginStatus.unsubscribe();
    if(this.timerRecommendationCarousel) {
      clearInterval(this.timerRecommendationCarousel);
    }
  }

  ngOnInit(): void {
    this.observeLoginStatus();

    // const now = new Date();
    // this.minDateTime = {
    //   year: now.getFullYear(), 
    //   month: now.getMonth() + 1, 
    //   day: now.getDate() + 1,
    //   hour: 9,
    //   minute: 0
    // };

    this.formBooking = new FormGroup({
      name: new FormControl('', validators.bookingName),
      email: new FormControl('', validators.bookingEmail),
      phone: new FormControl('', validators.bookingPhone),
      // bookingDateTime: new FormControl('', validators.bookingDateTime),
      note: new FormControl('', validators.bookingNote),
      isUrgent: new FormControl(false),
    });

    this._route.params.subscribe((param: {userid: string}) => {
      this.profileId = param.userid;
      this.checkFollowStatus();
      this.checkBellStatus();
      this.initProfile();

      if(this.timerRecommendationCarousel) {
        clearInterval(this.timerRecommendationCarousel);
      }
    });
  }

  initProfile() {
    this._socialService.disposeProfile();
    this.countupProfileView();
    const profile = this._socialService.profileOf(this.profileId);
    if(profile) {
      this.profile = profile;
      this.initRecommendation();
      this.setProfileMenu();
      this._socialService.setProfile(this.profile);
      // this.setMetaForAbout();
    } else {
      const promiseAll: [Promise<Professional>, Promise<QuestionnaireMapProfilePractitioner>] = [
        this.fetchProfile(this.profileId),
        this.getQuestionnaire(),
      ];

      Promise.all(promiseAll).then(async (vals) => {
        this.profile = vals[0];
        this.initRecommendation();
        this.setProfileMenu();
        this._socialService.setProfile(this.profile);

        if(this.profile.isSP && !this.profile.triedFetchingTeam) {
          this.fetchTeam();
        }

        if(this.profile.isP && !this._socialService.promosOfUser(this.profileId)) {
          this.fetchPromos();
        }

      }, error => {
        console.log(error);
        this._router.navigate(['404'], {replaceUrl: true});
        this._toastr.error('Something went wrong.');
      });
    }

  }

  initRecommendation() {
    this.idxActiveRecommendationIndicator = 0;

    if(!this.profile.doneInitRecommendations) {
      const query = new GetReferralsQuery({
        type: 'recommend',
        order: 'desc',
        sortBy: 'createdAt',
      });
      this._sharedService.getNoAuth('referral/get/' + this.profile._id + query.toQueryParamsString()).subscribe((res: IGetReferralsResult) => {
        if(res.statusCode == 200) {
          this.profile.setRecomendations(res.data);
        } else {
          console.log(res.message);
          this.profile.setRecomendations([]);
        }
      }, error => {
        console.log(error);
        this.profile.setRecomendations([]);
      }, () => {
        setTimeout(() => {
          this.startRecommendationCarousel();
        }, 300); 
      });
    } else {
      setTimeout(() => {
        this.startRecommendationCarousel();
      }, 300);
    }
  }

  startRecommendationCarousel(startAt: number = 0) {
    const el = this.recommendationCarousel ? this.recommendationCarousel.nativeElement as HTMLDivElement : null;   
    if(el && this.profile.recommendations && this.profile.recommendations.length > 1) {
      this.moveRecommendationCarousel(this.idxActiveRecommendationIndicator, startAt);

      this.timerRecommendationCarousel = setInterval(() => {
        const current = this.idxActiveRecommendationIndicator;
        const next = (this.idxActiveRecommendationIndicator + 1) % this.profile.recommendationsPreview.length;
        this.moveRecommendationCarousel(current, next);
        this._changeDetector.detectChanges();
      }, 8000);  
    } 
  }

  moveRecommendationCarousel(current: number, next: number) {
    const el = this.recommendationCarousel.nativeElement as HTMLDivElement;
    const wEl = el.getBoundingClientRect().width;

    this.idxActiveRecommendationIndicator = next;
    smoothHorizontalScrolling(el, 300, wEl * next - wEl * current, wEl * current);
  }

  onClickRecommendationCarouselIndicator(i: number) {
    if(this.timerRecommendationCarousel) {
      clearInterval(this.timerRecommendationCarousel);
    }
    this.startRecommendationCarousel(i);
  }

  countupProfileView() {
    this._sharedService.postNoAuth({_id: this.profileId}, 'user/update-view-count').subscribe(() => {});
  }

  // setMetaForAbout() {
  //   const url = this._router.url;
  //   if(!url.match('service|feed|review')) {
  //     const typeOfProvider = this._qService.getSelectedLabel(this.questionnaires.typeOfProvider, this.profile.allServiceId);
  //     const serviceDelivery = this._qService.getSelectedLabel(this.questionnaires.serviceDelivery, this.profile.serviceOfferIds);;
  //     this._uService.setMeta(this._router.url, {
  //       title: `${this.profile.name} in ${this.profile.city}, ${this.profile.state} | PromptHealth Community`,
  //       description: `${this.profile.name} is ${typeOfProvider.join(', ')} offering ${serviceDelivery.join(', ')}.`,
  //     });
  //   }
  // }

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

  fetchTeam(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.profile.markAsTriedFetchingTeam();
      const path = `staff/get-by-user/${this.profile._id}`;
      this._sharedService.getNoAuth(path).subscribe((res: IGetStaffResult) => {
        if(res.statusCode == 200) {

          this.profile.setTeam(res.data.center);
          resolve();
        } else {
          // console.log(res.message);
          resolve();
        }
      }, error => {
        console.log(error);
        resolve();
      });
    });
  }

  fetchPromos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = new SocialPostSearchQuery({
        order: 'desc',
        count: this.countPromoPerPage,
        contentType: 'PROMO',        
      });
      this._sharedService.get('note/get-by-author/' + this.profileId + query.toQueryParams()).subscribe((res: IGetSocialContentsByAuthorResult) => {
        if(res.statusCode === 200) {
          this._socialService.saveCachePromosOfUser(res.data, this.profileId);
          resolve();
        } else {
          console.log(res.message);
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      })
    }); 
  }

  goback() {
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1) {
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
        type: 'user',
      }
      this.isFollowing = true;
      this.user.setFollowing(this.profile.decode(), true);
      this.profile.countupFollower();

      this._sharedService.post(data, 'social/follow').subscribe((res: IFollowResult) => {
        if(res.statusCode == 200) {
          resolve(true);
        } else {
        this.isFollowing = false;
        this.user.removeFollowing(this.profile.decode(), true);
          this.profile.countdownFollower();
          reject(false);
        }
      }, error => {
        console.log(error);
        this.isFollowing = false;
        this.user.removeFollowing(this.profile.decode(), true);
        this.profile.countdownFollower();
        reject(false);
      });  
    })
  }

  async unfollow() {
    return new Promise((resolve, reject) => {
      this.isFollowing = false;
      this.user.removeFollowing(this.profile.decode(), true);
      this.profile.countdownFollower();

      this._sharedService.deleteContent('social/follow/' + this.profileId).subscribe((res: IUnfollowResult) => {
        if (res.statusCode == 200) {
          resolve(true);
        } else {
          this.isFollowing = true;
          this.user.setFollowing(this.profile.decode(), true);
          this.profile.countupFollower();
          reject(false);
        }
      }, error => {
        console.log(error);
        this.isFollowing = true;
        this.user.setFollowing(this.profile.decode(), true);
        this.profile.countupFollower();
        reject(false);
      });
    });
  }

  async onClickBell() {
    const query = this.isBelling ? this.unbell() : this.bell();
    
    this.isBellLoading = true;
    try {
      await query;
    } catch (error) {
      this._toastr.error('Something went wrong. Please try again later.');
    } finally {
      this.isBellLoading = false;
    }
  }

  async bell() {
    return new Promise((resolve, reject) => {
      const data = {
        id: this.profileId,
      }

      this.isBelling = true;
      
      this._sharedService.post(data, 'social/bell').subscribe((res: IBellResult) => {
        if(res.statusCode == 200) {
          resolve(true);
        } else {
          this.isBelling = false;
          reject(false);
        }
      }, error => {
        console.log(error);
        this.isBelling = false;
        reject(false);
      });
    });
  }

  async unbell() {
    return new Promise((resolve, reject) => {
      this.isBelling = false;

      this._sharedService.deleteContent('social/bell/' + this.profileId).subscribe((res: IUnbellResult) => {
        if (res.statusCode == 200) {
          resolve(true);
        } else {
          this.isBelling = true;
          reject(false);
        }
      }, error => {
        console.log(error);
        this.isBelling = true;
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
      // data.bookingDateTime = this.formDateTimeComponent.getFormattedValue().toString();
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
      this.checkBellStatus();

      if(this.profile?.isP && !this._socialService.promosOfUser(this.profileId)) {
        this.fetchPromos();
      }
    });
  }

  checkFollowStatus() {
    if(this.isFollowLoading || !this.user || this.isProfileMyself) {
      return;
    }

    this.isFollowLoading = true;
    const path = 'social/get-follow-status/' + this.profileId;
    this._sharedService.get(path).subscribe((res: IGetFollowStatusResult) => {
      this.isFollowLoading = false;
      this.isFollowing = !!res.data;
    }, error => {
      console.log(error);
      this.isFollowLoading = false;
      this.isFollowing = false;
    });
  }

  checkBellStatus() {
    if(this.isBellLoading || !this.user || this.isProfileMyself) {
      return;
    }

    this.isBellLoading = true;
    const path = 'social/get-bell-status/' + this.profileId;
    this._sharedService.get(path).subscribe((res: IGetBellStatusResult) => {
      this.isBellLoading = false;
      this.isBelling = !!res.data;
    }, error => {
      console.log(error);
      this.isBellLoading = false;
      this.isBelling = false;
    });
  }
}

const profileMenusForProvider: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'service', label: 'Service', relativeLink: 'service', },
  {id: 'feed',    label: 'Posts',    relativeLink: 'feed'},
  {id: 'review',  label: 'Review',  relativeLink: 'review'},
];

const profileMenusForCompany: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'promotion', label: 'Discounts', relativeLink: 'promotion', },
  {id: 'event', label: 'Event', relativeLink: 'event', },
  {id: 'review', label: 'Recommendation', relativeLink: 'review', },
];

const profileMenusForPH: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'feed',    label: 'Posts',    relativeLink: 'feed'},
  {id: 'review',  label: 'Review',  relativeLink: 'review'},
];

interface IProfileMenuItem {
  id: string;
  label: string;
  relativeLink: string;
}
