import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ICouponData } from "src/app/models/coupon-data";
import { SharedService } from "src/app/shared/services/shared.service";
import { UniversalService } from "src/app/shared/services/universal.service";
import { slideHorizontalAnimation } from "src/app/_helpers/animations";
import { smoothWindowScrollTo } from "src/app/_helpers/smooth-scroll";
import { IFAQItem } from "../_elements/faq-item/faq-item.component";
import { first } from "rxjs/operators";
import { environment } from "src/environments/environment";

declare let fbq: Function;

@Component({
  selector: "app-about-practitioner",
  templateUrl: "./about-practitioner.component.html",
  styleUrls: ["./about-practitioner.component.scss"],
  animations: [slideHorizontalAnimation],
})
export class AboutPractitionerComponent implements OnInit {
  get sizeL() {
    return window && window.innerWidth >= 992;
  }

  public features = features;
  public freePlanFeatures = freePlanFeatures;
  public aiPlanFeatures = aiPlanFeatures;
  public faqs = faqs;

  public couponData: ICouponData = null;
  public isCouponShown = false;
  public isCouponShrink = false;

  public videoLink = "/assets/video/about-practitioner-sm.mp4";
  public videoLinkLg = "/assets/video/about-practitioner-md.mp4";
  public videoLgMarkedAsLoadStart = false;
  public isVideoLgReady = false;

  @ViewChild("videoPlayer") private videoPlayer: ElementRef;
  @ViewChild("videoLg") private videoLg: ElementRef;

  @HostListener("window:resize") onWindowResize() {
    this.loadVideoLgIfNeeded();
  }

  constructor(
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _el: ElementRef,
  ) {}

  ngAfterViewInit() {
    this._route.fragment.pipe(first()).subscribe((fragment) => {
      const el: HTMLElement = this._el.nativeElement.querySelector("#" + fragment);
      if (el) {
        setTimeout(() => smoothWindowScrollTo(el.getBoundingClientRect().top), 300);
      }
    });
    this.loadVideoLgIfNeeded();
  }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: "Grow Your Visibility in the Age of AI Search | PromptHealth",
      description:
        "PromptHealth helps healthcare providers become discoverable through content, video, and AI search.",
      robots: "index, follow",
      image: `${environment.config.FRONTEND_BASE}/assets/video/about-practitioner-thumbnail.jpg`,
      imageWidth: 992,
      imageHeight: 558,
      imageType: "image/jpg",
    });

    this.initCoupon();
  }

  loadVideoLgIfNeeded() {
    if (this.sizeL && this.videoLg?.nativeElement && !this.videoLgMarkedAsLoadStart) {
      const videoLg = this.videoLg.nativeElement as HTMLVideoElement;
      videoLg.addEventListener("loadeddata", () => {
        const vp = this.videoPlayer?.nativeElement;
        this.isVideoLgReady = true;
        videoLg.currentTime = vp?.currentTime || 0;
        videoLg.loop = true;
        vp?.pause();
        videoLg.play();
      });
      videoLg.load();
      this.videoLgMarkedAsLoadStart = true;
    }
  }

  initCoupon() {
    const coupon = this._uService.sessionStorage.getItem("stripe_coupon_code");
    if (!coupon) return;

    this.couponData = JSON.parse(coupon);
    const isApplicable = ["SP", "C"].some((role) =>
      this._sharedService.isCouponApplicableTo(this.couponData, role)
    );
    if (isApplicable) {
      setTimeout(() => (this.isCouponShown = true), 1000);
    }
  }

  onClickCreateFreeProfile() {
    this._uService.sessionStorage.setItem("selectedPlan", "null");
    fbq("track", "Lead");
    this._router.navigate(["/auth", "registration", "sp"]);
  }

  expandCoupon() {
    this.isCouponShrink = false;
  }

  shrinkCoupon(e: Event) {
    e.stopPropagation();
    this.isCouponShrink = true;
  }
}

const features = [
  {
    icon: "user-check-outline",
    title: "Be Featured as a Trusted Health Expert.",
    content:
      "We highlight certified health professionals through expert interviews shared across our channels with over 1 million followers on YouTube, TikTok, and Instagram.",
  },
  {
    icon: "video-library",
    title: "Get Discovered",
    content:
      "Increase your visibility with a professionally produced feature video shared on our wellness platform. Expand your reach and grow your brand within a trusted health network.",
  },
  {
    icon: "user-check-outline",
    title: "Share Your Expertise.",
    content:
      "Position yourself as a go-to expert by sharing your insights through engaging video content. Build credibility and connect with an audience seeking trusted health guidance.",
  },
];

const freePlanFeatures: string[] = [
  "Basic provider profile",
  "Listed under categories",
  "Visibility on PromptHealth",
];

const aiPlanFeatures: string[] = [
  "SEO-optimized content based on patient searches",
  "Expert video content (YouTube + short-form)",
  "Keyword and topic strategy",
  "Placement on high-intent pages",
  "Internal linking across content",
  "Ongoing visibility optimization",
];

const faqs: IFAQItem[] = [
  {
    q: "What are the benefits of joining PromptHealth?",
    a: `As a certified provider, you'll receive:
      <ul>
        <li>Exposure to <strong>1M+ health-conscious followers</strong> across TikTok, Instagram &amp; YouTube</li>
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
    a: "Click <strong>Create Free Profile</strong>, complete the brief onboarding, and start building your visibility on PromptHealth.",
    opened: false,
  },
  {
    q: "What's the cost and value of this service?",
    a: `Think of this as an affordable PR strategy. For $500/month (just $125/week), you receive professionally produced, authentic content distributed to a highly targeted audience of wellness seekers.
    <br><br>
    Hiring a marketing agency or running generic social media ads often costs much more—and typically reaches a broad, non-specific audience. With PromptHealth, your message lands in front of the right people, through trusted, human content that builds real engagement and credibility.`,
    opened: false,
  },
];
