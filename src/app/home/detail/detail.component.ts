import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MapsAPILoader } from '@agm/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { SharedService } from '../../shared/services/shared.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { EmbedVideoService } from 'ngx-embed-video';
import { Professional } from '../../models/professional';
import { QuestionnaireAnswer, QuestionnaireService, QuestionnaireMapProfilePractitioner } from '../../shared/services/questionnaire.service';
import { CategoryService, Category } from '../../shared/services/category.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BehaviorService } from '../../shared/services/behavior.service';
import { Subscription } from 'rxjs';
import { IUserDetail } from 'src/app/models/user-detail';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { DateTimeData, FormItemDatetimeComponent } from 'src/app/shared/form-item-datetime/form-item-datetime.component';


const expandTitleAnimation = trigger('expandTitle', [
  state('shrink', style({ height: '1.2em' })),
  state('expand', style({ height: 'auto' })),
  transition('shrink=>expand', animate('600ms ease', style({ height: '*' }))),
  transition('expand=>shrink', style({ height: '1.2em' }))
]);

const expandSubtitleAnimation = trigger('expandSubtitle', [
  state('shrink', style({ display: 'none' })),
  state('expand', style({ height: 'auto', display: 'block' })),
  transition('shrink=>expand', [
    style({ display: 'block', height: 0, opacity: 0 }),
    animate('600ms ease', style({ height: '*', opacity: 1 }))
  ]),
  transition('expand=>shrink', style({ display: 'none' }))
]);
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  animations: [expandTitleAnimation, expandSubtitleAnimation]
})
export class DetailComponent implements OnInit {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _map: MapsAPILoader,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _fb: FormBuilder,
    private _embedService: EmbedVideoService,
    private _headerService: HeaderStatusService,
    private _catService: CategoryService,
    private _bs: BehaviorService,
    private _uService: UniversalService,
    private _qService: QuestionnaireService,
    el: ElementRef,
  ) { this.host = el.nativeElement; }

  get f() { return this.bookingForm.controls; }

  @ViewChild('closebutton') closebutton;
  @ViewChild('loginModal') public loginModal: ModalDirective;

  /** for Tab */
  public indexTabItem = 0;
  public isTabSticked = false;

  /** for reviews */
  public indexSortReviews = 0;
  public ratingSorted = [];

  /** for about */
  public isExpandProfessionals = false;
  public products: string[]; /* array for products object at centre */
  public providerTypes: any[]; /* array for type of providers that the user offers */
  public treatmentModalities = []; /* array for treatment modalities the user offers */
  public services: string[]; /* array for service type that the user offers */

  public iframe: any = []; /* for videos view */
  public defaultVideoCount = 5;
  public countVideoShown: number = this.defaultVideoCount;
  private videoCountPerPage = 5;
  private category: Category[];

  /** professionals section */
  public isGettingProfessional = false;
  public isProfessionalsMoreExist = true;

  /** for booking */
  public bookingForm: FormGroup;
  public myId = '';
  public startDate: Date; /* used at booking form */
  public minDate: Date; /* used at booking form */
  public minDateTime: DateTimeData;
  // public timingSelectedValue = ''; /* used at booking form */
  public submitted = false; /* used for form verification */

  /** for general use */
  public userInfo: Professional = null;
  public isLoggedIn = false;
  private id: number;
  public questionnaires: QuestionnaireMapProfilePractitioner;
  private amenities: any[];
  private languageSet: QuestionnaireAnswer[]; /* used to populate languages that the professional can provide */
  private serviceDeliverySet: QuestionnaireAnswer[]; /* used to populate serviceDelivery that the professional can provide */
  private availabilitySet: QuestionnaireAnswer[]; /* used to populate availability when the professional is available */
  private ageRangeSet: QuestionnaireAnswer[] = ageRangeSet;
  private typeOfProvider: any[];
  private treatmentModality: any[];
  private healthStatus: any[];
  private host: HTMLElement;
  private loginSubscription: Subscription;

  @ViewChild(FormItemDatetimeComponent) formDateTimeComponent: FormItemDatetimeComponent;

  /** delete */
  roles; /** not used anywhere. can be deleted */
  public productSearch: ''; /* can be deleted */

  public isAmenityViewerShown = false;

  public isProductViewerShown = false;

  ngOnDestroy() {
    this._headerService.showHeader();
    this.loginSubscription.unsubscribe();
  }

  async ngOnInit(): Promise<void> {
    const now = new Date();
    // this.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
    // this.minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    this.minDateTime = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate() + 1,
      hour: 9,
      minute: 0
    };


    this.bookingForm = this._fb.group({
      name: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(/\S+/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(12),
        Validators.pattern(/^[0-9][0-9\-]+[0-9]$/)
      ]),
      bookingDateTime: new FormControl('', [Validators.required]),
      note: new FormControl('', [Validators.maxLength(250)])
    });

    this.loginSubscription = this._bs.getUserData().subscribe((user: any) => {
      this.roles = user.roles || '';
      this.myId = user._id || '';
      this.isLoggedIn = (user._id) ? true : false;
    });

    // this.category = await this._catService.getCategoryAsync();

    this._route.params.subscribe(async params => {
      this.id = params.id;

      const promiseAll = [
        this.getUserProfile(),
        // this.getProfileQuestion(),
        this.getAmenities(),
        // this.getCategoryServices()
      ];
      Promise.all(promiseAll).then(async () => {
        // this.userInfo.populate('languages', this.languageSet);
        // this.userInfo.populate('serviceDelivery', this.serviceDeliverySet);
        // this.userInfo.populate('availability', this.availabilitySet);
        // this.userInfo.setAmenities(this.amenities);
        // this.userInfo.populateService(this.category);
        // this.userInfo.populate('ageRange', this.ageRangeSet);
        // this.userInfo.setServiceCategory('typeOfProvider', this.typeOfProvider);
        // this.userInfo.setServiceCategory('treatmentModality', this.treatmentModality);
        // this.userInfo.setServiceCategory('healthStatus', this.healthStatus);

        this.questionnaires = await this._qService.getProfilePractitioner(this.userInfo.role as ('SP' | 'C'));

        this.userInfo.videos.forEach(v => {
          const ytIframeHtml = this._embedService.embed(v.url);
          ytIframeHtml.title = v.title;
          this.iframe.push(ytIframeHtml);
        });

        this.getEndosements();
        this.getProducts();
        this.getReviews();

        if (this.userInfo.isCentre) { this.getProfessionals(); }

        const typeOfProvider = this._qService.getSelectedLabel(this.questionnaires.typeOfProvider, this.userInfo.allServiceId);
        const serviceDelivery = this._qService.getSelectedLabel(this.questionnaires.serviceDelivery, this.userInfo.serviceOfferIds);

        this._uService.setMeta(this._router.url, {
          title: `${this.userInfo.name} in ${this.userInfo.city}, ${this.userInfo.state} | PromptHealth`,
          description: `${this.userInfo.name} is ${typeOfProvider.join(', ')} offering ${serviceDelivery.join(', ')}.`,
          pageType: 'article',
          image: this.userInfo.imageFull,
          imageType: this.userInfo.imageType,
          imageAlt: this.userInfo.name,
        });
      })
        .catch(err => {
          if (err && err.length > 0) {
            this._toastr.error(err);
          }
        })
        .finally(() => { this._sharedService.loader('hide'); });

      // this.getUserProfile();
      // this.getProfileQuestion();
    });
  }
  incBookingCount() {
    this._sharedService.post({ _id: this.userInfo.id }, '/booking/gain-booking-count');
  }
  getUserProfile(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `user/get-profile/${this.id}`;
      const incPageViewpath = `user/update-view-count`;
      this._sharedService.postNoAuth({ _id: this.id }, incPageViewpath).subscribe((res: any) => {
      });
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          if (res.data && res.data.length > 0) {
            const user: any = res.data[0];
            this.userInfo = new Professional(user._id, user);
            resolve(true);
          } else { reject('There are some error please try after some time.'); }
        } else { reject(res.message); }
      }, err => {
        console.log(err);
        reject('There are some error please try after some time.');
      });
    });
  }


  // getProfileQuestion(): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     const path = `questionare/get-profile-questions`;
  //     this._sharedService.getNoAuth(path).subscribe((res: any) => {
  //       if (res.statusCode === 200) {
  //         const questions = res.data;
  //         questions.forEach((e: any) => {
  //           console.log(e)
  //           if (e.question_type === 'service' && e.slug === 'offer-your-services') {
  //             this.serviceDeliverySet = e.answers;
  //           }
  //           if (e.question_type === 'service' && e.slug === 'languages-you-offer') {
  //             this.languageSet = e.answers;
  //           }
  //           if (e.question_type === 'availability') {
  //             this.availabilitySet = e.answers;
  //           }
  //         });
  //         resolve(true);
  //       } else { reject(res.message); }
  //     }, err => {
  //       console.log(err);
  //       reject('There are some error please try after some time.');
  //     });
  //   });
  // }

  getProducts() {
    this.products = [];

    this._sharedService.loader('show');
    const path = `product/get-all?userId=${this.id}&count=10&page=1&frontend=0/`;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.products = res.data.data;
        if (res.data.data) {
          this.userInfo.setProducts(res.data.data);
        }
        this._sharedService.loader('hide');

      } else {
        this._sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this._sharedService.loader('hide');
      this._sharedService.checkAccessToken(err);
    });

  }

  getAmenities(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `amenity/get-all/?userId=${this.id}&count=10&page=1&frontend=0`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.amenities = res.data.data;
          resolve(true);
        } else {
          this._sharedService.showAlert(res.message, 'alert-danger');
          reject();
        }
      }, (error) => {
        console.log(error);
        reject('There are some error please try after some time.');
      });
    });
  }

  getReviews() {

    const path = `booking/get-all-review?userId=${this.id}&count=10&page=1&search=/`;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200 && res.data.data.length > 0) {
        this.userInfo.setReviews(res.data.data);

      } else {
        this._sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this._sharedService.checkAccessToken(err);
    });
  }

  // getCategoryServices(): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     const path = `user/getService/${this.id}`;
  //     this._sharedService.getNoAuth(path).subscribe((res: any) => {

  //       if (res.statusCode === 200) {
  //         this.typeOfProvider = [];
  //         this.treatmentModality = [];
  //         this.healthStatus = [];

  //         res.data.forEach((e: any) => {
  //           console.log(e);
  //           switch (e.slug) {
  //             case 'providers-are-you': this.typeOfProvider.push(e); break;
  //             case 'treatment-modalities': this.treatmentModality.push(e); break;
  //             case 'who-are-your-customers': this.healthStatus.push(e); break;
  //             //            case 'your-goal-specialties': categories.service.push(e); break;
  //             //           case 'your-offerings': categories.serviceOffering.push(e); break;
  //           }
  //         });
  //         resolve(true);
  //       } else { reject('There are some error please try after some time.'); }
  //     }, (error) => {
  //       console.log(error);
  //       this._toastr.error('There are some error please try after some time.');
  //     });
  //   });

  // }

  getProfessionals() {
    // default count is 20
    const count = 4;
    const lenProfessional = this.userInfo.professionals.length || 0;
    const page = Math.floor(lenProfessional / count) + 1;

    const path = `staff/get-all?userId=${this.userInfo.id}&count=${count}&page=${page}&frontend=0/`;
    this.isGettingProfessional = true;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      this.isGettingProfessional = false;
      if (res.statusCode === 200) {
        const professionals = [];

        res.data.data.forEach((p: IUserDetail) => {
          professionals.push(new Professional(p.userId, p));
        });
        this.userInfo.setProfessionals(professionals);
        if (this.userInfo.professionals.length < page * count) { this.isProfessionalsMoreExist = false; }

      } else {
        this._sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this._sharedService.checkAccessToken(err);
    });
  }

  getEndosements() {
    this.userInfo.setEndosements(endosementsDummy);
    // todo: access to api and get real data
  }


  timingSelected(evt) {
    // this.timingSelectedValue = evt.target.value;
  }

  bookApointment() {
    this.submitted = true;
    if (this.bookingForm.invalid) {
      return;
    } else {

      const formData = {
        ...this.bookingForm.value,
      };
      const data = {
        drId: this.userInfo.id,
        customerId: this.myId,
        ...formData,
      };
      // data.timing = this.timingSelectedValue;
      data.phone = data.phone.toString();
      data.bookingDateTime = this.formDateTimeComponent.getFormattedValue().toString();
      this._sharedService.loader('show');
      const path = `booking/create`;
      this._sharedService.post(data, path).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {
          this._toastr.success(res.message);

          this.closebutton.nativeElement.click();
        } else {
          this._sharedService.showAlert(res.message, 'alert-danger');
        }
      }, (error) => {
        this._sharedService.loader('hide');
      });
    }
  }

  changeStickyStatusTabbar(isSticked: boolean) {
    if (isSticked) { this._headerService.hideHeader(); } else { this._headerService.showHeader(); }
    this.isTabSticked = isSticked;
  }

  // filterProfessionals(isExpandForcibly?: boolean){
  //   if(!this.professionals){ return; }

  //   if(typeof isExpandForcibly != 'boolean'){
  //     this.isExpandProfessionals = !this.isExpandProfessionals;
  //   }

  //   var pros = [];
  //   if(this.isExpandProfessionals){
  //     pros = this.professionals;
  //   }else{
  //     for(var i=0; i<this.professionals.length; i++){
  //       pros.push(this.professionals[i]);
  //       if(i >= 2){ break; }
  //     }
  //   }
  //   this.professionalsFiltered = pros;
  //   return;
  // }

  showMoreVideo() {
    const count = this.countVideoShown + this.videoCountPerPage;
    if (count > this.iframe.length) { }
    this.countVideoShown = (count > this.iframe.length) ? this.iframe.length : count;
  }

  showLessVideo() {
    this.countVideoShown = this.defaultVideoCount;
  }

  changeTabTo(i: number) {
    if (this.userInfo) {
      this.indexTabItem = i;
      const banner = this.host.querySelector('.banner');
      const rect = banner.getBoundingClientRect();
      window.scrollBy({ top: rect.top + rect.height, left: 0, behavior: 'smooth' });

      this._map.load().then(() => {
        this.userInfo.setGoogleReviews();
      });
    }
  }


  sortReviewsBy(i: number) {
    this.indexSortReviews = i;
    this.userInfo.sortReviewBy(i);
  }

  toggleExpandProfessionalDesc() { this.isExpandProfessionals = !this.isExpandProfessionals; }
  openAmenityViewer() { this.isAmenityViewerShown = true; }
  closeAmenityViewer() { this.isAmenityViewerShown = false; }
  openProductViewer() { this.isProductViewerShown = true; }
  closeProductViewer() { this.isProductViewerShown = false; }

  countupSocial(type: string) {
    const data = {
      _id: this.userInfo.id,
      type,
    };
    // console.log(type);
    this._sharedService.postNoAuth(data, 'user/update-social-count').subscribe(res => {
      // console.log(res);
    });
  }

  onChangeLoginState(state: string) {
    if (state == 'done') {
      this.loginModal.hide();
    }
  }
}


const endosementsDummy = [
  {
    _id: '',
    name: 'Modern Mint',
    rate: 4.3,
    images: [],
    desc: 'this vegan product is great for blablabla Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque'
  },
  {
    _id: '',
    name: 'Modern Mint',
    rate: 1.53,
    images: [],
    desc: 'this vegan product is great for blablabla Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque'
  }
];

const reviewsDummy = [
  {
    _id: '',
    name: 'Justin Timber',
    desc: 'I am an energetic & enthusiasm person, I have my passionate in fitness industry, I like to motivate peoples to have active living because I believe that exercises can helps human beings lives healthy, lower the risks in getting chronic diseases. Less suffers from diseases, enjoy the life.',
    rate: 2,
    updatedAt: new Date('2019-12-25T00:17:01.924Z'),
  },
  {
    _id: '',
    name: 'Justin Timber',
    desc: 'I am an energetic & enthusiasm person, I have my passionate in fitness industry, I like to motivate peoples to have active living because I believe that exercises can helps human beings lives healthy, lower the risks in getting chronic diseases. Less suffers from diseases, enjoy the life.',
    rate: 5,
    updatedAt: new Date('2018-12-25T00:17:01.924Z'),
  },
  {
    _id: '',
    name: 'Justin Timber',
    desc: 'I am an energetic & enthusiasm person, I have my passionate in fitness industry, I like to motivate peoples to have active living because I believe that exercises can helps human beings lives healthy, lower the risks in getting chronic diseases. Less suffers from diseases, enjoy the life.',
    rate: 4,
    updatedAt: new Date('2027-12-25T00:17:01.924Z'),
  }
];

const ageRangeSet: QuestionnaireAnswer[] = [
  { _id: '5eb1a4e199957471610e6cd7', item_text: 'Not Critical' },
  { _id: '5eb1a4e199957471610e6cd8', item_text: 'Child (<12)' },
  { _id: '5eb1a4e199957471610e6cd9', item_text: 'Adolescent (12-18)' },
  { _id: '5eb1a4e199957471610e6cda', item_text: 'Adult (18+)' },
  { _id: '5eb1a4e199957471610e6cdb', item_text: 'Senior (>64)' },
];
