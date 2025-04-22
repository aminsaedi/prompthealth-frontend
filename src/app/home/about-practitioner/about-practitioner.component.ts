import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ProfileManagementService } from "src/app/shared/services/profile-management.service";
import { ICouponData } from "src/app/models/coupon-data";
import {
  IPlanData,
  IPlanFeatureData,
  PlanTypePractitioner,
} from "src/app/models/default-plan";
import { IGetPlansResult } from "src/app/models/response-data";
import { SharedService } from "src/app/shared/services/shared.service";
import { UniversalService } from "src/app/shared/services/universal.service";
import {
  expandVerticalAnimation,
  slideHorizontalAnimation,
} from "src/app/_helpers/animations";
import { smoothWindowScrollTo } from "src/app/_helpers/smooth-scroll";
import { IFAQItem } from "../_elements/faq-item/faq-item.component";
import { first } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { RegionService } from "src/app/shared/services/region.service";
import { Subscription } from "rxjs";
import { ModalService } from "../../shared/services/modal.service";

declare let fbq: Function;
@Component({
  selector: "app-about-practitioner",
  templateUrl: "./about-practitioner.component.html",
  styleUrls: ["./about-practitioner.component.scss"],
  animations: [expandVerticalAnimation, slideHorizontalAnimation],
})
export class AboutPractitionerComponent implements OnInit {
  get sizeL() {
    return window && window.innerWidth >= 992;
  }

  get profile() {
    return this._profileService.user;
  }
  get isNotLoggedIn() {
    return this._profileService.loginStatus == "notLoggedIn";
  }
  get isLoggedIn() {
    return this._profileService.loginStatus == "loggedIn";
  }

  constructor(
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _el: ElementRef,
    private _regionService: RegionService,
    private _modalService: ModalService
  ) {}

  public features = features;
  public plans = plans;
  public planFeatures = planFeatures;
  public faqs = faqs;

  public isDurationMonthly = true;
  public isLoading = false;

  public couponData: ICouponData = null;
  public isCouponShown = false;
  public isCouponShrink = false;

  public videoLink = "/assets/video/about-practitioner-sm.mp4";
  public videoLinkLg = "/assets/video/about-practitioner-md.mp4";
  public videoLgMarkedAsLoadStart = false;
  public isVideoLgReady = false;

  private subscriptionRegionStatus: Subscription;

  @ViewChild("videoPlayer") private videoPlayer: ElementRef;
  @ViewChild("videoLg") private videoLg: ElementRef;

  @HostListener("window:resize") WindowResize() {
    this.loadVideoLgIfNeeded();
  }

  keepOriginalOrder = (a: any, b: any) => a.key;

  isFeatureShowable(i: number, planType: PlanTypePractitioner) {
    return this.planFeatures[i].targetPlan.indexOf(planType) === 0;
  }

  ngOnDestroy() {
    this.subscriptionRegionStatus?.unsubscribe();
  }

  ngAfterViewInit() {
    this._route.fragment.pipe(first()).subscribe((fragment) => {
      const el: HTMLElement = this._el.nativeElement.querySelector(
        "#" + fragment
      );
      if (el) {
        setTimeout(() => {
          const top = el.getBoundingClientRect().top;
          smoothWindowScrollTo(top);
        }, 300);
      }
    });

    this.loadVideoLgIfNeeded();
  }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: "Reach more new patients and grow your practice with PromptHealth",
      description:
        "PromptHealth helps providers reach more new patients for in-person visits, video visits or both.",
      robots: "index, follow",
      image: `${environment.config.FRONTEND_BASE}/assets/video/about-practitioner-thumbnail.jpg`,
      imageWidth: 992,
      imageHeight: 558,
      imageType: "image/jpg",
    });

    this.subscriptionRegionStatus = this._regionService
      .statusChanged()
      .subscribe((status) => {
        if (status == "ready") {
          this.initPlans();
        }
      });

    this.initCoupon();
  }

  loadVideoLgIfNeeded() {
    if (
      this.sizeL &&
      this.videoLg?.nativeElement &&
      !this.videoLgMarkedAsLoadStart
    ) {
      const videoLg = this.videoLg.nativeElement as HTMLVideoElement;
      videoLg.addEventListener("loadeddata", () => {
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
    const region = this._uService.localStorage.getItem("region");
    const path = "user/get-plans?region=" + region;
    this._sharedService.getNoAuth(path).subscribe((res: IGetPlansResult) => {
      if (res.statusCode == 200) {
        res.data.forEach((d) => {
          switch (region) {
            case "CA":
              d.currency = "CAD";
              break;
            case "US":
              d.currency = "USD";
              break;
            default:
              d.currency = "$";
          }

          if (d.userType.includes("P")) {
            // nothing to do
          } else if (d.userType.length == 2) {
            // this.plans.basic.data = d;

            // plan name should not be used to connect providerPlan | centrePlan
            //because it will be changed possibly
            // } else if (d.userType.includes('SP') && d.name === 'Premium') {
            //   this.plans.provider.data = d;
          } else if (d.userType.includes("SP")) {
            this.plans.provider.data = d;
          }
          // else if (d.userType.includes("C")) {
          //   this.plans.centre.data = d;
          // }
        });
      }
    });
  }

  initCoupon() {
    const coupon = this._uService.sessionStorage.getItem("stripe_coupon_code");
    if (coupon) {
      this.couponData = JSON.parse(coupon);
      let isCouponApplicable = false;
      for (const role of ["SP", "C"]) {
        if (this._sharedService.isCouponApplicableTo(this.couponData, role)) {
          isCouponApplicable = true;
        }
      }

      if (isCouponApplicable) {
        setTimeout(() => {
          this.isCouponShown = true;
        }, 1000);
      }
    }
  }

  onChangeDuration(state: "on" | "off") {
    this.isDurationMonthly = state == "on" ? true : false;
  }

  scrollTo(el: HTMLElement) {
    if (el && window) {
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

  onClickFreePlan(type: "basic") {
    this._modalService.show("select-plan-type");
    // let link = ["/auth", "registration"];
    // if (type === "provider") {
    //   link.push("sp");
    // } else if (type === "centre") {
    //   link.push("c");
    // }
    // this._uService.sessionStorage.setItem(
    //   "selectedPlan",
    //   JSON.stringify(this.plans.basic.data)
    // );
    // this._uService.sessionStorage.setItem(
    //   "selectedMonthly",
    //   this.isDurationMonthly.toString()
    // );

    // this._router.navigate(link);
  }

  onClickSignup(type: PlanTypePractitioner, fromModal: boolean = false) {
    let link = ["/auth", "registration"];
    switch (type) {
      // case "basic":
      // TODO: Show ask modal
      // this._modalService.show("select-plan-type");
      case "provider":
        link.push("sp");
        break;

      // case "custom":
      //   link = ["/contact-us"];
      //   break;

      // case "centre":
      //   link.push("c");
      //   break;
    }
    if (!fromModal) {
      this._uService.sessionStorage.setItem(
        "selectedPlan",
        JSON.stringify(this.plans[type].data)
      );
      this._uService.sessionStorage.setItem(
        "selectedMonthly",
        this.isDurationMonthly.toString()
      );
    } else {
      this._uService.sessionStorage.setItem("selectedPlan", "null");
    }
    fbq("track", "Subscribe");
    this._router.navigate(link);
  }

  async onClickCheckout(type: PlanTypePractitioner) {
    if (this.profile.roles == "U") {
      this._toastr.error("You don't need to buy this plan");
    } else {
      // if (type === "centre") {
      //   this._router.navigate(["/contact-us"]);
      //   return;
      // }
      this.isLoading = true;
      try {
        const result = await this._sharedService.checkoutPlan(
          this.profile,
          this.plans[type].data,
          "default",
          this.isDurationMonthly
        );
        this._toastr.success(result.message);
        switch (result.nextAction) {
          case "complete":
            this._router.navigate(["/dashboard/register-product/complete"]);
            break;
          case "stripe":
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
    icon: "user-check-outline",
    title: "Get discovered.",
    content:
      "Increase your visibility with a professionally produced feature video shared on our wellness platform. Expand your reach and grow your brand within a trusted health network.",
  },
  {
    icon: "video-library",
    title: "Share your expertise.",
    content:
      "Professional “BRAND STORY”with a multi channel approach on Instagram, TikTok and YouTube to over a million followers.",
  },
  {
    icon: "user-check-outline",
    title: "Connect and engage.",
    content:
      "Position yourself as a go-to expert by sharing your insights through engaging video content. Build credibility and connect with an audience seeking trusted health guidance.",
  },
  // {
  //   icon: 'cast-outline',
  //   title: 'Fun and simple to use.',
  //   content: 'Be a part of our wellness community. Engage with new and potential clients, and other providers in your area who align with your values and approach to wellness.',
  // },
  // {
  //   icon: 'verified-outline',
  //   title: 'voice memos, notes, and images + articles, and events',
  //   content: 'This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is.',
  // },
  // {
  //   icon: 'thumbs-up-outline',
  //   title: 'Receive booking requests',
  //   content: 'This is a test This is a test This is a test This is a test This is a test This is a test This is a test This  This is a test This is a test This is a test This.',
  // },
  // {
  //   icon: 'cast-outline',
  //   title: 'Inter referrals enabled',
  //   content: 'This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is.',
  // },
  // {
  //   icon: 'verified-outline',
  //   title: 'Ratings and reviews',
  //   content: 'This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is.',
  // },

  // {
  //   icon: 'lightning-outline',
  //   title: 'Simple to use and time-saving.',
  //   content: 'We are creating a space where health and wellness experts can lead the conversation around the topics they are experts in. Instead of spending time building your credibility online, let them come to you on PromptHealth and focus on what you do best.',
  // },
  // {
  //   icon: 'text-block-outline',
  //   title: 'Choose a content creation option that works best for you.',
  //   content: 'Easy to use content creation tools made for busy health practitioners. Share using the medium that suits you best. Whether it’s through voice notes, videos, articles, or online events, we made it easy for health providers to create and share.',
  // },
  // {
  //   icon: 'user-check-outline',
  //   title: 'Share information on topics you are an expert in.',
  //   content: 'Health misinformation online is a huge problem today. We are serious about making sure those providing health information can be trusted. We prioritize verifying our providers to remain a credible and helpful health resource for the public.',
  // },
  // {
  //   icon: 'cast-outline',
  //   title: 'Connect with clients.',
  //   content: 'Find clients, share details about the services you offer and how you can help, and accept bookings all in one platform. ',
  // },
  // {
  //   icon: 'thumbs-up-outline',
  //   title: 'Engage with the health and wellness community.',
  //   content: 'Be part of our community. Stay engaged with new and current clients, and other practitioners in your area. ',
  // },
  // {
  //   icon: 'verified-outline',
  //   title: 'Recommend other health professionals you trust.',
  //   content: 'Think your clients will benefit from a different treatment, or do you know another provider you trust? Find and leave recommendations for other practitioners. ',
  // },
];

const plans: { [k in PlanTypePractitioner]: IPlanData } = {
  // basic: {
  //   id: "basic",
  //   icon: "note-text-outline",
  //   title: "Basic",
  //   // subtitle: 'Get started with PromptHealth for free!',
  //   subtitle: "",
  //   label: null,
  //   data: null,
  // },
  provider: {
    id: "provider",
    icon: "",
    title: "",
    subtitle: "",
    // subtitle: "For solo providers.",
    label: "",
    data: null,
  },
  // centre: {
  //   id: "centre",
  //   icon: "users-outline",
  //   title: "Centre",
  //   subtitle: "For centers with multiple providers.",
  //   // subtitle: "",
  //   label: null,
  //   data: null,
  // },
  // custom: {
  //   id: "custom",
  //   icon: "users-outline",
  //   title: "Custom",
  //   // subtitle: 'For centers with multiple providers.',
  //   subtitle: "",
  //   label: null,
  //   data: null,
  // },
};

const planFeatures: IPlanFeatureData[] = [
  {
    item: "Monthly Video Feature",
    detail: " Be seen by a global audience of over 1 million with a professionally produced expert interview. We’ll post the full video on YouTube and share short clips on Instagram and TikTok to amplify your reach.",
    targetPlan: ["provider"],
  },
  {
    item: "Trusted Exposure",
    detail: "Get discovered as a credible voice in wellness. Only certified professionals are featured—building trust with a health-conscious audience.",
    targetPlan: ["provider"],
  },
  {
    item: "Wellness Community",
    detail: "Become part of a growing network of like-minded health providers committed to education, credibility, and impact.",
    targetPlan: ["provider"],
  },
  // {
  //   item: "Get listed with a personalized profile",
  //   targetPlan: [
  //     // "basic", 
  //   "provider"],
  //   detail: null,
  // },
  // {
  //   item: "Follow and engage with other users",
  //   targetPlan: [
  //     // "basic",
  //      "provider"],
  //   detail: null,
  // },
  // {
  //   item: "Share your knowledge via voice memos, notes, and images",
  //   targetPlan: [
  //     // "basic",
  //      "provider"],
  //   detail: null,
  // },
  // {
  //   item: "Receive booking requests",
  //   targetPlan: [
  //     // "basic",
  //      "provider"],
  //   detail: null,
  // },
  // {
  //   item: "Recommendations by other providers",
  //   targetPlan: [
  //     // "basic",
  //      "provider"],
  //   detail: null,
  // },
  // {
  //   item: "Access to all basic features",
  //   targetPlan: ["provider", ],
  //   detail: null,
  // },
  // {
  //   item: "Get Discovered: Boost SEO with our blogs as well as your articles in our community of verified health experts to rank highly on Google.",
  //   targetPlan: ["provider"],
  //   detail: null,
  // },
  // {
  //   item: "Share your expertise with over a million of therapy seekers: Yearly video introduction and monthly repost features and shoutouts on our social platforms (Only for annual subscriptions)",
  //   targetPlan: ["provider"],
  //   detail: null,
  // },
  // {
  //   item: "Connect and engage: Get ideal client matches and introduce your events and courses through our community with comprehensive filters so clients can find what they are looking for easier.",
  //   targetPlan: ["provider"],
  //   detail: null,
  // },
  // {
  //   item: "Monthly Check-In with a social media manger",
  //   targetPlan: ["provider"],
  //   detail: null,
  // },
  // {
  //   item: "Performance analytics",
  //   targetPlan: ["provider", "centre"],
  //   detail: null,
  // },

  // {item: 'List different locations, services, and practitioners', targetPlan: ['centre'], detail: null},

  // {
  //   item: "List all your providers for free",
  //   targetPlan: [],
  //   detail: null,
  // },
  // {
  //   item: "Full Social Media Management",
  //   targetPlan: ["custom"],
  //   detail: null,
  // },
  // {
  //   item: "Social Media Mentorship",
  //   targetPlan: ["custom"],
  //   detail: null,
  // },
  // { item: "Social Media Management", targetPlan: ["custom"], detail: null },
  // {
  //   item: "PromptHealth personal assistant for onboarding",
  //   targetPlan: ["centre"],
  //   detail: null,
  // },
];

const faqs: IFAQItem[] = [
  {
    q: "What are the benefits of joining PromptHealth?",
    a: `As a certified provider, you'll receive:
      <ul>
        <li>Exposure to <strong>1M+ health-conscious followers</strong> across TikTok, Instagram & YouTube</li>
        <li>A <strong>professionally produced video interview</strong>, edited and posted for maximum impact</li>
        <li>Increased credibility as a featured expert in a <strong>vetted wellness network</strong></li>
        <li>Connection to a global audience of wellness seekers</li>
      </ul>
    `,
    opened: false,
  },
  {
    q: "Do I have to film or edit anything myself?",
    a: `Nope! We handle everything. You'll be interviewed over Zoom, and our team will professionally edit and publish the content across our platforms.`,
    opened: false,
  },
  {
    q: "What kind of content will be posted?",
    a: `
<ul>
  <li>Short-form clips (30–60 sec) from your interview will be shared on TikTok and Instagram</li>
  <li>A long-form version will be posted on our YouTube channel</li>
  <li>Posts are shared as a collab (tagging your account for exposure)</li>
</ul>
    `,
    opened: false,
  },
  {
    q: "Can I do more than one feature?",
    a: `Yes! Additional video features are available for an extra fee. Contact us for a custom package that fits your goals.`,
    opened: false,
  },
  {
    q: "How do I get started?",
    a: "Click <strong>Get Featured Now</strong> on our homepage, complete the brief onboarding, and we'll schedule your Zoom interview.",
    opened: false,
  },
  {
    q: "What's the cost and value of this service?",
    a: `Think of this as an affordable PR strategy. For $500/month (just $125/week), you receive professionally produced, authentic content distributed to a highly targeted audience of wellness seekers.
    <br><br>
 Hiring a marketing agency or running generic social media ads often costs much more—and typically reaches a broad, non-specific audience. With PromptHealth, your message lands in front of the right people, through trusted, human content that builds real engagement and credibility`,
    opened: false,
  },
  {
    q: "Will I be able to receive reviews and recommendations?",
    a: `You are able to connect any existing Google reviews to your profile to gain credibility right away. Further, new clients can write you a review after they have attended any booked appointments.
      <br><br>
      In addition, we are the first online platform that makes it possible for health and wellness providers to easily find and inter-refer each other. You can do this by providing recommendations on another provider’s profile to build further trust within the health and wellness community.
    `,
    opened: false,
  },
  {
    q: "Is there a verification process?",
    a: `Before we approve a listing, we ensure to complete an audit to ensure the accuracy of information provided by a health and wellness provider. This review process consists of a careful qualitative approach by our team.
      <br><br>
      We encourage you to upload your certification in order to receive a verified badge beside your profile, indicating you are verified to build more credibility and trust. Although this review process is carefully conducted, we cannot guarantee the qualification information provided and cannot be responsible for false information.
    `,

    opened: false,
  },
  {
    q: "How do I deactivate or delete my account?",
    a: `To deactivate or delete your account, please  contact the admin at <a href="mailto:info@prompthealth.ca">info@prompthealth.ca</a>`,
    opened: false,
  },
];
