import { Component, OnInit, ElementRef, ViewChild, NgZone, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../shared/services/shared.service';
import { HeaderStatusService } from '../shared/services/header-status.service';
import { environment } from 'src/environments/environment';
declare function registerEvent(eventId, action): void;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    // tslint:disable-next-line: variable-name
    private _sharedService: SharedService,
    private _headerStatusService: HeaderStatusService,
    private toastr: ToastrService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
  ) { }

  get f() {
    return this.homeForm.controls;
  }
  @ViewChild('searchGlobal')
  public searchGlobalElementRef: ElementRef;

  token = '';
  days: any;
  hours: any;
  minutes: any;
  seconds: any;
  private future: Date;
  private futureString: string;
  private message: string;
  private geoCoder;
  homeForm: FormGroup;
  submitted = false;
  roles = '';
  zipCodeSearched;
  lat;
  long;
  AWS_S3 = '';
  // _host = environment.config.BASE_URL;
  id: any;
  showPersonalMatch = true;

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
      imgUrl: 'assets/img/how-ph-works/compare.png',
      title: 'Compare',
      body: 'Do side by side comparisons and check out ratings and reviews written by both clients and other \
       health professionals in order to help you find the best practitioner or product.',
    },
    {
      imgUrl: 'assets/img/how-ph-works/book.png',
      title: 'Booking',
      body: 'Directly request a booking with your preferred availability.',
    },
    {
      imgUrl: 'assets/img/how-ph-works/session.png',
      title: 'Session',
      body: 'Enjoy your treatment with relaxation and ease. Build your dashboard of providers and services\
       for future reference.',
    },
  ];
  public homePageFeatures = {};
  public keepOriginalOrder = (a, b) => a.key;

  private timerResize: any;
  public featuredImageData = {
    badgeSize: 20,
    borderWidthVerified: 3,
  }
  @HostListener('window:resize', ['$event']) windowResize(e: Event) {
    if (this.timerResize) { clearTimeout(this.timerResize); }
    this.timerResize = setTimeout(() => {
      if (window.innerWidth < 992) {
        this.featuredImageData.badgeSize = 35,
          this.featuredImageData.borderWidthVerified = 5
      } else {
        this.featuredImageData.badgeSize = 30,
          this.featuredImageData.borderWidthVerified = 4
      }
    }, 500);
  }
  eventbriteCheckout(event) {
    registerEvent(146694387863, (res) => {
      console.log(res);
    })
  }
  ngOnInit() {
    this.AWS_S3 = environment.config.AWS_S3;
    this.roles = localStorage.getItem('roles') ? localStorage.getItem('roles') : '';
    localStorage.removeItem('searchedAddress');
    this.token = localStorage.getItem('token');
    if (this.token) {
      if (this.roles === 'SP' || this.roles === 'C') {
        this.showPersonalMatch = false;
      } else {
        this.showPersonalMatch = true;
      }
    }
    this.homeForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.getHomePageFeatures();
    this.timer();
    this.id = setInterval(() => {
      this.timer();
      this.currentKeyIndex = (this.currentKeyIndex + 1) % 9;
    }, 10000);
  }

  async getHomePageFeatures() {
    this._sharedService.getNoAuth('/addonplans/get-featured', { roles: ['SP', 'C'] }).toPromise().then((res: any) => {
      // console.log(res.data);
      res.data.forEach(item => {
        if (this.introBannerItems[item.category_id]) {
          this.introBannerItems[item.category_id].features.push(item);
        }
      });
    });

  }

  switchTab(selectedKey: string) {
    this.currentKeyIndex = this.allIntroBannerKeys.indexOf(selectedKey);
  }
  findDoctor() {
    this.lat = 0 + localStorage.getItem('ipLat');
    this.long = 0 + localStorage.getItem('ipLong');
    this.router.navigate(['/doctor-filter'], { queryParams: { lat: this.lat, long: this.long } });
  }
  questionnaire() {
    if (this.token) {
      this.router.navigate(['dashboard/questions/User']);
    } else {
      this.router.navigate(['dashboard/questions/User']);
      // this.router.navigate(['auth/login/u']);
      // this.toastr.warning("Please login first.")
    }
  }

  submit() {
    // alert("here");

    this.submitted = true;
    const data = JSON.stringify(this.homeForm.value);

    // this._sharedService.loader('show');
    this._sharedService.contactus(data).subscribe(
      (res: any) => {
        // this._sharedService.loader('hide');
        if (res.success) {
          this.toastr.success(res.message);
          this.homeForm.reset();
          this.submitted = false;
        } else {
          this.toastr.error(res.message);
        }
      },
      error => {
        this.toastr.error('Please check your email id.');
        // this._sharedService.loader('hide');
      }
    );
  }

  timer() {
    const deadline = new Date('June 5, 2020 15:37:25').getTime();

    const now = new Date().getTime();
    const t = deadline - now;
    const days = Math.floor(t / (1000 * 60 * 60 * 24));
    const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((t % (1000 * 60)) / 1000);

    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }

  learnMore() {
    if (this.token) {
      this.router.navigate(['dashboard/subscriptionplan']);
    } else {
      this.router.navigate(['subscriptionplan']);
    }
  }


  showMenu() {
    this._headerStatusService.showNavMenu();
  }
}
