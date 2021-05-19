import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../shared/services/shared.service';
import { Subscription } from 'rxjs';
import { IAddonPlan } from '../../models/addon-plan';
import { IDefaultPlan } from 'src/app/models/default-plan';
import { slideHorizontalAnimation } from '../../_helpers/animations';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-subscription-plan-product',
  templateUrl: './subscription-plan-product.component.html',
  styleUrls: ['./subscription-plan-product.component.scss'],
  animations: [slideHorizontalAnimation],
})
export class subscriptionPlanProductComponent implements OnInit {

  public isPriceMonthly = true;
  public partnerPlan: IDefaultPlan = null;
  public partnerBasicPlan: IDefaultPlan = null;
  public partnerEnterprisePlan: IDefaultPlan = null;
  public addonPlans: IAddonPlan[] = null;
  public userType = '';

  public couponCode = {};
  public isCouponShown = false;
  public isCouponShrink = false;
  
  public isOnlyFeatureShown: boolean = false;
  public form: FormGroup;
  

  private subscription: Subscription;

  constructor(
    private _sharedService: SharedService,
    private _router: Router,
    private _uService: UniversalService,
    _fb: FormBuilder,
  ) {
    this.form = _fb.group({
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  @HostListener('window:resize') windowResize(){
    this.isOnlyFeatureShown = (window.innerWidth >= 768) ? true : false;
  }

  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }


  async ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Plans for products/services | PromptHealth',
      description: 'Join us to get exposed to clients. You can upload your products photos and also show your promotions.',
      image: 'https://prompthealth.ca/assets/img/hero-subscription-plan-product.png',
      imageType: 'image/png',
      imageAlt: 'PromptHealth',
    });

    this.isOnlyFeatureShown = (window.innerWidth >= 768) ? true : false;

    if(!this._uService.isServer) {
      const user = JSON.parse(this._uService.localStorage.getItem('user'));
      if (user) {
        this.userType = user.roles;
      }
      
      this.couponCode = JSON.parse(this._uService.sessionStorage.getItem('stripe_coupon_code'));
      if (this.couponCode) {
        setTimeout(() => { this.isCouponShown = true; }, 1000);
      }        
    }
    
    const promiseAll = [
      this.getSubscriptionPlan(),
      this.getAddonPlan(),
    ];

    this._sharedService.loader('show');
    Promise.all(promiseAll)
      .then(() => { })
      .catch(err => { console.log(err); })
      .finally(() => {
        this._sharedService.loader('hide');
      });
  }

  onLogout() {
    this._sharedService.logout(false);
    this._router.navigate(['/auth/registration/P']);
  }

  getAddonPlan(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._sharedService.getNoAuth('addonplans/get-all').subscribe((res: any) => {
        if(res.statusCode === 200) {
          const addons = [];
          res.data.forEach((data: IAddonPlan) => {
            if(data.userType.includes('P')) {
              addons.push(data);
            }
          });
          this.addonPlans = addons;
          resolve(true);
        }else{
          this._sharedService.checkAccessToken(res.error);
          reject(res.error);
        }
      }, error => {
        console.log(error);
        reject(error);
      });  
    });
  }

  getSubscriptionPlan(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = 'user/get-plans?userType=P';
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          res.data.forEach((element: IDefaultPlan) => {
            if (element.name == 'Partner Basic') {
              this.partnerBasicPlan = element;
            } else if (element.name == 'Partner Enterprise') {
              this.partnerEnterprisePlan = element;
            }
          });
          resolve(true);
        } else {
          this._sharedService.checkAccessToken(res.error);
          reject(res.error);
        }
      }, err => {
        console.log(err);
        reject(err);
      });
    });
  }


  changePriceRange(isMonthly: boolean) { this.isPriceMonthly = isMonthly; }

  expandMessageCoupon() { this.isCouponShrink = false; }
  shrinkMessageCoupon(e: Event) { 
    this.isCouponShrink = true;
    e.stopPropagation(); 
  }


  // public errorForm: string = null;
  // onInputForm(){ if(this.errorForm){ this.errorForm = null; } }

  // submitRegister(){    
  //   var f = this.form.controls;

  //   if(f.firstname.invalid || f.lastname.invalid || (f.email.invalid && f.email.errors.required)){
  //     this.errorForm = 'Please fill all items.';
  //   }else if( f.email.invalid && f.email.errors.email ){
  //     this.errorForm = 'Please input correct email address.';
  //   }else{
  //     this.errorForm = null;
  //   }
    
  //   if(this.errorForm){ return; }
  //   else{
  //     this._spinner.show();
  //     this.subscription = this._sharedService.sendEmailSubscribers(this.form.value).subscribe((res: any) => {
  //       this._spinner.hide();
  //       if (res.statusCode === 200) { this._toastr.success(res.message); } 
  //       else { this._toastr.error(res.error.message); }
  //     },
  //     error => {
  //       this._spinner.hide();
  //       this._toastr.error(error);
  //     });
  //   }
  // }

}
