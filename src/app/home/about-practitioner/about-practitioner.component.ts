import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { IGetPlansResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';

@Component({
  selector: 'app-about-practitioner',
  templateUrl: './about-practitioner.component.html',
  styleUrls: ['./about-practitioner.component.scss'],
  animations: [expandVerticalAnimation, ],
})
export class AboutPractitionerComponent implements OnInit {

  get profile() { return this._profileService.profile; }

  public features = features;
  public plans = plans;
  public planFeatures = planFeatures;
  public faqs = faqs;

  public isDurationMonthly: boolean = false;
  public isFeatureTableSticked: boolean = false;
  public idxSelectedFeatureItemForDetail: number = -1;

  public isLoading: boolean = false;

  keepOriginalOrder = (a: any, b: any) => a.key;

  isFeatureApplicable(i: number, planType: PlanType) {
    return this.planFeatures[i].targetPlan.includes(planType);
  }

  isFeatureShowable(i: number, planType: PlanType) {
    return this.planFeatures[i].targetPlan.indexOf(planType) === 0; 
  }

  @ViewChild('anchorPlans') private anchorPlans: ElementRef;
  @ViewChild('anchorPlanFeatures') private anchorPlanFeatures: ElementRef;

  constructor(
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.getPlans();
  }

  onClickSwitchDuration() {
    this.isDurationMonthly = !this.isDurationMonthly;
  }

  onChangeFeatureTableStickStatus(sticked: boolean) {
    this.isFeatureTableSticked = sticked;
  }

  showFeatureDetail(i: number) {
    this.idxSelectedFeatureItemForDetail = (this.idxSelectedFeatureItemForDetail == i) ? -1 : i;
  }

  toggleFAQItemState(faq: IFAQItem) {
    faq.opened = !faq.opened;
  }

  scrollToPlan() {
    if(this.anchorPlans && this.anchorPlans.nativeElement) {
      const el = this.anchorPlans.nativeElement as HTMLAnchorElement;
      const top = window.scrollY + el.getBoundingClientRect().top;
      smoothWindowScrollTo(top);
    }
  }

  scrollToPlanFeature() {
    if(this.anchorPlanFeatures && this.anchorPlanFeatures.nativeElement) {
      const el = this.anchorPlanFeatures.nativeElement as HTMLAnchorElement;
      const top = window.scrollY + el.getBoundingClientRect().top;
      smoothWindowScrollTo(top);
    }
  }

  onClickSignup(type: PlanType) {
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

  async onClickCheckout(type: PlanType) {
    if (this.profile.role == 'U') {
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





  getPlans() {
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

const plans = {
  basic: {
    icon: '',
    title: 'Basic',
    subtitle: 'For individual use',
    label: null,
    data: null,
  },
  provider: {
    icon: '',
    title: 'Providers',
    subtitle: 'For profiessional use',
    label: 'Popular',
    data: null,
  },
  centre: {
    icon: '',
    title: 'Centre',
    subtitle: 'For multiple use',
    label: null,
    data: null,
  }
}

const planFeatures = [
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

type PlanType = 'basic' | 'provider' | 'centre'

interface IFAQItem {
  q: string;
  a: string;
  opened: boolean;
}