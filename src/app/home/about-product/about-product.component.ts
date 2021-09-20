import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ICouponData } from 'src/app/models/coupon-data';
import { IPlanData, IPlanFeatureData, PlanTypeProduct } from 'src/app/models/default-plan';
import { IGetPlansResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { slideHorizontalAnimation } from 'src/app/_helpers/animations';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';

@Component({
  selector: 'app-about-product',
  templateUrl: './about-product.component.html',
  styleUrls: ['./about-product.component.scss'],
  animations: [slideHorizontalAnimation],
})
export class AboutProductComponent implements OnInit {

  get user() { return this._profileService.user; }

  public features = features;
  public plans = plans;
  public planFeatures = planFeatures;
  public faqs = faqs;

  public isDurationMonthly: boolean = false;
  public isLoading: boolean = false;

  public couponData: ICouponData = null;
  public isCouponShown = false;
  public isCouponShrink = false;

  keepOriginalOrder = (a: any, b: any) => a.key;

  isFeatureShowable(i: number, planType: PlanTypeProduct) {
    return this.planFeatures[i].targetPlan.indexOf(planType) === 0; 
  }

  constructor(
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.initPlans();
    this.initCoupon();
  }

  initPlans() {
    const path = 'user/get-plans';
    this._sharedService.getNoAuth(path).subscribe((res: IGetPlansResult) => {
      if(res.statusCode == 200) {
        res.data.forEach(d => {
          if (d.userType.includes('P')) {
            if(d.planName == 'Product/Service'){
              this.plans.productBasic.data = d;
            } else if (d.planName == 'Enterprise') {
              this.plans.productAdvanced.data = d;
            }
          }
        });
      }
    });
  }

  initCoupon() {
    const coupon = this._uService.sessionStorage.getItem('stripe_coupon_code');
    if(coupon) {
      this.couponData = JSON.parse(coupon);
      const isCouponApplicable = this._sharedService.isCouponApplicableTo(this.couponData, 'P');

      if(isCouponApplicable) {
        setTimeout(() => { 
          this.isCouponShown = true; 
        }, 1000);
      }
    }
  }

  onChangeDuration(state: 'on' | 'off') {
    this.isDurationMonthly = (state == 'on') ? true : false;
  }

  scrollTo(el: HTMLElement) {
    if(el && window) {
      const top = window.scrollY + el.getBoundingClientRect().top;
      smoothWindowScrollTo(top);
    }
  }

  expandCoupon() { 
    this.isCouponShrink = false; 
  }

  shrinkCoupon(e: Event) {
    this.isCouponShrink = true;
    e.stopPropagation();
  }
  
  onClickSignup(type: PlanTypeProduct) {
    this._uService.sessionStorage.setItem('selectedPlan', JSON.stringify(this.plans[type].data));
    this._uService.sessionStorage.setItem('selectedMonthly', this.isDurationMonthly.toString());

    const link = ['/auth', 'registration', 'p'];
    this._router.navigate(link);
  }

  async onClickCheckout(type: PlanTypeProduct) {
    if (this.user.roles == 'U') {
      this._toastr.error('You don\'t need to buy this plan');
    } else {

      this.isLoading = true;
      try {
        const result = await this._sharedService.checkoutPlan(
          this.user, 
          this.plans[type].data, 
          'default', 
          this.isDurationMonthly
        );
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
        this.isLoading = false;
      }
    }
  }
}


const features = [
  {
    icon: 'camera',
    title: 'Attract new patients. Showcase your practice',
    content: 'Attract new patients. Showcase your practice',
  },
  {
    icon: 'camera',
    title: 'Attract new patients. Showcase your practice',
    content: 'Attract new patients. Showcase your practice',
  },
  {
    icon: 'camera',
    title: 'Attract new patients. Showcase your practice',
    content: 'Attract new patients. Showcase your practice',
  },
  {
    icon: 'camera',
    title: 'Attract new patients. Showcase your practice',
    content: 'Attract new patients. Showcase your practice',
  },
  {
    icon: 'camera',
    title: 'Attract new patients. Showcase your practice',
    content: 'Attract new patients. Showcase your practice',
  },
  {
    icon: 'camera',
    title: 'Attract new patients. Showcase your practice',
    content: 'Attract new patients. Showcase your practice',
  },
]

const plans: {[k in PlanTypeProduct]: IPlanData} = {
  productBasic: {
    id: 'basic',
    icon: 'file',
    title: 'Basic',
    subtitle: 'For individual use',
    label: null,
    data: null,
  },
  productAdvanced: {
    id: 'advanced',
    icon: 'briefcase-2',
    title: 'Advanced',
    subtitle: 'For advanced use',
    label: 'Popular',
    data: null,
  },
}

const planFeatures: IPlanFeatureData[] = [
  {item: 'Your professional profile', targetPlan: ['basic', 'provider', 'centre'], detail: 'explain yourself here.'},

  {item: 'Differentiate yourself with side-by-side comparisons', targetPlan: ['provider', 'centre'], detail: 'explain yourself here.'},
  {item: 'Showcase yourself with a video introduction', targetPlan: ['provider', 'centre'], detail: 'explain yourself here.'},
  {item: 'Genuine reviews and feedback', targetPlan: ['provider', 'centre'], detail: 'explain yourself here.'},
  {item: 'Receive requests for booking /integration with your own booking system option', targetPlan: ['provider', 'centre'], detail: 'explain yourself here.'},
  {item: 'Performance dashboard', targetPlan: ['provider', 'centre'], detail: 'explain yourself here.'},
  {item: 'Link your social media accounts on your Prompthealth profile page', targetPlan: ['provider', 'centre'], detail: 'explain yourself here.'},
  {item: 'Apply for a verified badge and rank before everyone else in search results', targetPlan: ['provider', 'centre'], detail: 'explain yourself here.'},
  {item: 'Exciting features & benefits coming every month', targetPlan: ['provider', 'centre'], detail: 'explain yourself here.'},

  {item: 'List special amenities', targetPlan: ['centre'], detail: 'explain yourself here.'},
  {item: 'List of providers', targetPlan: ['centre'], detail: 'explain yourself here.'},
  {item: 'Link your google business profile and display your google reviews on your profile page', targetPlan: ['centre'], detail: 'explain yourself here.'},
  {item: 'Exciting features & benefits coming every month', targetPlan: ['centre'], detail: 'explain yourself here.'},
];

const faqs: IFAQItem[] = [
  {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
  {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
  {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
  {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
]

