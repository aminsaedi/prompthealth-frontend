import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UniversalService } from "src/app/shared/services/universal.service";
import { smoothWindowScrollTo } from "src/app/_helpers/smooth-scroll";
import { IFAQItem } from "../_elements/faq-item/faq-item.component";
import { first } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { GROWTH_PLAN_CARD } from '../_elements/growth-plan-card/growth-plan-copy';

/* Proposed wording, on Hedieh's sign-off list (plan section 6), taken from
 * plan-specs/growth/dentists-landing-copy.json (otherPages) by a script. The
 * meta and the WebPage JSON-LD share it; the page's H2 is in its template. */
const PLANS_PAGE = {
  title: 'Plans for Practitioners | PromptHealth',
  description: 'Create a free PromptHealth profile, or grow your practice with PromptHealth Growth: video production and targeted advertising, now available for dental practices.',
};

@Component({
  selector: "app-about-practitioner",
  templateUrl: "./about-practitioner.component.html",
  styleUrls: ["./about-practitioner.component.scss"],
})
export class AboutPractitionerComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();

  get sizeL() {
    return window && window.innerWidth >= 992;
  }

  public features = features;
  public freePlanFeatures = freePlanFeatures;
  public faqs = faqs;

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
    private _uService: UniversalService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _el: ElementRef,
    private _jsonLdService: JsonLdService,
  ) {}

  ngAfterViewInit() {
    this._route.fragment.pipe(first()).pipe(takeUntil(this.destroy$)).subscribe((fragment) => {
      const el: HTMLElement = this._el.nativeElement.querySelector("#" + fragment);
      if (el) {
        setTimeout(() => smoothWindowScrollTo(el.getBoundingClientRect().top), 300);
      }
    });
    this.loadVideoLgIfNeeded();
  }

  ngOnInit(): void {
    /* The page used to be titled for the AI Visibility Program it sold. It now
     * names both plans and prices neither. */
    this._uService.setMeta('/plans', {
      title: PLANS_PAGE.title,
      description: PLANS_PAGE.description,
      robots: "index, follow",
      /* The .jpg this pointed at was replaced by a 3.4 MB .png screenshot in
       * Feb 2022 and this line never followed, so /plans shared with no image
       * for four years. A 1.91:1 crop is the shape every large share card
       * uses. Versioned, because /assets is served immutable. */
      image: `${environment.config.FRONTEND_BASE}/assets/img/share/plans-1200x630.v1.jpg`,
      imageWidth: 1200,
      imageHeight: 630,
      imageType: "image/jpeg",
      imageAlt: "Two women standing by a sunlit window",
    });

    /* No offer here carries a price, a currency or a price specification:
     * nothing on this site states what PromptHealth charges. The catalogue
     * belongs to the publisher, which offers both plans. It used to hang off
     * the paid service, which listed the free profile as one of that
     * service's own offers. */
    this._jsonLdService.setJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: PLANS_PAGE.title,
        description: PLANS_PAGE.description,
        url: 'https://www.prompthealth.ca/plans',
        isPartOf: {
          '@type': 'WebSite',
          name: 'PromptHealth',
          url: 'https://www.prompthealth.ca',
        },
        publisher: {
          '@type': 'Organization',
          name: 'PromptHealth',
          url: 'https://www.prompthealth.ca',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.prompthealth.ca/assets/img/prompthealth.png',
            width: 800,
            height: 350,
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'PromptHealth Plans',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Free Profile',
                  description:
                    'Basic provider listing with category placement and platform visibility.',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'PromptHealth Growth',
                  description: GROWTH_PLAN_CARD.body,
                  url: 'https://www.prompthealth.ca' + GROWTH_PLAN_CARD.link,
                },
              },
            ],
          },
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://www.prompthealth.ca',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Plans',
              item: 'https://www.prompthealth.ca/plans',
            },
          ],
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'Healthcare Provider Visibility & Marketing',
        name: 'PromptHealth Growth',
        description: GROWTH_PLAN_CARD.body,
        url: 'https://www.prompthealth.ca' + GROWTH_PLAN_CARD.link,
        provider: {
          '@type': 'Organization',
          name: 'PromptHealth',
          url: 'https://www.prompthealth.ca',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Canada',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a.replace(/<[^>]*>/g, ''),
          },
        })),
      },
    ]);
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

  onClickCreateFreeProfile() {
    this._router.navigate(["/auth", "registration", "sp"]);
  }

  
  ngOnDestroy() {
    this._jsonLdService.removeJsonLd();
    this.destroy$.next();
    this.destroy$.complete();
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
];
