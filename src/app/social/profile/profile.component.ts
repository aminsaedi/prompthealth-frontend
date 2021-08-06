import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';;
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { Professional } from 'src/app/models/professional';
import { Profile } from 'src/app/models/profile';
import { IGetProfileResult } from 'src/app/models/response-data';
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

  public profileId: string;
  public profile: Professional;
  public user: Profile;

  public questionnaires: QuestionnaireMapProfilePractitioner;

  private formBooking: FormGroup;
  public submittedFormBooking = false;
  public minDateTime: DateTimeData;
  public maxBookingNote = minmax.bookingNoteMax;

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
      this.initProfile();
    });
  }

  initProfile() {
    this._socialService.disposeProfile();
    const profile = this._socialService.profileOf(this.profileId);
    if(profile) {
      this.profile = profile;
      this._socialService.setProfile(this.profile);
    } else {
      const promiseAll: [Promise<Professional>, Promise<QuestionnaireMapProfilePractitioner>] = [
        this.fetchProfile(this.profileId),
        this.getQuestionnaire(),
      ];

      Promise.all(promiseAll).then((vals) => {
        this.profile = vals[0];
        this.questionnaires = vals[1];
        this._socialService.setProfile(this.profile);
      }, error => {
        this._toastr.error('Something went wrong.');
      });
    }
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
          const p = res.data[0];
          const professional = new Professional(p._id, p);
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

  onClickBook() {
    if(this.user) {
      this._modalService.show('booking');
    } else {
      this._modalService.show('login-menu');
    }
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
    this.user = this._profileService.profile;
    this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe(() => {
      this.user = this._profileService.profile;
    });
  }

}
