import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ICouponData } from 'src/app/models/coupon-data';
import { IPlanData, IPlanFeatureData, PlanTypePractitioner } from 'src/app/models/default-plan';
import { IGetPlansResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { expandVerticalAnimation, slideHorizontalAnimation } from 'src/app/_helpers/animations';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';

@Component({
  selector: 'app-about-practitioner',
  templateUrl: './about-practitioner.component.html',
  styleUrls: ['./about-practitioner.component.scss'],
  animations: [expandVerticalAnimation, slideHorizontalAnimation],
})
export class AboutPractitionerComponent implements OnInit {

  get profile() { return this._profileService.user; }
  get isNotLoggedIn() { return this._profileService.loginStatus == 'notLoggedIn'; }
  get isLoggedIn() { return this._profileService.loginStatus == 'loggedIn'; }

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

  isFeatureShowable(i: number, planType: PlanTypePractitioner) {
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
    this._uService.setMeta(this._router.url, {
      title: 'Reach more new patients and grow your practice with PromptHealth',
      description: 'PromptHealth helps providers reach more new patients for in-person visits, video visits or both.',
    });

    this.initPlans();
    this.initCoupon();
  }

  initPlans() {
    const path = 'user/get-plans';
    this._sharedService.getNoAuth(path).subscribe((res: IGetPlansResult) => {
      if(res.statusCode == 200) {
        res.data.forEach(d => {
          if (d.userType.includes('P')) {
            //nothing to do
          } else if (d.userType.length == 2) {
            this.plans.basic.data = d;
          } else if (d.userType.includes('SP')) {
            this.plans.provider.data = d;
          } else if (d.userType.includes('C')) {
            this.plans.centre.data = d;
          }
        });
      }
    });
  }

  initCoupon() {
    const coupon = this._uService.sessionStorage.getItem('stripe_coupon_code');
    if(coupon) {
      this.couponData = JSON.parse(coupon);
      let isCouponApplicable = false;
      for (let role of ['SP', 'C']) {
        if(this._sharedService.isCouponApplicableTo(this.couponData, role)) {
          isCouponApplicable = true;
        }
      }

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
  
  onClickSignup(type: PlanTypePractitioner) {
    const link = ['/auth', 'registration'];
    switch (type) {
      case 'basic':
      case 'provider':
        link.push('sp');
        break;

      case 'centre':
        link.push('c');
        break;
    }
    this._uService.sessionStorage.setItem('selectedPlan', JSON.stringify(this.plans[type].data));
    this._uService.sessionStorage.setItem('selectedMonthly', this.isDurationMonthly.toString());

    this._router.navigate(link);
  }

  async onClickCheckout(type: PlanTypePractitioner) {
    if (this.profile.roles == 'U') {
      this._toastr.error('You don\'t need to buy this plan');
    } else {

      this.isLoading = true;
      try {
        const result = await this._sharedService.checkoutPlan(
          this.profile, 
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
    icon: 'lightning-outline',
    title: 'Simple to use and time-saving.',
    content: 'We are creating a space where health and wellness experts can lead the conversation around the topics they are experts in. Instead of spending time building your credibility online, let them come to you on PromptHealth and focus on what you do best.',
  },
  {
    icon: 'text-block-outline',
    title: 'Choose a content creation option that works best for you.',
    content: 'Easy to use content creation tools made for busy health practitioners. Share using the medium that suits you best. Whether it’s through voice notes, videos, articles, or online events, we made it easy for health providers to create and share.',
  },
  {
    icon: 'user-check-outline',
    title: 'Share information on topics you are an expert in.',
    content: 'Health misinformation online is a huge problem today. We are serious about making sure those providing health information are accredited and trusted. We prioritize verifying our providers to remain a credible and helpful health resource for the public.',
  },
  {
    icon: 'cast-outline',
    title: 'Connect with clients.',
    content: 'Find clients, share details about the services you offer and how you can help, and accept bookings all in one platform. ',
  },
  {
    icon: 'thumbs-up-outline',
    title: 'Engage with the health and wellness community.',
    content: 'Be part of our community. Stay engaged with new and current clients, and other practitioners in your area. ',
  },
  {
    icon: 'verified-outline',
    title: 'Recommend other health professionals you trust.',
    content: 'Think your clients will benefit from a different treatment, or do you know another provider you trust? Find and leave recommendations for other practitioners. ',
  },
]

const plans: {[k in PlanTypePractitioner]: IPlanData} = {
  basic: {
    id: 'basic',
    icon: 'note-text-outline',
    title: 'Basic',
    subtitle: 'For individual use',
    label: null,
    data: null,
  },
  provider: {
    id: 'provider',
    icon: 'verified-outline',
    title: 'Providers',
    subtitle: 'For profiessional use',
    label: 'Popular',
    data: null,
  },
  centre: {
    id: 'centre',
    icon: 'users-outline',
    title: 'Centre',
    subtitle: 'For multiple use',
    label: null,
    data: null,
  }
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
