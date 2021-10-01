import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { ProfileManagementService } from '../../dashboard/profileManagement/profile-management.service';
import { ToastrService } from 'ngx-toastr';
import { StripeService } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { IStripeCheckoutData } from 'src/app/models/stripe-checkout-data';
import { IUserDetail } from 'src/app/models/user-detail';
import { IDefaultPlan } from 'src/app/models/default-plan';
import { UniversalService } from '../services/universal.service';

@Component({
  selector: 'subscription-plan-item-card',
  templateUrl: './subscription-plan-item-card.component.html',
  styleUrls: ['./subscription-plan-item-card.component.scss']
})
export class SubscriptionPlanItemCardComponent implements OnInit {

  @Input() theme: 'green' | 'blue' | 'red' = 'green';
  @Input() type: string; /* basic | provider | centre | partnerBasic | partnerEnterprise*/
  @Input() data: IDefaultPlan;
  @Input() hideButton = false;
  @Input() discounted: number = null;
  @Input() showFeatureOnly = false;

  @Input() isPriceMonthly = true;
  @Input() monthly = true;

  @HostBinding('class.theme-red') get red() { return (this.theme == 'red'); }
  @HostBinding('class.theme-blue') get blue() { return (this.theme == 'blue'); }
  @HostBinding('class.theme-green') get green() { return (this.theme == 'green'); }


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
    private _uService: UniversalService,
  ) { }

  async ngOnInit() {
    const ls = this._uService.localStorage;

    switch (this.type) {
      case 'provider': this.color = 'blue'; break;
      case 'centre': this.color = 'red'; break;
      case 'partnerEnterprise': this.color = 'green-bright'; break;
      default: this.color = 'green'; break;
    }
    // this.color = this.type === 'provider' ? 'blue' : this.type === 'centre' ? 'red' : 'green';
    this.isPlanForPartner = (this.type.toLowerCase().match(/partner/)) ? true : false;

    switch (this.type) {
      case 'partnerBasic': this.title = 'Product/Service'; break;
      case 'partnerEnterprise': this.title = 'Enterprise'; break;
      case 'basic': this.title = 'Basic'; break;
      case 'provider': this.title = 'Professional'; break;
      case 'centre': this.title = 'Centre'; break;
      default: this.title = this.type;
    }

    if (!this._uService.isServer && ls.getItem('token')) {
      this.isLoggedIn = true;
      this.profile = JSON.parse(ls.getItem('user'));
      // this.profile = await this._profileService.getProfileDetail(this.profile);
    } else {
      this.profile = null;
    }
  }

  get priceOriginal() {
    let price = 0;
    if (!!this.discounted && this.discounted > 0 && this.data) {
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
          if (this.data.price && this.monthly) {
            price = this.data.price;
          } else if (this.data.yearlyPrice && !this.monthly) {
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
        link.push('p');
        break;
    }
    return link;
  }

  onClickSignup() {
    this._uService.sessionStorage.setItem('selectedPlan', JSON.stringify(this.data));
    this._uService.sessionStorage.setItem('selectedMonthly', this.monthly.toString());
  }

  async onClickCheckout() {
    if (this.profile.roles == 'U') {
      this._toastr.error('You don\'t need to buy this plan');
    } else {
      this._sharedService.loader('show');

      try {
        const result = await this._sharedService.checkoutPlan(this.profile, this.data, 'default', this.monthly);
        this._toastr.success(result.message);
        switch (result.nextAction) {
          case 'complete':
            this._router.navigate(['/dashboard/register-product/complete']);
            break;
          case 'stripe':
            // automatically redirect to stripe. nothing to do.
            break;
        }
      } catch (error) {
        this._toastr.error(error);
      } finally {
        this._sharedService.loader('hide');
      }
    }
  }
}
