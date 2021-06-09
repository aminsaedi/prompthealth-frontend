import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared/services/shared.service';
import { HeaderStatusService } from '../shared/services/header-status.service';
import { environment } from 'src/environments/environment';
// import { Partner } from '../models/partner';
// import { PartnerSearchFilterQuery } from '../models/partner-search-filter-query';
import { UniversalService } from '../shared/services/universal.service';
import { Category, CategoryService, SubCategory } from '../shared/services/category.service';
import { IFormItemSearchData } from '../models/form-item-search-data';
import { IUserDetail } from '../models/user-detail';
import { expandVerticalAnimation } from '../_helpers/animations';
import { Professional } from '../models/professional';
import { CityId, getLabelByCityId } from '../_helpers/location-data';

/** for event bright */
// declare function registerEvent(eventId, action): void;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [expandVerticalAnimation],
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private _catService: CategoryService,
    // private formBuilder: FormBuilder, /** NO NEED */
    private _sharedService: SharedService,
    private _headerStatusService: HeaderStatusService,
    // private toastr: ToastrService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
    // _el: ElementRef,
  ) {
    // this.elHost = _el.nativeElement;
  }

    ////// NEW  
    public practitionersFeatured: Professional[];
    public citiesFeatured: {id: CityId, label: string}[];

    categoryIcon(cat: Category): string {
      const img = cat.image;
      const img2 = img.toLowerCase().replace(/_/g, '-').replace('.png', '');
      return img2
    }
    subCategoriesString(parent: Category) {
      const categories = [];
      parent.subCategory.forEach(sub => {categories.push(sub.item_text); });
      return categories.join(' / ');
    }

    public categories: Category[];
    public idxTargetSubcategoryInjector: number = null;
    public idxSelectedCategory: number = null;
    private _timerSubcategory: any = null    

    onTapMainCategory(i: number) {
      /** if main category is selected and same main category is clicked, hide subcategory */
      if(this.idxSelectedCategory === i) {
        this.hideSubcategory();
      }
      /** if no main category is selected, show subcategory */
      else if (this.idxSelectedCategory === null) {
        this.showSubcategory(i);
      }
      /** if main category is selected and another main category is clicked, hide current subcategory and then show new subcategory */
      else {
        clearTimeout(this._timerSubcategory);

        this.hideSubcategory();
        this._timerSubcategory = setTimeout(() => {
          this.showSubcategory(i);
          this._changeDetector.detectChanges();            
        }, 300);
      }
    }

    hideSubcategory() {
      this.idxSelectedCategory = null;
      this.idxTargetSubcategoryInjector = null;
    }

    showSubcategory(i: number) {
      this.idxSelectedCategory = i;
      const w = window.innerWidth || 320;
      const colnum = (w < 768) ? 1 : (w < 1200) ? 2 : 3;
      this.idxTargetSubcategoryInjector = (Math.floor(i / colnum) + 1) * colnum - 1;
    }

    changeHeaderShadowStatus(isShown: boolean) {
      console.log(isShown);
      if(isShown) {
        this._headerStatusService.showShadow();
      } else {
        this._headerStatusService.hideShadow();
      }
    }  
    ////// NEW END


  // get f() {
  //   return this.homeForm.controls;
  // } /** NO NEED */

  // @ViewChild('searchGlobal') 
  // public searchGlobalElementRef: ElementRef; /** NO NEED */

  // token = ''; /** NO NEED */
  // days: any; /** NO NEED */
  // hours: any; /** NO NEED */
  // minutes: any; /** NO NEED */
  // seconds: any; /** NO NEED */
  // private future: Date; /** NO NEED */
  // private futureString: string; /** NO NEED */
  // private message: string; /** NO NEED */
  // private geoCoder; /** NO NEED */
  // homeForm: FormGroup; /** NO NEED */
  // submitted = false; /** NO NEED */
  // roles = ''; /** NO NEED */
  // zipCodeSearched; /** NO NEED */
  // lat; /** NO NEED */
  // long; /** NO NEED */
  AWS_S3 = '';
  // _host = environment.config.BASE_URL; /** NO NEED */
  id: any;
  // showPersonalMatch = true; /** NO NEED */

  // private elHost: HTMLElement;

  introBannerItems = {
    '5eb1a4e199957471610e6ce8': {
      name: 'menwomen',
      bgImg: 'assets/img/rec_pictures/menwomen.png',
      thumbnail: 'assets/img/rec_pictures/menwomen-thumb.png',
      title: 'Women/Men\'s health',
      features: [],
      description: 'When it comes to hormones, there are gender specific services for you!'
    },
    '5eb1a4e199957471610e6ce5': {
      name: 'skin',
      bgImg: 'assets/img/rec_pictures/skinrejuv.png',
      thumbnail: 'assets/img/rec_pictures/skinrejuv-thumb.png',
      title: 'Skin rejuvenation',
      features: [],
      description: 'Whether it’s a relaxing facial or a total skin transformation, we’ve got you\
      covered.'
    },
    '5eb1a4e199957471610e6ce6': {
      name: 'immune',
      bgImg: 'assets/img/rec_pictures/immunesys.png',
      thumbnail: 'assets/img/rec_pictures/immunesys-thumb.png',
      title: 'Immune system and energy',
      features: [],
      description: 'Natural remedies, supplements, or energy healing… you’ve come\
      to the right place.'
    },
    '5eb1a4e199957471610e6ce2': {
      name: 'nutrition',
      bgImg: 'assets/img/rec_pictures/nutrition.png',
      thumbnail: 'assets/img/rec_pictures/nutrition-thumb.png',
      title: 'Nutrition',
      features: [],
      description: 'It’s not always about weight management, sometimes we have a specific need when it\
      comes to our nutrition that needs to be fulfilled.'
    },

    '5eb1a4e199957471610e6ce0': {
      name: 'preventative',
      bgImg: 'assets/img/rec_pictures/preventative.png',
      thumbnail: 'assets/img/rec_pictures/preventative-thumb.png',
      title: 'Preventative health',
      features: [],
      description: 'This refers to your overall physical health, including medical, oral, hearing and vision'
    },
    '5eb1a4e199957471610e6ce4': {
      name: 'sleep',
      bgImg: 'assets/img/rec_pictures/sleep.png',
      thumbnail: 'assets/img/rec_pictures/sleep-thumb.png',
      title: 'Sleep',
      features: [],
      description: 'There are many different solutions for a better night\'s sleep, \
        whether it\'s a medical treetment or natural remedies, there\'s something for everyone.'
    },
    '5eb1a4e199957471610e6ce1': {
      name: 'mood',
      bgImg: 'assets/img/rec_pictures/mood.png',
      thumbnail: 'assets/img/rec_pictures/mood-thumb.png',
      title: 'Mood/mental health',
      features: [],
      description: 'Mental health is a big part of our overall well being, and there are many\
      different approaches to it.You don’t necessarily have to have a mood disorder, anyone can\
      benefit from motivation and mindfulness, and we encourage that.'
    },
    '5eb1a4e199957471610e6ce7': {
      name: 'painmanagement',
      bgImg: 'assets/img/rec_pictures/painmanagement.png',
      thumbnail: 'assets/img/rec_pictures/painmanagement-thumb.png',
      title: 'Pain management',
      features: [],
      description: 'There are many different practitioners offering solutions for pain management, and some are even more \
      specialized in certain areas.'
    },
    '5eb1a4e199957471610e6ce3': {
      name: 'fitness',
      bgImg: 'assets/img/rec_pictures/fitness.png',
      thumbnail: 'assets/img/rec_pictures/fitness-thumb.png',
      features: [],
      title: 'Fitness',
      description: 'We all have different needs ranging from strength training, aerobic, flexibility, cardio, \
      and we’ve got something for everyone'
    }
  };
  currentIntroIndex = '5eb1a4e199957471610e6ce8';

  allIntroBannerKeys = Object.keys(this.introBannerItems);
  currentKeyIndex = 0;
  howPhWorks = [
    {
      imgUrl: 'assets/img/how-ph-works/search.png',
      title: 'Search',
      body: 'To go broad, search by your goal, to be more particular, get a personal match, or if you already \
      know what you are looking for, search by treatment types.',
      remark: '**select <b class=\"text-green\"> by location</b> or <b class=\"text-orange\">remote</b>'
    },
    {
      imgUrl: 'assets/img/how-ph-works/filter.png',
      title: 'Filter',
      body: 'Apply filters to your search to narrow down the options in your geographic area. Choose to select\
       preferences such as experience \
      level, language, price, specialization with age group, practitioner gender, and more! ',
    },
    {
      imgUrl: 'assets/img/how-ph-works/book.png',
      title: 'Compare',
      body: 'Do side by side comparisons and check out ratings and reviews written by both clients and other \
       health professionals in order to help you find the best practitioner or product.',
    },
    {
      imgUrl: 'assets/img/how-ph-works/session.png',
      title: 'Connect',
      body: 'Directly request a booking with your preferred availability. \
      Enjoy your treatment with relaxation and ease. Build your dashboard of providers and services \
      for future reference.',
    }
    // {
    //   imgUrl: 'assets/img/how-ph-works/book.png',
    //   title: 'Booking',
    //   body: 'Directly request a booking with your preferred availability.',
    // },
    // {
    //   imgUrl: 'assets/img/how-ph-works/session.png',
    //   title: 'Session',
    //   body: 'Enjoy your treatment with relaxation and ease. Build your dashboard of providers and services\
    //    for future reference.',
    // },
  ];
  // public homePageFeatures = {}; /** NO NEED */
  // public partnersFeatured: Partner[];

  private timerResize: any;
  public featuredImageData = {
    badgeSize: 20,
    borderWidthVerified: 3,
  };

  // private timerCarouselPartner: any; 
  public keepOriginalOrder = (a, b) => a.key;
  @HostListener('window:resize', ['$event']) windowResize(e: Event) {
    if (this.timerResize) { clearTimeout(this.timerResize); }
    this.timerResize = setTimeout(() => {
      if (window.innerWidth < 992) {
        this.featuredImageData.badgeSize = 35,
          this.featuredImageData.borderWidthVerified = 5;
      } else {
        this.featuredImageData.badgeSize = 30,
          this.featuredImageData.borderWidthVerified = 4;
      }
    }, 500);
  }
  // eventbriteCheckout(event) {
  //   registerEvent(146694387863, (res) => {
  //     // console.log(res);
  //   });
  // }
  async ngOnInit() {
    this._uService.setMeta(this.router.url, {
      title: 'PromptHealth | Your health and wellness personal assistant',
      description: 'Take control of your health with options tailored to you',
    });

    this._catService.getCategoryAsync().then((cats => {
      this.categories = cats;
    }));

    const cityIdsFeatured: CityId[] = ['toronto', 'vancouver', 'victoria', 'hamilton', 'richmond', 'burnaby', 'calgary', 'winnipeg'];
    const citiesFeatured: {id: CityId, label: string}[] = [];
    for(let id of cityIdsFeatured) {
      citiesFeatured.push({id: id, label: getLabelByCityId(id)});
    }
    this.citiesFeatured = citiesFeatured;

    const ls = this._uService.localStorage;
    this.AWS_S3 = environment.config.AWS_S3;
    // this.roles = ls.getItem('roles') ? ls.getItem('roles') : ''; /** NO NEED */
    ls.removeItem('searchedAddress');
    // this.token = ls.getItem('token'); /** NO NEED */
    // if (this.token) { /** NO NEED */
    //   if (this.roles === 'SP' || this.roles === 'C') {
    //     this.showPersonalMatch = false;
    //   } else {
    //     this.showPersonalMatch = true;
    //   }
    // }
    // this.homeForm = this.formBuilder.group({
    //   email: ['', [Validators.required, Validators.email]]
    // }); /** NO NEED */

    // this.getPartnersFeatured();
    // this.timer(); /** NO NEED */

    if (!this._uService.isServer) {
      await this.getHomePageFeatures(); /** need to reinstate after many practitioners buy addonPlan */
      this.getPractitionersFeatured(); /** temporary solition */
      this.id = setInterval(() => {
        // this.timer();
        this.currentKeyIndex = (this.currentKeyIndex + 1) % 9;
      }, 10000);
    }
  }

  /** need to reinstate after many practitioners buy addonPlan */
  getHomePageFeatures(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._sharedService.getNoAuth('/addonplans/get-featured', { roles: ['SP', 'C'] }).toPromise().then((res: any) => {
        res.data.forEach(item => {
          if (this.introBannerItems[item.category_id]) {
            this.introBannerItems[item.category_id].features.push(item);
          }
        });
        resolve(true);
      });  
    });
  }

  /** temporary solution to fill featured practitioners */
  getPractitionersFeatured() {
    this._sharedService.getNoAuth('user/get-paid-spc').subscribe((res: any) => {
      if (res.statusCode === 200) {
        const users: Professional[] = [];
        res.data.forEach((d: IUserDetail) => {
          users.push(new Professional(d._id, d));
        });
        this.practitionersFeatured = users;
      }
    }, (error) => { console.log(error); });
  }

  // async getPartnersFeatured() {
  //   return new Promise((resolve, reject) => {
  //     const query = new PartnerSearchFilterQuery({ featured: true, count: 7 });
  //     const path = 'partner/get-all';
  //     this._sharedService.postNoAuth(query.json, path).subscribe((res: any) => {
  //       if (res.statusCode == 200) {
  //         const partners = [];

  //         res.data.data.forEach((data: any) => {
  //           partners.push(new Partner(data));
  //         });

  //         this.partnersFeatured = partners;
  //         // this.startCarouselPartners();
  //         resolve(true);
  //       } else {
  //         reject(res.message);
  //       }
  //     }, error => {
  //       console.log(error);
  //       reject('There are some error please try after some time.');
  //     });
  //   });
  // }
  // startCarouselPartners() {
  //   if (this.timerCarouselPartner) { clearInterval(this.timerCarouselPartner); }

  //   const target = this.elHost.querySelector('#carousel-partner-1') as HTMLElement;
  //   const partners = target.querySelectorAll('.carousel-partner-item');
  //   this.timerCarouselPartner = setInterval(() => {
  //     // partners.forEach(p => {
  //     // });
  //     target.scrollBy(1, 0);
  //   }, 25);

  //   const target2 = this.elHost.querySelector('#carousel-partner-2') as HTMLElement;
  //   setTimeout(() => {
  //     const partner = target2.querySelector('.carousel-partner-item');
  //     const wPartner = partner.getBoundingClientRect().width;
  //     // console.log(wPartner);
  //     this.timerCarouselPartner = setInterval(() => {
  //       target2.scrollBy({ left: wPartner * ((window.innerWidth < 768) ? 2 : 4), behavior: 'smooth' });
  //     }, 5000);
  //   }, 1000);
  // }

  switchTab(selectedKey: string) {
    this.currentKeyIndex = this.allIntroBannerKeys.indexOf(selectedKey);
  }

  // findDoctor() { /** NO NEED */
  //   this.lat = 0 + this._uService.localStorage.getItem('ipLat');
  //   this.long = 0 + this._uService.localStorage.getItem('ipLong');
  //   this.router.navigate(['/doctor-filter'], { queryParams: { lat: this.lat, long: this.long } });
  // }

  // questionnaire() { /** NO NEED */
  //   if (this.token) {
  //     this.router.navigate(['/personal-match']);
  //   } else {
  //     this.router.navigate(['/personal-match']);
  //     // this.router.navigate(['auth/login/u']);
  //     // this.toastr.warning("Please login first.")
  //   }
  // }

  // submit() { /** NO NEED */
  //   // alert("here");

  //   this.submitted = true;
  //   const data = JSON.stringify(this.homeForm.value);

  //   // this._sharedService.loader('show');
  //   this._sharedService.contactus(data).subscribe(
  //     (res: any) => {
  //       // this._sharedService.loader('hide');
  //       if (res.success) {
  //         this.toastr.success(res.message);
  //         this.homeForm.reset();
  //         this.submitted = false;
  //       } else {
  //         this.toastr.error(res.message);
  //       }
  //     },
  //     error => {
  //       this.toastr.error('Please check your email id.');
  //       // this._sharedService.loader('hide');
  //     }
  //   );
  // }

  // timer() { /** NO NEED */
  //   const deadline = new Date('June 5, 2020 15:37:25').getTime();

  //   const now = new Date().getTime();
  //   const t = deadline - now;
  //   const days = Math.floor(t / (1000 * 60 * 60 * 24));
  //   const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //   const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
  //   const seconds = Math.floor((t % (1000 * 60)) / 1000);

  //   this.days = days;
  //   this.hours = hours;
  //   this.minutes = minutes;
  //   this.seconds = seconds;
  // }

  // learnMore() { /** NO NEED */
  //   if (this.token) {
  //     this.router.navigate(['plans']);
  //   } else {
  //     this.router.navigate(['plans']);
  //   }
  // }


  showMenu() {
    this._headerStatusService.showNavMenu();
  }
}
