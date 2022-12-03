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
            this.plans.basic.data = d;

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
      case "basic":
      // TODO: Show ask modal
      // this._modalService.show("select-plan-type");
      case "provider":
        link.push("sp");
        break;

      case "custom":
        link = ["/contact-us"];
        break;

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
      "Share your wellness philosophy and knowledge, allowing people to discover you and your unique services.",
  },
  {
    icon: "text-block-outline",
    title: "Share your expertise.",
    content:
      "Whether it’s through text, voice notes, images, articles, or online events, we made it easy for you to share your knowledge using the medium that you enjoy creating with.",
  },
  {
    icon: "user-check-outline",
    title: "Connect and engage.",
    content:
      "Be a part of our wellness community. connect with other holistic providers who align with your values and have a similar approach to wellness. who align with your values and approach to wellness.",
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
  basic: {
    id: "basic",
    icon: "note-text-outline",
    title: "Basic",
    // subtitle: 'Get started with PromptHealth for free!',
    subtitle: "",
    label: null,
    data: null,
  },
  provider: {
    id: "provider",
    icon: "verified-outline",
    title: "Wellness brands/providers",
    // subtitle: "",
    subtitle: "For solo providers.",
    label: "Popular",
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
  custom: {
    id: "custom",
    icon: "users-outline",
    title: "Custom",
    // subtitle: 'For centers with multiple providers.',
    subtitle: "",
    label: null,
    data: null,
  },
};

const planFeatures: IPlanFeatureData[] = [
  {
    item: "Get listed with a personalized profile",
    targetPlan: ["basic", "provider"],
    detail: null,
  },
  {
    item: "Follow and engage with other users",
    targetPlan: ["basic", "provider"],
    detail: null,
  },
  {
    item: "Share your knowledge via voice memos, notes, and images",
    targetPlan: ["basic", "provider"],
    detail: null,
  },
  {
    item: "Receive booking requests",
    targetPlan: ["basic", "provider"],
    detail: null,
  },
  {
    item: "Recommendations by other providers",
    targetPlan: ["basic", "provider"],
    detail: null,
  },
  // {
  //   item: "Access to all basic features",
  //   targetPlan: ["provider", ],
  //   detail: null,
  // },
  {
    item: "Exclusive access to Prompt Academy Resources",
    targetPlan: ["provider"],
    detail: null,
  },
  {
    item: "Monthly features on all PromptHealth's social media channels (Guest post, live conversations, etc) ",
    targetPlan: ["provider"],
    detail: null,
  },
  {
    item: "Monthly Check-In with a social media manger",
    targetPlan: ["provider"],
    detail: null,
  },
  // {
  //   item: "Performance analytics",
  //   targetPlan: ["provider", "centre"],
  //   detail: null,
  // },

  // {item: 'List different locations, services, and practitioners', targetPlan: ['centre'], detail: null},

  {
    item: "List all your providers for free",
    targetPlan: [],
    detail: null,
  },
  {
    item: "Full Social Media Management",
    targetPlan: ["custom"],
    detail: null,
  },
  {
    item: "Social Media Mentorship",
    targetPlan: ["custom"],
    detail: null,
  },
  // { item: "Social Media Management", targetPlan: ["custom"], detail: null },
  // {
  //   item: "PromptHealth personal assistant for onboarding",
  //   targetPlan: ["centre"],
  //   detail: null,
  // },
];

const faqs: IFAQItem[] = [
  {
    q: "What is PromptHealth and why should I be involved?",
    a: "PromptHealth is a network of holistic care practitioners. It empowers providers to showcase their knowledge in different formats for better online exposure and to educate the wellness community. They can also collaborate with other practitioners and with PromptHealth, itself. Wellness seekers can learn directly from the trusted sources and connect when the need arises.",
    opened: false,
  },
  {
    q: "How is PromptHealth different from a regular directory?",
    a: `Unlike regular directories, we don’t assume that people know what providers to search for, and what they all do. Instead, we start from a person’s individual needs and show them all of the options. Our search filters allow people to narrow their search based on preferences such as gender, age speciality, language, location, virtual care, and more. 
      <br><br>
      Further, people are able to learn about each practitioner by the content they post on their profile.  Before booking with a practitioner, our users can learn about their area of interest, and follow them to get notified every time a new post is created. This allows our users to make informed decisions about their care, and book with someone they truly trust and feel comfortable with.
    `,
    opened: false,
  },
  {
    q: "Does it cost to join PromptHealth?",
    a: `You have the option of creating a free account. You also have the option to create an enhanced profile for $25/month as a solo provider, or $95/ month as a center with multiple providers to have access to the Prompt Academy created exclusively with the intent to empower you to market your services more effectively, as well as the opportunity for social collaboration with us. Details of each account type and features can be found on the pricing page.`,
    opened: false,
  },
  {
    q: "How do I get listed?",
    a: `After signing up by email, or by connecting your Facebook or Google account, you will be asked a series of questions to help us understand your background and specialities. This allows us to ensure you are listed under all of our relevant categories, and will show up when a user is searching for solutions to a particular concern.`,
    opened: false,
  },
  {
    q: "How do I create an account?",
    a: "Creating an account is easy. Click the “get listed”  link on our site, and follow the steps shown. When creating an account, please ensure that you fill out all requested information, as it helps create the perfect profile for new clients to find and book sessions with you. Our team DOES NOT approve profiles that are partially filled out, as this does not ensure you are placed in the correct category in our search. We expect you to follow the guidelines provided to upload a professional picture and only select modalities that you are certified in, in order to get the most suitable client match.",
    opened: false,
  },
  {
    q: "How do I create content?",
    a: `PromptHealth is on a mission to make it easy for people to research, learn, discover, and ultimately make informed decisions about their health, all in one place. Our goal is to eliminate trial and error online by making PromptHealth the modern and user friendly hub for trusted health and wellness information right by you. We have created a platform to display your  knowledge, educate people, and get connected.
    <br><br>
    On your profile, you are able to share wellness content via notes, audio, blogs, events, images, and video (coming soon). Our team is here to support you in the process of creating content, and are happy to provide guidance if needed. Just reach out!
    `,
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
