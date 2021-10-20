import { Component, OnInit, HostListener, ChangeDetectorRef, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../shared/services/shared.service';
import { HeaderStatusService } from '../shared/services/header-status.service';
import { UniversalService } from '../shared/services/universal.service';
import { Category, CategoryService } from '../shared/services/category.service';
import { IUserDetail } from '../models/user-detail';
import { CategoryViewerController } from '../models/category-viewer-controller';
import { expandAllAnimation, expandVerticalAnimation, fadeAnimation, slideVerticalStaggerAnimation } from '../_helpers/animations';
import { Professional } from '../models/professional';
import { CityId, getLabelByCityId } from '../_helpers/location-data';
import { BlogSearchQuery, IBlogSearchResult } from '../models/blog-search-query';
import { Blog } from '../models/blog';
import { FeaturedExpertController } from '../models/featured-expert-controller';
import { smoothHorizontalScrolling } from '../_helpers/smooth-scroll';
import { environment } from 'src/environments/environment';
import { SocialPostSearchQuery } from '../models/social-post-search-query';
import { IGetSocialContentsByAuthorResult } from '../models/response-data';
import { SocialArticle } from '../models/social-article';
import { ProfileManagementService } from '../dashboard/profileManagement/profile-management.service';
import { ModalService } from '../shared/services/modal.service';

/** for event bright */
// declare function registerEvent(eventId, action): void;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [expandVerticalAnimation, expandAllAnimation, slideVerticalStaggerAnimation, fadeAnimation],
})
export class HomeComponent implements OnInit {

  get sizeL() { return window && window.innerWidth >= 992; }
  get planMenuData() { return planMenuData; }
  get user() { return this._profileService.profile; }
  get isLoggedIn(): boolean { return !!this.user; }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _catService: CategoryService,
    private _sharedService: SharedService,
    private _headerStatusService: HeaderStatusService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
  ) { }

  public isPlanMenuShown = false;
  public isSlideshowReady = false;

  public slideshow = [
    'slideshow-1.png',
    'slideshow-2.png',
    'slideshow-3.png',
    'slideshow-4.png',
    'slideshow-5.png',
    'slideshow-6.png',
  ];

  public slideshowReverse = [
    'slideshow-4.png',
    'slideshow-5.png',
    'slideshow-6.png',
    'slideshow-1.png',
    'slideshow-2.png',
    'slideshow-3.png',
  ];

  private timerResize: any = null;
  private previousScreenWidth: number = 0;
  
  @ViewChildren('slideshowItem') private slideshowItems: QueryList<ElementRef>; 
  @ViewChildren('slideshowReverseItem') private slideshowReverseItems: QueryList<ElementRef>; 


  @HostListener('window:resize', ['$event']) WindowResize(e: Event) {
    if(this.categories && window.innerWidth && window.innerWidth != this.previousScreenWidth) {
      this.previousScreenWidth = window.innerWidth;
      this.categoryController.disposeAll();
        
      if(this.timerResize) {
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
    if(isShown) {
      this._headerStatusService.showShadow();
    } else {
      this._headerStatusService.hideShadow();
    }
  }

  changeHeaderVisibility(isShown: boolean) {
    if(isShown) {
      this._headerStatusService.showHeader(true);
    } else {
      this._headerStatusService.hideHeader(true);
    }
  }

  ngOnDestroy() {
    this._headerStatusService.showHeader(false);
  }

  ngAfterViewInit() {
    if(!this._uService.isServer) {
      this.elExpertFinderScrollHorizontal.nativeElement.scrollTo({left: 10000});
    }

    if(this._uService.isBrowser){
      this.initSlideshow();
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
      title: 'PromptHealth | Your health and wellness personal assistant',
      description: 'Take control of your health with options tailored to you',
    });

    this._catService.getCategoryAsync().then((cats => {
      this.categories = cats;
      this.categoryController = new CategoryViewerController(this.categories);
    }));

    const cityIdsFeatured: CityId[] = ['toronto', 'vancouver', 'victoria', 'hamilton', 'richmond', 'burnaby', 'calgary', 'winnipeg'];
    const citiesFeatured: {id: CityId, label: string}[] = [];
    for(let id of cityIdsFeatured) {
      citiesFeatured.push({id: id, label: getLabelByCityId(id)});
    }
    this.citiesFeatured = citiesFeatured;

    this.getBlog();

    if (!this._uService.isServer) {
      // await this.getHomePageFeatures(); /** need to reinstate after many practitioners buy addonPlan */
      this.getPractitionersFeatured(); /** temporary solition */
    }

  }

  /** need to reinstate after many practitioners buy addonPlan */
  getHomePageFeatures(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._sharedService.getNoAuth('/addonplans/get-featured', { roles: ['SP', 'C'] }).toPromise().then((res: any) => {
        res.data.forEach(item => {
        });
        resolve(true);
      });  
    });
  }

  /** HEADER FOR HOMEPAGE */
  showMenuSm() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {menu: 'show'}});
  }

  onClickGetListed() {
    this.isPlanMenuShown = !this.isPlanMenuShown;
  }

  hidePlanMenu() {
    this.isPlanMenuShown = false;
  }

  onClickUserIcon() {
    this._modalService.show('user-menu', this.user);
  }

  initSlideshow() {
    if(this.slideshowItems.length > 0 && this.slideshowReverseItems.length > 0) {
      let currentDistance = 0;
      const distancePerMove = 0.2;

      setInterval(() => {
        currentDistance += distancePerMove;
        this.moveSlideshow(this.slideshowItems.toArray(), currentDistance, false);
        this.moveSlideshow(this.slideshowReverseItems.toArray(), currentDistance, true);
        this.isSlideshowReady = true;
      }, 30);  
    }
    
  }
 

  moveSlideshow(items: ElementRef[], distance: number  = 0, reverse: boolean = false) {
    let gap = 40;
    let totalLength = (items.length - 1) * gap;
    items.forEach((item, i) => {
      const el = item.nativeElement as HTMLDivElement;
      totalLength += this.sizeL ? el.clientHeight : el.clientWidth;
    });

    const distActual = distance % totalLength;


    let initialPosition = 0;
    items.forEach((item, i) => {
      const el = item.nativeElement as HTMLDivElement;

      let currentPosition = initialPosition - distActual;
      if(currentPosition < - (this.sizeL ? el.clientHeight : el.clientWidth)){
        currentPosition += totalLength + gap;
      }

      el.style.transform = `translate${this.sizeL ? 'Y' : 'X'}(${reverse ? -currentPosition : currentPosition}px)`;

      initialPosition += this.sizeL ? el.clientHeight : el.clientWidth;
      initialPosition += gap;
    });
  }
  /** HEADER FOR HOMEPAGE END */


  /** CATEGORIES */
  private categories: Category[];
  public categoryController: CategoryViewerController;
  /** CATEGORIES END */


  /** EXPERT FINDER */
  public featuredExpertController: FeaturedExpertController = new FeaturedExpertController();
  @ViewChild('expertFinderScrollHorizontal') private elExpertFinderScrollHorizontal: ElementRef;

  /** temporary solution to fill featured practitioners */
  getPractitionersFeatured() {
    this._sharedService.getNoAuth('user/get-paid-spc').subscribe((res: any) => {
      if (res.statusCode === 200) {
        const users: Professional[] = [];
        res.data.forEach((d: IUserDetail) => {
          users.push(new Professional(d._id, d));
        });
        this.featuredExpertController.addData(users);
      }
    }, (error) => { console.log(error); });
  }

  onEnterExpertFinder(isLeaving: boolean) {
    if(!isLeaving) {
      const el = this.elExpertFinderScrollHorizontal.nativeElement as HTMLElement;
      const start = el.scrollLeft;
      if(start > 0) {
        smoothHorizontalScrolling(el, Math.floor(start * 2 / 9), -start, start);
      }
    }
  }
  /** EXPERT FINDER END */

  /** TESTIMONIAL */
  public testimonials = [];
  public disabledAnimationTestimonials = false;

  onIntersectTestimonial(enter: boolean) {
    if(enter) {
      this.testimonials = testimonials;
      setTimeout(() => {
        this.disabledAnimationTestimonials = true;
      });
    } else {
      this.disabledAnimationTestimonials = false;
      this.testimonials = [];
    }
  }
  /** TESTIMONIAL END */


  /** COMMUNITY */
  public introductionPostType = introductionPostType;
  /** COMMUNITY END */

  /** APP */
  isAppFeatureSelected(index: number) {
    return this.selectedAppFeature === index;
  }
  get isAppFeatureLeftSelected() {
    return this.selectedAppFeature === 0 || (this.selectedAppFeature > 0 && this.selectedAppFeature < 3);
  }
  get isAppFeatureRightSelected() {
    return this.selectedAppFeature >= 3;
  }
  
  public appFeatureItems = appFeatureItems;
  public selectedAppFeature: number = null;
  public isOnAppFeature: boolean = false;
  @ViewChildren('appFeatureSwitcher') private appFeatureSwitchers: QueryList<ElementRef>;

  onIntersectAppFeature(enter: boolean) {
    this.isOnAppFeature = enter;
  }

  onIntersectAppFeatureItem(select: boolean, index: number) {
    if(this.isOnAppFeature) {
      if(select) {
        this.selectedAppFeature = index;
      } else if(index > 0) {
        this.selectedAppFeature = index - 1;
      } else {
        this.selectedAppFeature = null;
      }    
    } else {
      this.selectedAppFeature = null;
    }
  }
  
  onClickAppFeatureItem(index: number) {
    if(!this._uService.isServer) {
      let topEl = (this.appFeatureSwitchers.toArray()[index].nativeElement as HTMLDivElement).getBoundingClientRect().top;
      // if(this.selectedAppFeature > index)
      window.scrollTo({top: topEl + window.scrollY});
      setTimeout(() => {
        this.selectedAppFeature = index;
      }, 10)  
    }
  }
  /** APP END */

  /** CITIES */
  public citiesFeatured: {id: CityId, label: string}[];
  /** CITIES END */

  /** BLOGS */
  public blogs: Blog[];
  async getBlog() {
    const query = new SocialPostSearchQuery({count: 3, contentType: 'ARTICLE'});
    this._sharedService.getNoAuth('note/get-by-author/' + environment.config.idSA + query.toQueryParams()).subscribe((res: IGetSocialContentsByAuthorResult) => {
      if(res.statusCode === 200) {
        const blogs = [];
        res.data.forEach(d => {
          blogs.push(new SocialArticle(d));
        });
        this.blogs = blogs;
      } else {
        console.log(res.message);
        this.blogs = [];
      }
    }, (error) => {
      console.log(error);
      this.blogs= [];
    });
  }
  /** BLOGS END */
}

const appFeatureItems = [
  [
    {
      icon: 'verified-outline', 
      title: 'Find trusted wellness providers based on your personalized needs.',
      content: 'Do a personal match or use search filter options.',
    },
    {
      icon: 'checkbox-square-outline',
      title: 'Browse and learn from our content library.',
      content: 'View resources by category and filter by media type to find expert created content that matters to you.',
    },
    {
      icon: 'users-outline',
      title: 'Compare and book.',
      content: 'Read reviews and make informed decisions about your care.',
    }
  ],
  [
    {
      icon: 'book-open-outline',
      title: 'Stay connected with your favourite experts.',
      content: 'Appointment go well? Follow your provider’s page for updates and additional resources.',
    },
    {
      icon: 'tags-2-outline',
      title: 'Safe & Secure.',
      content: 'Your privacy and security is ensured.',
      // content: 'Your privacy and security is ensured. PIPEDA/HIPPA approved.',
    },
    {
      icon: 'shield-check-outline',
      title: 'COMING SOON: Discover select deals on recommended products.',
      content: 'Browse through wellness products recommended by the experts themselves.',
    }
  ],
]

const introductionPostType = {
  note: {
    icon: 'comment-2',
    color: 'bg-success',

    title: 'Notes',
    content: 'Quick health and wellness reads.',
  },
  event: {
    icon: 'calendar',
    color: 'bg-error',

    title: 'Events',
    content: 'Attend virtual or in-person events hosted by providers.',
  },
  article: {
    icon: 'file',
    color: 'bg-yellow',

    title: 'Articles',
    content: 'Dive deep into different topics.',
  },
  voice: {
    icon: 'mic',
    color: 'bg-primary',

    title: 'Voices',
    content: 'Get to know your provider before meeting with audio recordings.',
  },
  video: {
    icon: 'image-3',
    color: 'bg-secondary',

    title: 'Images',
    content: 'Easy to read content for visual learners.',
  }
}

const testimonials = [
  {
    // name: 'Gary Prihar',
    name: 'Move Health',
    location: 'Surrey, BC',
    profileId: '60074ebd998cd73c49680be9',
    image: '/assets/img/testimonial/movehealth.png',
    body: 'We are beyond pleased with our decision to partner with Prompt Health.  Their innovative approach to matching patients with health providers has helped accelerate our multi-disciplinary wellness business.',
    link: 'https://www.movehealthandwellness.com/',
    // numFollowers: 981,
    // numPosts: 96,
    // rating: 5,
  },
  {
    // name: 'Nikki Laframboise',
    name: 'Connect Health',
    location: 'Vancouver, BC',
    profileId: '6047dc101c38b73a74c11e51',
    image: '/assets/img/testimonial/connecthealth.png',
    body: 'Prompt Health has helped us immensely with our social media marketing while our team has been busy focusing on patient care. We really appreciate their help and all they have assisted us with since joining. -The Connect Health Team.',
    link: 'https://www.connecthealthcare.ca',
    // numFollowers: 143,
    // numPosts: 90,
    // rating: 5,
  },
  {
    name: 'Nourishme',
    location: 'Vancouver, BC',
    profileId: '60954a833f3c8b158749d053',
    image: '/assets/img/testimonial/nourishme.png',
    body: 'Prompt Health is a wonderful health tool to connect people with integrative and functional practitioners. We are excited to collaborate with them!',
    link: 'https://nourishme.ca',
    // numFollowers: 981,
    // numPosts: 96,
    // rating: 5,
  }
];

const planMenuData = [
  {
    title: 'Providers',
    text: 'List your practice, get discovered by potential clients, and network within the local health and wellness community.',
    link: '/plans',
    icon: 'verified',
  }, {
    title: 'Companies',
    text: 'Celine Spino loves to cook and dine out. But a few years ago',
    link: '/plans/product',
    icon: 'briefcase-2',
  }
];