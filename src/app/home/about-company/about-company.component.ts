import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
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
  selector: 'app-about-company',
  templateUrl: './about-company.component.html',
  styleUrls: ['./about-company.component.scss'],
  animations: [slideHorizontalAnimation],
})
export class AboutCompanyComponent implements OnInit {

  get user() { return this._profileService.user; }

  public features = features;
  public plans = plans;
  public planFeatures = planFeatures;
  public faqs = faqs;

  public isDurationMonthly: boolean = true;
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
    private _route: ActivatedRoute,
    private _el: ElementRef,
  ) { }

  ngAfterViewInit() {
    this._route.fragment.pipe( first() ).subscribe(fragment => {
      const el: HTMLElement = this._el.nativeElement.querySelector('#' + fragment);
      if(el) {
        setTimeout(() => {
          const top = el.getBoundingClientRect().top;
          smoothWindowScrollTo(top);  
        }, 300); 
      }
    });
  }

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
            } 
            // else if (d.planName == 'Enterprise') {
            //   this.plans.productAdvanced.data = d;
            // }
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
    icon: 'users-outline',
    title: 'Reach a new audience.',
    content: 'Display your brand to people actively seeking wellness solutions and those providing them, as they will receive a notification everytime a new company is created.',
  },
  {
    icon: 'verified-outline',
    title: 'Expert recommendations.',
    content: 'Receive endorsements from vetted wellness providers that love what you’re doing to boost credibility as a wellness brand.',
  },
  {
    icon: 'bell-outline',
    title: 'Alert users of your promotions or events.',
    content: 'Notifications are pushed to both health seekers and providers every time you create personalized offers such as discounts or sales as well as custom events such as summits, webinars and courses.',
  },
]

const plans: {[k in PlanTypeProduct]: IPlanData} = {
  productBasic: {
    id: 'basic',
    icon: 'shopping-bag-outline',
    title: 'Basic',
    subtitle: '',
    label: null,
    data: null,
  },
  productCustom: {
    id:'custom',
    icon: 'rocket-outline',
    title: 'Custom',
    subtitle: '',
    label: null,
    data: null,
  }
  // productAdvanced: {
  //   id: 'advanced',
  //   icon: 'briefcase-2',
  //   title: 'Advanced',
  //   subtitle: 'For advanced use',
  //   label: 'Popular',
  //   data: null,
  // },
}

const planFeatures: IPlanFeatureData[] = [
  {item: 'Create a personalized profile', targetPlan: ['productBasic'], detail: 'explain yourself here.'},
  {item: 'Create dynamic discounts and send notifications to wellness seekers and providers about new promotions', targetPlan: ['productBasic'], detail: 'explain yourself here.'},
  {item: 'Create events and send notifications to wellness seekers and providers about your upcoming summit, course or webinar', targetPlan: ['productBasic'], detail: 'explain yourself here.'},
  {item: 'Receive recommendations and endorsement from wellness providers', targetPlan: ['productBasic'], detail: 'explain yourself here.'},

  {item: 'Promotion on side panels of our social feed for custom duration of time', targetPlan: ['productCustom'], detail: null},
  {item: 'Promotion on our social channels and podcast', targetPlan: ['productCustom'], detail: null},
  {item: 'Promotion via monthly internal newsletter', targetPlan: ['productCustom'], detail: null},
];

const faqs: IFAQItem[] = [
  {q: 'What is PromptHealth and why should I be involved?', a: 'PromptHealth is an online platform revolutionizing the health and wellness experience. We have created an ecosystem where wellness seekers can learn directly from the providers and get connected with them based on areas of interest. Wellness companies can also get displayed in front of the wellness seekers and providers based on different categories.', opened: false},
  {q: 'What is known as a wellness company?', a: 'Brands in wellness which are not necessarily offered  by a wellness provider. It can range from Apps, products, services and resources that have an offering in one or more of the categories listed on PromptHealth.', opened: false,},
  {q: 'What do I get with my standard membership?', a: 'You get a profile with a description of your company and can upload pictures. You can promote any upcoming offers or events to inform the PromptHealth community with push notifications. You can also receive recommendations and endorsements from the wellness providers to gain more credibility. They can share your offering on their feeds as well.', opened: false},
  {q: 'What is the cost to join PromptHealth?', a: 'The standard profile for wellness companies costs $200/month with 20% discount for the yearly membership. There is an add-on option where we can promote your brand further on a custom base as required by you with ads on our social feed, on our different social media channels and newsletter. Details and features can be found on the pricing page.', opened: false},
  {q: 'How do I get listed?', a: 'After signing up by email, or by connecting your Facebook or Google account, you will be asked a series of questions to help us understand your background and specialities. This allows us to ensure you are listed under all of our relevant categories, and will show up when a user is searching for solutions to a particular concern.', opened: false},
  {q: 'How do I create an account?', a: 'Creating an account is easy. Click the “sign-up” link on our site, and follow the steps shown. When creating an account, please ensure that you fill out all requested information, as it helps create the perfect profile for new clients to find and book sessions with you. Our team DOES NOT approve profiles that are partially filled out, as this does not ensure you are placed in the correct category in our search. We expect you to follow the guidelines provided to upload a professional picture and only select modalities that you are certified in, in order to get the most suitable client match.', opened: false},
  {q: 'Will I be able to receive reviews and recommendations?', a: 'You are able to connect any existing Google reviews to your profile to gain credibility right away.<br><br>In addition, we are the first online platform that makes it possible for the wellness providers to endorse you by leaving recommendations for you and to share your offerings on their social., which allows your brand to gain more trust and credibility.', opened: false},
  {q: 'How do I deactivate or delete my account?', a: 'You can contact the admin at <a href="mailto:info@prompthealth.ca">info@prompthealth.ca</a>', opened: false},
  {q: 'Is there a verification process?', a: 'Before we approve a listing, we ensure to complete an audit and do a background check to ensure the accuracy of information provided by a health and wellness provider. This is a qualitative review at this time.', opened: false},
]

