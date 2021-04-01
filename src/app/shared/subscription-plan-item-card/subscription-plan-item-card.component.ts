import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { ProfileManagementService } from '../../dashboard/profileManagement/profile-management.service'
import { ToastrService } from 'ngx-toastr';
import { StripeService } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { IStripeCheckoutData } from 'src/app/models/stripe-checkout-data';
import { IUserDetail } from 'src/app/models/user-detail';
import { IDefaultPlan } from 'src/app/models/default-plan';

@Component({
  selector: 'subscription-plan-item-card',
  templateUrl: './subscription-plan-item-card.component.html',
  styleUrls: ['./subscription-plan-item-card.component.scss']
})
export class SubscriptionPlanItemCardComponent implements OnInit {

  @Input() type: string; /* basic | provider | centre | partnerBasic | partnerEnterprise*/
  @Input() data: IDefaultPlan;
  @Input() hideButton = false;
  @Input() discounted: number = null;

  @Input() isPriceMonthly = true;
  @Input() monthly = true;


  public color: string;
  public title: string;
  public features: string[];
  public isLoggedIn = false;
  public profile: IUserDetail;
  public isPlanForPartner: boolean;


  constructor(
    private _router: Router,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _stripeService: StripeService,
  ) { }


  async ngOnInit() {
    this.color = this.type === 'provider' ? 'blue' : this.type === 'centre' ? 'red' : 'green';
    this.isPlanForPartner = (this.type.toLowerCase().match(/partner/)) ? true : false;

    switch(this.type){
      case 'partnerBasic' : this.title = 'Product/Service'; break;
      case 'partnerEnterprise' : this.title = 'Enterprise'; break;
      case 'basic' : this.title = 'Basic'; break;
      case 'provider' : this.title = 'Provider'; break;
      case 'centre' : this.title = 'Centre'; break;
      default: this.title = this.type;
    }

    if (localStorage.getItem('token')) { 
      this.isLoggedIn = true;
      const user = JSON.parse(localStorage.getItem('user'));
      this.profile = await this._profileService.getProfileDetail(user);
    }
  }

  get priceOriginal() {
    let price = 0;
    if(!!this.discounted && this.discounted > 0 && this.data){
      price = (this.monthly ? this.data.price : this.data.yearlyPrice) / (100 - this.discounted) * 100;
    }
    return price;
  }

  get price() {
    let price = 0;
    switch (this.type) {
      case 'basic': 
        price = 0;
        break;
      default: 
        if (this.data) {
          if(this.data.price && this.monthly){
            price = this.data.price;
          }else if(this.data.yearlyPrice && !this.monthly){
            price = this.data.yearlyPrice;
          }
        }
    }
    return price;
  }

  get linkToRegistration() {
    const link = ['/auth', 'registration'];
    switch (this.type) {
      case 'basic':
      case 'provider':
        link.push('sp');
        break;

      case 'centre':
        link.push('c');
        break;

      case 'partnerBasic':
      case 'partnerEnterprise':
        link.push('p')
        break;
    }
    return link;

  }

  triggerButtonClick() { 
    if(this.profile.roles == 'U'){
      this._toastr.error('You don\'t need to buy this plan');  
    }
    else if(this.type == 'basic'){
      this.checkoutFreePlan();
    }
    else{
      this.checkoutDefaultPlan();
    }
  }

  checkoutFreePlan(){
    const payload = {
      _id: this.profile._id,
      plan: this.data
    }
    this._sharedService.post(payload, 'user/updateProfile').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this._toastr.success(res.message);
        this._router.navigate(['/dashboard/profilemanagement/my-subscription']);
      } else {
        this._toastr.error(res.message);
      }
    }, err => {
      console.log(err);
      this._toastr.error('There are some errors, please try again after some time !', 'Error');
    });
  }

  checkoutDefaultPlan(){
    const payload: IStripeCheckoutData = {
      cancel_url: location.href,
      success_url: location.origin + '/dashboard/profilemanagement/my-subscription',
      userId: this.profile._id,
      userType: this.profile.roles,
      email: this.profile.email,
      plan: this.data,
      isMonthly: this.monthly,
      type: 'default',
    };
    this.stripeCheckout(payload);
  }

  stripeCheckout(payload: IStripeCheckoutData) {
    const path = `user/checkoutSession`;
    this._sharedService.loader('show');
    this._sharedService.post(payload, path).subscribe((res: any) => {
      console.log('there we go');
      if (res.statusCode === 200) {
        console.log(res);
        this._stripeService.changeKey(environment.config.stripeKey);

        if (res.data.type === 'checkout') {
          this._toastr.success('Checking out...');

          this._stripeService.redirectToCheckout({ sessionId: res.data.sessionId }).subscribe(stripeResult => {
            console.log('success!');
          }, error => {
            this._toastr.error(error);
            console.log(error);
          });
        }
        if (res.data.type === 'portal') {
          this._toastr.success('You already have this plan. Redirecting to billing portal');
          console.log(res.data);
          location.href = res.data.url;
        }


      } else {
        this._toastr.error(res.message, 'Error');
      }

      this._sharedService.loader('hide');
    }, (error) => {
      this._toastr.error(error);
      this._sharedService.loader('hide');
    });
  }
}
