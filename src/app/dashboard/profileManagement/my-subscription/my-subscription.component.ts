import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-my-subscription',
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.scss']
})
export class MySubscriptionComponent implements OnInit {
  public defaultPlan;
  public addOnPlans = {};
  constructor(
    private sharedService: SharedService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getProfileDetails();
  }
  getProfileDetails() {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const path = `user/get-profile/${userInfo._id}`;
    this.sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.defaultPlan = res.data[0].plan;
        this.addOnPlans = res.data[0].addOnPlans;
        console.log(this.addOnPlans);
      } else {
        this.sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this.sharedService.checkAccessToken(err);
    });
  }

  manageBilling() {
    const payload = {
      return_url: location.href,
      userId: localStorage.getItem('loginID'),
      userType: localStorage.getItem('roles'),
      email: JSON.parse(localStorage.getItem('user')).email,
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
