import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { Professional } from 'src/app/models/professional';
import { ICreateReferralsResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-new-referral',
  templateUrl: './new-referral.component.html',
  styleUrls: ['./new-referral.component.scss']
})
export class NewReferralComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get profile() { return this._socialService.selectedProfile; }

  get isRecommend() { return this.referralType == 'recommend'; }
  get isReview() { return this.referralType == 'review'; }

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload(e: BeforeUnloadEvent) {
    if(this.isLocked) {
      e.returnValue = true;
    }
  }

  public referralMaxLength = minmax.referralMax;
  public form: FormControl;
  public isSubmitted: boolean = false;
  public isUploading: boolean = false;

  public isLocked = true;

  constructor(
    private _route: ActivatedRoute,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _socialService: SocialService,
    private _location: Location,
    private _router: Router,
    private _toastr: ToastrService,
  ) { }


  private referralType: ReferralType;
  private subscriptionLoginStatus: Subscription;

  ngOnDestroy() {
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.observeLoginStatus();

    this.form = new FormControl('', validators.referral);

    this._route.data.subscribe((data: {type: ReferralType}) => {
      this.form.setValue('');
      this.referralType = data.type;
    });
  }

  goback() {
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1) {
      this._router.navigate(['../'], {relativeTo: this._route});
    } else {
      this._location.back();
    }
  }

  observeLoginStatus() {
    this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe(res => {
      if(res == 'notLoggedIn') {
        this.isLocked = false;
        this._router.navigate(['../'], {replaceUrl: true, relativeTo: this._route});
      }
    });
  }

  publish() {
    this.isSubmitted = true;
    if(this.form.invalid) {
      return
    }

    const payload = {
      type: this.referralType,
      to: this.profile._id,
      body: this.form.value,
      ...(this.referralType == 'review') && {rating: 0},
    }

    this.isUploading = true;
    this._sharedService.post(payload, 'referral/create').subscribe((res: ICreateReferralsResult) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this.isSubmitted = false;
        this.isLocked = false;
        this.goback();
      } else {  
        this._toastr.error(res.message);
      }
    }, error => {
      console.log(error);
      this.isUploading = false;
      this._toastr.error('Something went wrong. Please try again later');
    });
  }
}

type ReferralType = 'review' | 'recommend'