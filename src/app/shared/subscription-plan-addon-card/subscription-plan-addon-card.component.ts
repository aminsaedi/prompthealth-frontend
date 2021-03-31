import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IAddonPlan } from '../../models/addon-plan';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileManagementService } from '../../dashboard/profileManagement/profile-management.service'
import { AddonSelectCategoryComponent } from '../../dashboard/addon-select-category/addon-select-category.component';
import { Category, CategoryService } from '../services/category.service';
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
  @Input() flexibleButtonPosition = true;

  public isLoggedIn = false;
  public profile: IUserDetail;

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

  get tabName() {
    let name = '';

    if (this.data) {
      if(this.data.price && this.monthly){
        const price = this.data.price;
        name = '$' + this.data.price + '/Monthly';
      }else if(this.data.yearlyPrice && !this.monthly){
        const price = this.data.yearlyPrice;
        name = '$' + price + '/Yearly';
      }
    }
    return name;
  }

  get linkToRegistration() {
    const link = ['/auth', 'registration'];
    if(this.data.userType.includes('P')){
      link.push('p');
    }else{
      /**todo: have to add c. but how? */
      link.push('sp');
    }
    return link;
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
    const payload: IStripeCheckoutData = {
      cancel_url: location.href,
      success_url: location.origin + '/dashboard/profilemanagement/my-subscription',
      userId: this.profile._id,
      userType: this.profile.roles,
      email: this.profile.email,
      plan: this.data,
      isMonthly: this.monthly,
      type: 'addon',
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
