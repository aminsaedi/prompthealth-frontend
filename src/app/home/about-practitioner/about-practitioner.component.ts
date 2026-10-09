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
import { GROWTH_PANEL, OFFER_CATALOG_ITEMS } from '../_elements/offer/offer-copy';

/* Proposed wording, on Hedieh's sign-off list (plan section 6), taken from
 * plan-specs/growth/dentists-landing-copy.json (otherPages) by a script. The
 * meta and the WebPage JSON-LD share it; the page's H2 is in its template. */
const PLANS_PAGE = {
  title: 'Plans for Practitioners | PromptHealth',
  description: 'Create a free PromptHealth profile, get weekly video and post ideas with PromptHealth Pro, or apply for PromptHealth Growth, our done-for-you video plan.',
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
    /* The page used to be titled for the AI Visibility Program it sold. */
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

    /* The catalogue belongs to the publisher, which offers all three plans.
     * Since offer v2 (2026-10) Basic and Pro carry their prices, as the page
     * does; Growth never does (offer-copy.ts). */
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
            itemListElement: OFFER_CATALOG_ITEMS,
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
        description: GROWTH_PANEL.description,
        url: 'https://www.prompthealth.ca' + GROWTH_PANEL.link,
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

  
  ngOnDestroy() {
    this._jsonLdService.removeJsonLd();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/* Offer v2 (2026-10): what each membership gives, in Hedieh's own words from
 * her copy. These described the old free video interview, which no plan
 * includes any more. */
const features = [
  {
    icon: "user-check-outline",
    title: "Get Found Online",
    content:
      "A provider profile on a trusted health platform: a place for patients to find you on Google and AI search.",
  },
  {
    icon: "file",
    title: "Share Your Expertise",
    content:
      "Publish articles in the PromptHealth community. Each article links back to your clinic's website.",
  },
  {
    icon: "video-library",
    title: "Video That Builds Trust",
    content:
      "Learn to make your own videos with PromptHealth Pro, or let us film and produce them for you with PromptHealth Growth.",
  },
];

const faqs: IFAQItem[] = [
  {
    q: "What do I get with PromptHealth Basic?",
    a: `It's free:
      <ul>
        <li>A provider profile on a trusted health platform, where patients can find you online</li>
        <li>Articles in the PromptHealth community, each linking back to your clinic's website</li>
        <li>Free training videos for your team on social media and online presence</li>
      </ul>
    `,
    opened: false,
  },
  {
    q: "What is PromptHealth Pro?",
    a: `Our paid membership: your team gets a new video idea and post idea every week, with filming instructions and examples, plus trend alerts, a monthly "what's working now" update and a live session every three months. $149/month per clinic, for your whole team. Currently for dental clinics, and other healthcare practitioners can apply. Cancel anytime. <a href="/pro">See PromptHealth Pro</a>.`,
    opened: false,
  },
  {
    q: "Do I have to film anything myself?",
    a: `With PromptHealth Basic and Pro, your team creates the content, and we give you the tools, training and ideas. With PromptHealth Growth, we film and produce it for you.`,
    opened: false,
  },
  {
    q: "What is PromptHealth Growth?",
    a: `Our done-for-you plan, by application only: we film at your practice every three months, coach your team on camera, and post 4 edited videos a month for you. It's currently available for dental practices, and other healthcare practitioners can apply. <a href="/for-dentists">See how it works</a>.`,
    opened: false,
  },
  {
    q: "How do I get started?",
    a: "Click <strong>Create Your Free Profile</strong>, complete the brief onboarding, and start building your visibility on PromptHealth.",
    opened: false,
  },
];
