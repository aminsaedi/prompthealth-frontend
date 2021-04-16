import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { IAddonPlan } from '../../models/addon-plan';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileManagementService } from '../../dashboard/profileManagement/profile-management.service';
import { AddonSelectCategoryComponent } from '../../dashboard/addon-select-category/addon-select-category.component';
import { CategoryService } from '../services/category.service';
import { SharedService } from '../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { StripeService } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { IStripeCheckoutData } from 'src/app/models/stripe-checkout-data';
import { IUserDetail } from 'src/app/models/user-detail';


@Component({
  selector: 'subscription-plan-addon-card',
  templateUrl: './subscription-plan-addon-card.component.html',
  styleUrls: ['./subscription-plan-addon-card.component.scss']
})
export class SubscriptionPlanAddonCardComponent implements OnInit {

  @Input() data: IAddonPlan;
  @Input() monthly = true;
  @Input() theme: 'lightpink' | 'lightblue' = 'lightpink';
  @Input() flexibleButtonPosition = true;

  @HostBinding('class.theme-lightpink') get lightpink() { return (this.theme == 'lightpink'); }
  @HostBinding('class.theme-lightblue') get lightblue() { return (this.theme == 'lightblue'); }

  public isLoggedIn = false;
  public profile: IUserDetail;

  get subtitle(): string {
    let s: string = null;
    if (this.data) {
      switch (this.data.name) {
        case 'The Networker': s = 'Be seen first. No work required.'; break;
        case 'The Socialite': s = 'Do what you do best. We’ll take care of the rest.'; break;
      }
    }
    return s;
  }

  get summary(): string {
    let s: string = null;
    if (this.data) {
      switch (this.data.name) {
        case 'The Networker':
          s = 'A higher tier of visibility. Be the first thing all clients see on PromptHealth.';
          break;
        case 'The Socialite':
          s = 'We’ll take care of the rest. Focus on what’s important – treating your clients. Let us take care of your recognition and growth.';
          break;
      }
    }
    return s;
  }

  get descriptionArray(): string[] {
    const descriptionArray: string[] = [];
    if (this.data.name == 'The Socialite') {
      this.data.description = `Health content creation and management
      - We design, schedule, and post strategic, quality content directly to your social media accounts. (3 posts weekly and 1 video or podcast yearly)`;
    }
    if (this.data) {
      const descArray = this.data.description.split('\n');
      descArray.forEach((d, i) => {
        if (d.trim().match(/^-/)) {
          descriptionArray[descriptionArray.length - 1] = descriptionArray[descriptionArray.length - 1] + d.trim().replace(/^\s*\-\s*/, '\n');
        } else {
          descriptionArray.push(d.trim());
        }
      });
    }
    return descriptionArray;
  }

  get tabName(): string {
    let name = '';

    if (this.data) {
      if (this.data.price && this.monthly) {
        const price = this.data.price;
        name = '$' + this.data.price + '/Monthly';
      } else if (this.data.yearlyPrice && !this.monthly) {
        const price = this.data.yearlyPrice;
        name = '$' + price + '/Yearly';
      }
    }
    return name;
  }

  get linkToRegistration(): string[] {
    const link = ['/auth', 'registration'];
    if (this.data.userType.includes('P')) {
      link.push('p');
    } else {
      /* todo: have to add c. but how? */
      link.push('sp');
    }
    return link;
  }

  constructor(
    private _profileService: ProfileManagementService,
    private _modalService: NgbModal,
    private _catService: CategoryService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _stripeService: StripeService,
  ) { }

  async ngOnInit() {
    if (localStorage.getItem('token')) {
      this.isLoggedIn = true;
      const user = JSON.parse(localStorage.getItem('user'));
      this.profile = await this._profileService.getProfileDetail(user);
    }
  }

  async triggerButtonClick() {

    if (this.data.name === 'The Networker') {
      const cat = await this._catService.getCategoryAsync();

      const modalRef = this._modalService.open(AddonSelectCategoryComponent, {
        centered: true
      });

      modalRef.componentInstance.categories = cat;
      // this._changeDetector.markForCheck();
      modalRef.result.then(res => {
        const metadata = this._catService.categoryList[res];
        delete metadata.subCategory;
        metadata.userType = this.data.userType;
        this.checkoutAddonPlan(metadata);
      }).catch(error => {
        console.log(error);
      });
    } else {
      this.checkoutAddonPlan();
    }
  }

  checkoutAddonPlan(metadata = {}) {
    const savedCoupon = JSON.parse(sessionStorage.getItem('stripe_coupon_code'));

    const payload: IStripeCheckoutData = {
      cancel_url: location.href,
      success_url: location.origin + '/dashboard/profilemanagement/my-subscription',
      userId: this.profile._id,
      userType: this.profile.roles,
      email: this.profile.email,
      plan: this.data,
      isMonthly: this.monthly,
      type: 'addon',
      coupon: savedCoupon.id,
      metadata
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
