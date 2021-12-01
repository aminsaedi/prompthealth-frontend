import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ICouponData } from 'src/app/models/coupon-data';
import { IPlanData, IPlanFeatureData, PlanTypeProduct } from 'src/app/models/default-plan';
import { IGetPlansResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { slideHorizontalAnimation } from 'src/app/_helpers/animations';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';
import { environment } from 'src/environments/environment';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';
import { RegionService } from 'src/app/shared/services/region.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-about-company',
  templateUrl: './about-company.component.html',
  styleUrls: ['./about-company.component.scss'],
  animations: [slideHorizontalAnimation],
})
export class AboutCompanyComponent implements OnInit {

  get sizeL() { return window && window.innerWidth >= 992; }
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

  public videoLink = "/assets/video/about-company-sm.mp4";
  public videoLinkLg = '/assets/video/about-company-md.mp4';
  public videoLgMarkedAsLoadStart: boolean = false;
  public isVideoLgReady: boolean = false;

  private subscriptionRegionStatus: Subscription;

  @ViewChild('videoPlayer') private videoPlayer: ElementRef;
  @ViewChild('videoLg') private videoLg: ElementRef;

  @HostListener('window:resize') WindowResize() {
    this.loadVideoLgIfNeeded();
  } 

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
    private _regionService: RegionService,
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

    this.loadVideoLgIfNeeded();
  }

  ngOnDestroy() {
    this.subscriptionRegionStatus?.unsubscribe();
  }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Showcase your brand and receive endorsements from wellness providers | PromptHealth',
      description: 'PromptHealth works with all types of brands relating to wellness - apps, products, services, podcasts, courses, and more.',
      robots: 'index, follow',
      image: `${environment.config.FRONTEND_BASE}/assets/video/about-company-thumbnail.jpg`,
      imageWidth: 992,
      imageHeight: 558,
      imageType: 'image/jpg'
    });

    this.subscriptionRegionStatus = this._regionService.statusChanged().subscribe(status => {
      if(status == 'ready') {
        this.initPlans();
      }
    })

    this.initCoupon();
  }

  loadVideoLgIfNeeded() {
    if(this.sizeL && this.videoLg?.nativeElement && !this.videoLgMarkedAsLoadStart) {
      const videoLg = this.videoLg.nativeElement as HTMLVideoElement;
      videoLg.addEventListener('loadeddata', () => {
        const vp = this.videoPlayer?.nativeElement;
        const currentTime = vp?.currentTime || 0;
        this.isVideoLgReady = true;
        videoLg.currentTime = currentTime;
        videoLg.loop = true;
        vp.pause();
        videoLg.play();        
      });
  
      videoLg.load();
      this.videoLgMarkedAsLoadStart = true;  
    }
  }

  initPlans() {
    const region = this._uService.localStorage.getItem('region');
    const path = 'user/get-plans?region=' + region;
    this._sharedService.getNoAuth(path).subscribe((res: IGetPlansResult) => {
      if(res.statusCode == 200) {
        res.data.forEach(d => {
          switch(region) {
            case 'CA': d.currency = 'CAD'; break;
            case 'US': d.currency = 'USD'; break;
            default:   d.currency = '$';
          }
          
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
  {
    q: 'What is PromptHealth and why should I be involved?',
    a: 'PromptHealth is an online platform created to assist people navigate their health journey by providing education on holistic wellness solutions. We have created an ecosystem where wellness seekers can learn directly from the providers and get connected with them based on areas of interest. To further emphasize an integrative approach and truly create an all-in-one wellness navigator, we list different wellness companies that may assist providers with their service goals or provide supplementary solutions to wellness seekers.',
    opened: false,
  },
  {
    q: 'What types of wellness companies do we work with?',
    a: `We work with all kinds of wellness brands who do not fit under the category of being a provider. Some examples include mobile apps, wellness-related products, services, and other resources that benefit the wellness community. 
      <br><br>
      Unsure if your company will be a good fit? Email us at <a href="mailto:info@prompthealth.ca">info@prompthealth.ca</a> to learn more. 
    `,
    opened: false,
  },
  {
    q: 'What do I get with a  standard membership?',
    a: 'You will get listed on our website and app with a profile complete with a  description of your company and what you offer. You can upload images to directly display your products and/or services, and also promote any upcoming offers or events. Any time a new promotion or event is created, our community of both providers and users will receive a notification.  Finally, receive recommendations and endorsements from our wellness providers to gain more credibility. Providers who resonate with your brand have the option to share your company page on their profile.',
    opened: false,
  },
  {
    q: 'What is the cost to join PromptHealth?',
    a: `The standard profile for wellness companies costs $200/month. Companies who sign up for an annual membership receive 20% the total price.  
      <br><br>
      For companies looking for further brand exposure, we offer custom add-on options, including promotions such as paid ads, mentions in our monthly newsletter, and features on our social media via live sessions, interviews, podcasts, and more. For more information on social media collaborations and custom add-ons, please contact us at <a href="mailto:info@prompthealth.ca">info@prompthealth.ca</a>.
    `,
    opened: false,
  },
  {
    q: 'How do I get listed?',
    a: 'After signing up by email, or by connecting your Facebook or Google account, you will be asked a series of questions to help us understand your company’s  background and which category of wellness it fits under. . This allows us to ensure your brand is  listed under all of our relevant categories, and will show up when a user is searching for solutions to a particular concern.',
    opened: false,
  },
  {
    q: 'How do I create an account?',
    a: 'Creating an account is easy. Click the “sign-up” link on our site, and follow the steps shown. When creating an account, please ensure that you fill out all requested information, as it helps create the perfect profile for new clients to find and book sessions with you. Our team DOES NOT approve profiles that are partially filled out, as this does not ensure you are placed in the correct category in our search.',
    opened: false,
  },
  {
    q: 'Will I be able to receive reviews and recommendations?',
    a: 'Recommendations can be provided by other wellness practitioners and wellness companies. To prevent fake reviews, we are only allowing wellness providers and companies who have already been approved to be on PromptHealth to write a recommendation on your profile. This is meant to boost credibility and online trust for everyone.',
    opened: false,
  },
  {
    q: 'Is there a verification process?',
    a: `Before we approve a listing, we ensure to complete an audit to ensure the accuracy of information provided by the company. 
      <br><br>
      This involves a careful qualitative approach conducted by the team. We encourage the company to follow any community guidelines. Although this review process is carefully conducted, we cannot guarantee the qualification information provided and cannot be responsible for false information. 
    `,
    opened: false,
  },
  {
    q: 'How do I deactivate or delete my account?',
    a: `To deactivate or delete your account, please You can contact the admin at <a href="mailto:info@prompthealth.ca">info@prompthealth.ca</a>`,
    opened: false,
  },
]

