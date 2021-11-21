import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { ProfileManagementService } from '../../../shared/services/profile-management.service';
import { IUserDetail } from '../../../models/user-detail';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-my-subscription',
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.scss']
})
export class MySubscriptionComponent implements OnInit {
  private profile: IUserDetail;
  public defaultPlan;
  public addOnPlans = {};
  public userRole: string;
  constructor(
    private sharedService: SharedService,
    private toastr: ToastrService,
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  async ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Manage subscription | PromptHealth',
    });

    const user = JSON.parse(localStorage.getItem('user'));
    this.profile = await this._profileService.getProfileDetail(user);
    this.addOnPlans = this.profile.addOnPlans;
    this.defaultPlan = this.profile.plan;
    this.userRole = this.profile.roles;
    // this.getProfileDetails();
  }
  // getProfileDetails() {
  //   const userInfo = JSON.parse(localStorage.getItem('user'));
  //   const path = `user/get-profile/${userInfo._id}`;
  //   this.sharedService.get(path).subscribe((res: any) => {
  //     if (res.statusCode === 200) {
  //       this.defaultPlan = res.data[0].plan;
  //       this.addOnPlans = res.data[0].addOnPlans;
  //       console.log(this.addOnPlans);
  //     } else {
  //       this.sharedService.checkAccessToken(res.message);
  //     }
  //   }, err => {

  //     this.sharedService.checkAccessToken(err);
  //   });
  // }

  manageBilling() {
    const payload = {
      return_url: location.href,
      userId: this.profile._id,
      userType: this.profile.roles,
      email: this.profile.email,
    };
    const path = `user/customer-portal`;
    this.sharedService.post(payload, path).subscribe((res: any) => {
      console.log('there we go');
      if (res.statusCode === 200) {
        this.toastr.success('Waiting for Stripe...');
        // this.closebutton.nativeElement.click();
        // console.log(environment.config.stripeKey);
        console.log(res);
        if (res.data.type === 'portal') {
          console.log(res.data);
          location.href = res.data.url;
        }
      } else {
        this.toastr.error(res.message, 'Error');
      }

      this.sharedService.loader('hide');
    }, (error) => {
      this.toastr.error(error);
      this.sharedService.loader('hide');
    });
  }
}
