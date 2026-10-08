import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { Router } from "@angular/router";
import { SharedService } from "../shared/services/shared.service";
import { HeaderStatusService } from "../shared/services/header-status.service";
import { UniversalService } from "../shared/services/universal.service";
import { Category, CategoryService } from "../shared/services/category.service";
import { IUserDetail } from "../models/user-detail";
import { CategoryViewerController } from "../models/category-viewer-controller";
import {
  expandAllAnimation,
  expandVerticalAnimation,
  fadeAnimation,
  slideVerticalStaggerAnimation,
} from "../_helpers/animations";
import { Professional } from "../models/professional";
import { CityId, getLabelByCityId } from "../_helpers/location-data";
import { Blog } from "../models/blog";
import { FeaturedExpertController } from "../models/featured-expert-controller";
import { smoothHorizontalScrolling } from "../_helpers/smooth-scroll";
import { slugify } from "../_helpers/slugify";
import { SocialPostSearchQuery } from "../models/social-post-search-query";
import { IGetSocialContentsResult } from "../models/response-data";
import { SocialArticle } from "../models/social-article";
import { ProfileManagementService } from "../shared/services/profile-management.service";
import { ModalService } from "../shared/services/modal.service";
import { getListedMenu } from "../_helpers/get-listed-menu";
import { JsonLdService } from "../shared/services/json-ld.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** for event bright */
// declare function registerEvent(eventId, action): void;

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  animations: [
    expandVerticalAnimation,
    expandAllAnimation,
    slideVerticalStaggerAnimation,
    fadeAnimation,
  ],
})
export class HomeComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();
  slugify = slugify;

  get sizeL() {
    return window && window.innerWidth >= 992;
  }
  get planMenuData() {
    return getListedMenu;
  }
  get user() {
    return this._profileService.profile;
  }
  get isLoggedIn(): boolean {
    return !!this.user;
  }
  get isBrowser(): boolean {
    return this._uService.isBrowser;
  }

  constructor(
    private _router: Router,
    private _catService: CategoryService,
    private _sharedService: SharedService,
    private _headerStatusService: HeaderStatusService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
    private _jsonLdService: JsonLdService
  ) {}

  public isPlanMenuShown = false;
  public isSlideshowReady = false;

  /* Three of Hedieh's dental clinic photos (2026-10-07) between three of the
   * wellness ones, so the site does not read as dental only. The yoga,
   * meditation and workout slides made way: they were the furthest from a
   * page that now opens "For Healthcare Professionals". The new slides are
   * twice the slot's 377x470, versioned because /assets is cached for a
   * year. */
  public slideshow: { src: string; alt: string }[] = [
    { src: "slideshow-dental-1.v1.webp", alt: "Dentist in a treatment room beside the dental chair" },
    { src: "slideshow-4.webp", alt: "Acupuncture treatment" },
    { src: "slideshow-dental-2.v1.webp", alt: "Dentist examining a patient" },
    { src: "slideshow-5.webp", alt: "Massage therapist treating a client" },
    { src: "slideshow-dental-3.v1.webp", alt: "Dentist working with a dental microscope" },
    { src: "slideshow-6.webp", alt: "Practitioner talking with a client" },
  ];

  public slideshowReverse = this.slideshow.slice().reverse();

  private timerResize: any = null;
  private previousScreenWidth: number = 0;

  @ViewChildren("slideshowItem") private slideshowItems: QueryList<ElementRef>;
  @ViewChildren("slideshowReverseItem")
  private slideshowReverseItems: QueryList<ElementRef>;

  @HostListener("window:resize", ["$event"]) WindowResize(e: Event) {
    if (
      this.categories &&
      window.innerWidth &&
      window.innerWidth != this.previousScreenWidth
    ) {
      this.previousScreenWidth = window.innerWidth;
      this.categoryController.disposeAll();

      if (this.timerResize) {
        clearTimeout(this.timerResize);
      }

      this.timerResize = setTimeout(() => {
        this.categoryController = new CategoryViewerController(this.categories);
        this.featuredExpertController.initLayout();
        this._changeDetector.detectChanges();
      }, 500);
    }
  }

  changeHeaderShadowStatus(isShown: boolean) {
    if (isShown) {
      this._headerStatusService.showShadow();
    } else {
      this._headerStatusService.hideShadow();
    }
  }

  onIntersectCategory(isShown: boolean) {
    if (isShown) {
      this._headerStatusService.showHeader(true);
    } else {
      this._headerStatusService.hideHeader(true);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._headerStatusService.showHeader(false);
    this._jsonLdService.removeJsonLd();
  }

  ngAfterViewInit() {
    if (!this._uService.isServer) {
      this.elExpertFinderScrollHorizontal.nativeElement.scrollTo({
        left: 10000,
      });
    }
  }

  // eventbriteCheckout(event) {
  //   registerEvent(146694387863, (res) => {
  //     // console.log(res);
  //   });
  // }

  ngOnInit() {
    this._headerStatusService.hideHeader();

    this._uService.setMeta(this._router.url, {
      title: "Find a Practitioner Near You | PromptHealth",
      description: "Search trusted healthcare providers by specialty, watch expert videos, and connect with wellness professionals. Browse practitioners in your area on PromptHealth.",
    });

    // SEO-064: emit homepage schemas as a single @graph so crawlers see one
    // linked graph instead of three loose top-level nodes that some SEO
    // tools report as "duplicate" Organization / WebSite blocks.
    this._jsonLdService.setJsonLd({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.prompthealth.ca/#organization",
          "name": "PromptHealth",
          "url": "https://www.prompthealth.ca",
          "logo": { "@type": "ImageObject", "url": "https://www.prompthealth.ca/assets/img/prompthealth.png", "width": 800, "height": 350 },
          "description": "PromptHealth is Canada's leading integrative health platform connecting patients with 600+ healthcare and wellness practitioners across 20 cities in 4 provinces (BC, ON, AB, MB). Search by specialty, location, and delivery method to discover naturopaths, physiotherapists, dentists, psychologists, and 50+ other practitioner types, read expert health content, and book appointments online.",
          "foundingDate": "2020",
          "areaServed": { "@type": "Country", "name": "Canada" },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "support@prompthealth.ca",
            "areaServed": "CA",
            "availableLanguage": "English"
          },
          "sameAs": [
            "https://www.youtube.com/@prompthealth",
            "https://www.instagram.com/prompthealth",
            "https://www.tiktok.com/@prompthealth",
            "https://www.linkedin.com/company/prompthealth/",
            "https://www.facebook.com/PromptHealth/"
          ]
        },
        {
          "@type": "WebSite",
          "@id": "https://www.prompthealth.ca/#website",
          "name": "PromptHealth",
          "url": "https://www.prompthealth.ca",
          "description": "Find a practitioner near you. Search by specialty, location, or topic.",
          "publisher": { "@id": "https://www.prompthealth.ca/#organization" },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.prompthealth.ca/practitioners?keyword={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "WebPage",
          "@id": "https://www.prompthealth.ca/#webpage",
          "name": "Find a Practitioner Near You",
          "description": "Search trusted healthcare providers by specialty, watch expert videos, and connect with wellness professionals.",
          "url": "https://www.prompthealth.ca",
          "isPartOf": { "@id": "https://www.prompthealth.ca/#website" },
          "about": {
            "@type": "MedicalBusiness",
            "name": "PromptHealth",
            "description": "A wellness discovery platform connecting patients with trusted healthcare providers through content, video, and AI search.",
            "url": "https://www.prompthealth.ca"
          }
        }
      ]
    });

    this._catService.getCategoryAsync().then((cats) => {
      /* Unset when the request failed, and the controller cannot take that:
       * the section stays empty instead of throwing. */
      if (!Array.isArray(cats)) { return; }
      this.categories = oralCareFirst(cats);
      this.categoryController = new CategoryViewerController(this.categories);
    });

    const cityIdsFeatured: CityId[] = [
      "toronto",
      "vancouver",
      "victoria",
      "hamilton",
      "richmond",
      "burnaby",
      "calgary",
      "winnipeg",
    ];
    const citiesFeatured: { id: CityId; label: string }[] = [];
    for (let id of cityIdsFeatured) {
      citiesFeatured.push({ id: id, label: getLabelByCityId(id) });
    }
    this.citiesFeatured = citiesFeatured;

    this.getBlog();

    if (this._uService.isBrowser) {
      // await this.getHomePageFeatures(); /** need to reinstate after many practitioners buy addonPlan */
      this.getPractitionersFeatured(); /** temporary solition */
    }
  }

  /** need to reinstate after many practitioners buy addonPlan */
  getHomePageFeatures(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._sharedService
        .getNoAuth("/addonplans/get-featured", { roles: ["SP", "C"] })
        .toPromise()
        .then((res: any) => {
          res.data.forEach((item) => {});
          resolve(true);
        });
    });
  }

  /** HEADER FOR HOMEPAGE */
  showMenuSm() {
    /* Kept the rest of the query, and built from the address the reader sees,
     * for the reasons in the theme header's showMenuSm. */
    const [path, queryParams] = this._modalService.currentPathAndQueryParams;
    queryParams.menu = "show";
    this._router.navigate([path], { queryParams: queryParams });
  }

  onClickGetListed() {
    this.isPlanMenuShown = !this.isPlanMenuShown;
  }

  hidePlanMenu() {
    this.isPlanMenuShown = false;
  }

  onClickUserIcon() {
    this._modalService.show("user-menu", this.user);
  }

  /* The hero's "Find one near you". Scrolled here rather than left to the
   * #fragment, which the router would treat as a navigation and which would
   * stay in the address. The href is for a reader without script. */
  scrollToDirectory(event: Event) {
    const el = this._uService.isBrowser ? document.getElementById("find-a-practitioner") : null;
    if (!el) { return; }
    event.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // initSlideshow() {
  // if(this.slideshowItems.length > 0 && this.slideshowReverseItems.length > 0) {
  //   let currentDistance = 0;
  //   const distancePerMove = 0.2;

  //   setInterval(() => {
  //     currentDistance += distancePerMove;
  //     this.moveSlideshow(this.slideshowItems.toArray(), currentDistance, false);
  //     this.moveSlideshow(this.slideshowReverseItems.toArray(), currentDistance, true);
  //     this.isSlideshowReady = true;
  //   }, 30);
  // }

  // }

  // moveSlideshow(items: ElementRef[], distance: number  = 0, reverse: boolean = false) {
  //   let gap = 40;
  //   let totalLength = (items.length - 1) * gap;
  //   items.forEach((item, i) => {
  //     const el = item.nativeElement as HTMLDivElement;
  //     totalLength += this.sizeL ? el.clientHeight : el.clientWidth;
  //   });

  //   const distActual = distance % totalLength;

  //   let initialPosition = 0;
  //   items.forEach((item, i) => {
  //     const el = item.nativeElement as HTMLDivElement;

  //     let currentPosition = initialPosition - distActual;
  //     if(currentPosition < - (this.sizeL ? el.clientHeight : el.clientWidth)){
  //       currentPosition += totalLength + gap;
  //     }

  //     el.style.transform = `translate${this.sizeL ? 'Y' : 'X'}(${reverse ? -currentPosition : currentPosition}px)`;

  //     initialPosition += this.sizeL ? el.clientHeight : el.clientWidth;
  //     initialPosition += gap;
  //   });
  // }
  /** HEADER FOR HOMEPAGE END */

  /** CATEGORIES */
  private categories: Category[];
  public categoryController: CategoryViewerController;
  /** CATEGORIES END */

  /** EXPERT FINDER */
  public featuredExpertController: FeaturedExpertController =
    new FeaturedExpertController();
  @ViewChild("expertFinderScrollHorizontal")
  private elExpertFinderScrollHorizontal: ElementRef;

  /** temporary solution to fill featured practitioners */
  getPractitionersFeatured() {
    /* A failed call used to leave the twenty skeleton cards up for good. Now
     * it counts as nobody to feature, and the empty carousel is dropped. */
    this._sharedService.getNoAuth("user/get-paid-spc").pipe(takeUntil(this.destroy$)).subscribe(
      (res: any) => {
        if (res.statusCode === 200) {
          const users: Professional[] = [];
          res.data.forEach((d: IUserDetail) => {
            users.push(new Professional(d._id, d));
          });
          this.featuredExpertController.addData(users);
        } else {
          this.featuredExpertController.addData([]);
        }
      },
      (error) => {
        this.featuredExpertController.addData([]);
      }
    );
  }

  onEnterExpertFinder(isLeaving: boolean) {
    if (!isLeaving) {
      const el = this.elExpertFinderScrollHorizontal
        .nativeElement as HTMLElement;
      const start = el.scrollLeft;
      if (start > 0) {
        smoothHorizontalScrolling(
          el,
          Math.floor((start * 2) / 9),
          -start,
          start
        );
      }
    }
  }
  /** EXPERT FINDER END */

  /** TESTIMONIAL */
  public testimonials = testimonials;
  /** TESTIMONIAL END */

  /** COMMUNITY */
  public introductionPostType = introductionPostType;
  /** COMMUNITY END */

  /** CITIES */
  public citiesFeatured: { id: CityId; label: string }[];
  /** CITIES END */

  /** BLOGS */
  public blogs: Blog[];
  async getBlog() {
    /* The three newest approved articles by anyone. This used to ask for the
     * official account's own, and it stopped writing them in April 2026 while
     * articles kept being published on practitioners' behalf, so the section
     * stood still at April (her brief of 2026-10-07). note/filter is the
     * community feed's query: approved only, academy items excluded, newest
     * first. */
    const query = new SocialPostSearchQuery({
      count: 3,
      contentType: "ARTICLE",
    });
    this._sharedService
      .getNoAuth("note/filter" + query.toQueryParams())
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: IGetSocialContentsResult) => {
          if (res.statusCode === 200 && res.data && Array.isArray(res.data.data)) {
            const blogs = [];
            res.data.data.slice(0, 3).forEach((d) => {
              blogs.push(new SocialArticle(d));
            });
            this.blogs = blogs;
          } else {
            this.blogs = [];
          }
        },
        (error) => {
          this.blogs = [];
        }
      );
  }
  /** BLOGS END */
}

const introductionPostType = {
  note: {
    icon: "comment-2",
    color: "bg-success",

    title: "Notes",
    content: "Quick health and wellness reads.",
  },
  event: {
    icon: "calendar",
    color: "bg-error",

    title: "Events",
    content: "Attend virtual or in-person events hosted by providers.",
  },
  article: {
    icon: "file",
    color: "bg-yellow",

    title: "Articles",
    content: "Dive deep into different topics.",
  },
  voice: {
    icon: "mic",
    color: "bg-primary",

    title: "Voices",
    content: "Get to know your provider before meeting with audio recordings.",
  },
  video: {
    icon: "image-3",
    color: "bg-secondary",

    title: "Images",
    content: "Easy to read content for visual learners.",
  },
};

const testimonials = [
  {
    // name: 'Gary Prihar',
    name: "Move Health",
    location: "Surrey, BC",
    profileId: "60074ebd998cd73c49680be9",
    image: "/assets/img/testimonial/movehealth.png",
    body: "We are beyond pleased with our decision to partner with Prompt Health.  Their innovative approach to matching patients with health providers has helped accelerate our multi-disciplinary wellness business.",
    link: "https://www.movehealthandwellness.com/",
    // numFollowers: 981,
    // numPosts: 96,
    // rating: 5,
  },
  {
    // name: 'Nikki Laframboise',
    name: "Connect Health",
    location: "Vancouver, BC",
    profileId: "6047dc101c38b73a74c11e51",
    image: "/assets/img/testimonial/connecthealth.png",
    body: "Prompt Health has helped us immensely with our social media marketing while our team has been busy focusing on patient care. We really appreciate their help and all they have assisted us with since joining. -The Connect Health Team.",
    link: "https://www.connecthealthcare.ca",
    // numFollowers: 143,
    // numPosts: 90,
    // rating: 5,
  },
  {
    name: "Nourishme",
    location: "Vancouver, BC",
    profileId: "60954a833f3c8b158749d053",
    image: "/assets/img/testimonial/nourishme.png",
    body: "Prompt Health is a wonderful health tool to connect people with integrative and functional practitioners. We are excited to collaborate with them!",
    link: "https://nourishme.ca",
    // numFollowers: 981,
    // numPosts: 96,
    // rating: 5,
  },
];

/* Oral Care leads the categories (her brief of 2026-10-07); the rest keep the
 * order the API gives. A copy, because the list is the category service's own
 * and other pages show it as it comes. */
function oralCareFirst(cats: Category[]): Category[] {
  const i = cats.findIndex((c) => /^oral care$/i.test((c.item_text || "").trim()));
  return i <= 0 ? cats.slice() : [cats[i], ...cats.slice(0, i), ...cats.slice(i + 1)];
}
