import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild , OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription , Subject } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { GetReferralsQuery } from 'src/app/models/get-referrals-query';
import { Partner } from 'src/app/models/partner';
import { Professional } from 'src/app/models/professional';
import { IBellResult, IFollowResult, IGetBellStatusResult, IGetFollowStatusResult, IGetProfileResult, IGetStaffResult, IGetReferralsResult, IUnbellResult, IUnfollowResult, IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { SocialPostSearchQuery } from 'src/app/models/social-post-search-query';
import { IUserDetail } from 'src/app/models/user-detail';
import { FormItemDatetimeComponent } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { expandVerticalAnimation, slideInSocialProfileChildRouteAnimation } from 'src/app/_helpers/animations';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { smoothHorizontalScrolling } from 'src/app/_helpers/smooth-scroll';
import { TYPE_PRIORITY, lookupSpecialtySchema } from 'src/app/_helpers/specialty-schema-map';
import { environment } from 'src/environments/environment';
import { SocialService } from '../social.service';
import { BreadcrumbItem } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { filter, takeUntil } from 'rxjs/operators';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [slideInSocialProfileChildRouteAnimation, expandVerticalAnimation],
})
export class ProfileComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get sizeS() { return (!window || window.innerWidth < 768) ? true : false; }
  get sizeM() { return !this.sizeS && (window.innerWidth < 992) ? true : false; }
  get f() { return this.formBooking.controls; }
  get isProfileMyself() { return this.user && this.user._id == this.profileId; }
  get isProfilePH() { return this.profileId == environment.config.idSA; }
  get user() { return this._profileService.profile; }
  get loginStatus() { return this._profileService.loginStatus; }
  get questionnaires() { return this._qService.questionnaireOf('profilePractitioner') as QuestionnaireMapProfilePractitioner; }
  get countAvailablePromos(): number {
    const promos = this._socialService.promosOfUser(this.profileId);
    let count = 0;
    if(promos?.length > 0) {
      promos.forEach(p => {
        if(p.isAvailable) {
          count ++;
        }
      });
    }
    return count;
  }

  get canRecommend() {
    return this.profile && !this.isProfileMyself && this.user?.eligibleToRecommend && !this.user.recommendationsByMe.find(item => item.to == this.profile._id);
  }

  get pathToApp() {
    let path = '';
    if(this.profile?.isProvider) {
      path = 'provider/' + this.profile._id;
    }
    return path;
  }

  linkToChildRoute(link: string) {
    const slug = this.profile?.slug;
    const route = slug
      ? ['/practitioners', slug]
      : ['/community/profile', this.profileId];
    if(link) {
      route.push(link);
    }
    return route;
  }

  public profileId: string;
  public profile: Professional;
  public breadcrumbs: BreadcrumbItem[] = [];

  public profileMenus: IProfileMenuItem[] = [];
  public isFollowing = false;
  public isBelling = false;

  private formBooking: FormGroup;
  public submittedFormBooking = false;
  // public minDateTime: DateTimeData;
  public maxBookingNote = minmax.bookingNoteMax;

  public idxActiveRecommendationIndicator: number = 0;
  private timerRecommendationCarousel: any;
  
  public countPromoPerPage: number = 20;

  public isBellLoading = false;
  public isFollowLoading = false;
  public isBookingLoading: boolean = false;

  private subscriptionLoginStatus: Subscription;

  @ViewChild(FormItemDatetimeComponent) private formDateTimeComponent: FormItemDatetimeComponent;
  @ViewChild('modalBooking') private modalBooking: ModalComponent;
  @ViewChild('recommendationCarousel') private recommendationCarousel: ElementRef;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _sharedService: SharedService,
    private _socialService: SocialService,
    private _qService: QuestionnaireService,
    private _modalService: ModalService,
    private _toastr: ToastrService,
    private _profileService: ProfileManagementService,
    private _changeDetector: ChangeDetectorRef,
    private _uService: UniversalService,
    private _transferState: TransferState,
    private _jsonLdService: JsonLdService,
  ) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptionLoginStatus.unsubscribe();
    this._jsonLdService.removeJsonLd();
    if(this.timerRecommendationCarousel) {
      clearInterval(this.timerRecommendationCarousel);
    }
  }

  ngOnInit(): void {
    this.observeLoginStatus();

    // Update meta descriptions when navigating between profile sub-tabs.
    // Child route components may not re-initialize on tab switches, so the
    // parent must react to NavigationEnd to keep meta in sync.
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.setMetaForActiveTab();
    });

    // const now = new Date();
    // this.minDateTime = {
    //   year: now.getFullYear(), 
    //   month: now.getMonth() + 1, 
    //   day: now.getDate() + 1,
    //   hour: 9,
    //   minute: 0
    // };

    this.formBooking = new FormGroup({
      name: new FormControl('', validators.bookingName),
      email: new FormControl('', validators.bookingEmail),
      phone: new FormControl('', validators.bookingPhone),
      // bookingDateTime: new FormControl('', validators.bookingDateTime),
      note: new FormControl('', validators.bookingNote),
      isUrgent: new FormControl(false),
    });

    this._route.params.subscribe((param: {userid?: string, slug?: string}) => {
      if (param.slug) {
        // Slug-based route: check TransferState first (SSR-cached data)
        const slugStateKey = makeStateKey<any>('profile-slug-' + param.slug);
        const savedSlugProfile = this._transferState.get(slugStateKey, null);

        if (savedSlugProfile) {
          // Client-side hydration: reuse SSR-cached profile data
          this._transferState.remove(slugStateKey);
          const p = savedSlugProfile;
          this.profileId = p._id;
          this.checkFollowStatus();
          this.checkBellStatus();

          let professional: Professional | Partner;
          if (p.roles === 'P') {
            professional = new Partner(p);
          } else {
            professional = new Professional(p._id, p);
          }
          this._socialService.saveCacheProfile(professional);

          this.profile = professional;
          this.initRecommendation();
          this.initRecommendationByMe();
          this.setProfileMenu();
          this._socialService.setProfile(this.profile);
          this.setBreadcrumbs();
          this.setMetaForActiveTab();

          this.getQuestionnaire().then(() => {
            this.setMetaForActiveTab();
            if (this.profile.isSP && !this.profile.triedFetchingTeam) {
              this.fetchTeam();
            }
            if (this.profile.isP && !this._socialService.promosOfUser(this.profileId)) {
              this.fetchPromos();
            }
          });
        } else {
          // SSR or first load: fetch profile by slug
          this._sharedService.getNoAuth(`user/get-profile-by-slug/${param.slug}`).pipe(takeUntil(this.destroy$)).subscribe((res: IGetProfileResult) => {
            if (res.statusCode === 200) {
              const p = res.data;
              this.profileId = p._id;
              this.checkFollowStatus();
              this.checkBellStatus();

              // Save raw profile data to TransferState during SSR
              if (this._uService.isServer) {
                this._transferState.set(slugStateKey, p);
              }

              // Build Professional/Partner from the fetched data directly (no second API call)
              let professional: Professional | Partner;
              if (p.roles === 'P') {
                professional = new Partner(p);
              } else {
                professional = new Professional(p._id, p);
              }
              this._socialService.saveCacheProfile(professional);

              this.profile = professional;
              this.initRecommendation();
              this.initRecommendationByMe();
              this.setProfileMenu();
              this._socialService.setProfile(this.profile);
              this.setBreadcrumbs();
              this.setMetaForActiveTab();

              this.getQuestionnaire().then(() => {
                this.setMetaForActiveTab();
                if (this.profile.isSP && !this.profile.triedFetchingTeam) {
                  this.fetchTeam();
                }
                if (this.profile.isP && !this._socialService.promosOfUser(this.profileId)) {
                  this.fetchPromos();
                }
              });
            } else {
              this._router.navigate(['404'], {replaceUrl: true});
            }
          }, () => {
            this._router.navigate(['404'], {replaceUrl: true});
          });
        }
      } else {
        this.profileId = param.userid;
        this.checkFollowStatus();
        this.checkBellStatus();
        this.initProfile();
      }

      if(this.timerRecommendationCarousel) {
        clearInterval(this.timerRecommendationCarousel);
      }
    });
  }

  initProfile() {
    this._socialService.disposeProfile();
    this.countupProfileView();
    const profile = this._socialService.profileOf(this.profileId);
    if(profile) {
      this.profile = profile;
      this.initRecommendation();
      this.initRecommendationByMe();
      this.setProfileMenu();
      this._socialService.setProfile(this.profile);
      this.setMetaForActiveTab();
      this.setBreadcrumbs();
    } else {
      // Check TransferState for SSR-fetched profile data (prevents hydration CLS)
      const stateKey = makeStateKey<any>('profile-' + this.profileId);
      const savedProfile = this._transferState.get(stateKey, null);

      if (savedProfile) {
        this._transferState.remove(stateKey);
        const p = savedProfile;
        let professional: Professional | Partner;
        if (p.roles == 'P') {
          professional = new Partner(p);
        } else {
          professional = new Professional(p._id, p);
        }
        this._socialService.saveCacheProfile(professional);

        // Set profile synchronously BEFORE async calls to prevent CLS
        // This ensures *ngIf="profile" elements render on first paint, matching SSR output
        this.profile = professional;
        this.initRecommendation();
        this.initRecommendationByMe();
        this.setProfileMenu();
        this._socialService.setProfile(this.profile);
        this.setMetaForActiveTab();
        this.setBreadcrumbs();

        this.getQuestionnaire().then(() => {
          if (this.profile.isSP && !this.profile.triedFetchingTeam) {
            this.fetchTeam();
          }
          if (this.profile.isP && !this._socialService.promosOfUser(this.profileId)) {
            this.fetchPromos();
          }
        });
      } else {
        const promiseAll: [Promise<Professional>, Promise<QuestionnaireMapProfilePractitioner>] = [
          this.fetchProfile(this.profileId),
          this.getQuestionnaire(),
        ];

        Promise.all(promiseAll).then(async (vals) => {
          this.profile = vals[0];
          this.initRecommendation();
          this.initRecommendationByMe();
          this.setProfileMenu();
          this._socialService.setProfile(this.profile);

          this.setMetaForActiveTab();
          this.setBreadcrumbs();

          if(this.profile.isSP && !this.profile.triedFetchingTeam) {
            this.fetchTeam();
          }

          if(this.profile.isP && !this._socialService.promosOfUser(this.profileId)) {
            this.fetchPromos();
          }

        }, error => {
          this._router.navigate(['404'], {replaceUrl: true});
          this._toastr.error('Something went wrong.');
        });
      }
    }

  }

  initRecommendation() {
    this.idxActiveRecommendationIndicator = 0;

    if(!this.profile.doneInitRecommendations) {
      const query = new GetReferralsQuery({
        type: 'recommend',
        order: 'desc',
        sortBy: 'createdAt',
      });
      this._sharedService.getNoAuth('referral/get/' + this.profile._id + query.toQueryParamsString()).pipe(takeUntil(this.destroy$)).subscribe((res: IGetReferralsResult) => {
        if(res.statusCode == 200) {
          this.profile.setRecommendations(res.data);
        } else {
          this.profile.setRecommendations([]);
        }
      }, error => {
        this.profile.setRecommendations([]);
      }, () => {
        setTimeout(() => {
          this.startRecommendationCarousel();
        }, 300); 
      });
    } else {
      setTimeout(() => {
        this.startRecommendationCarousel();
      }, 300);
    }
  }

  initRecommendationByMe() {
    if(!this.profile.doneInitRecommendationsByMeToCompanies) {
      const queryCompany = new GetReferralsQuery({
        type: 'recommend',
        roles: ['P'],
        count: 3,
      });
      this._sharedService.getNoAuth('referral/get-by/' + this.profile._id + queryCompany.toQueryParamsString()).pipe(takeUntil(this.destroy$)).subscribe((res: IGetReferralsResult) => {
        if(res.statusCode == 200) {
          this.profile.setRecommendationsByMeToCompanies(res.data);
        } else {
          this.profile.setRecommendationsByMeToCompanies([]);
        }
      }, error => {
        this.profile.setRecommendationsByMeToCompanies([]);
      });
    }
    if(!this.profile.doneInitRecommendationsByMeToProviders) {
      const queryProvider = new GetReferralsQuery({
        type: 'recommend',
        roles: ['SP', 'C', 'SA'],
        count: 3,
      });
      this._sharedService.getNoAuth('referral/get-by/' + this.profile._id + queryProvider.toQueryParamsString()).pipe(takeUntil(this.destroy$)).subscribe((res: IGetReferralsResult) => {
        if(res.statusCode == 200) {
          this.profile.setRecommendationsByMeToProviders(res.data);
        } else {
          this.profile.setRecommendationsByMeToProviders([]);
        }
      }, error => {
        this.profile.setRecommendationsByMeToProviders([]);
      });
    }
  }

  startRecommendationCarousel(startAt: number = 0) {
    const el = this.recommendationCarousel ? this.recommendationCarousel.nativeElement as HTMLDivElement : null;   
    if(el && this.profile.recommendations && this.profile.recommendations.length > 1) {
      this.moveRecommendationCarousel(this.idxActiveRecommendationIndicator, startAt);

      this.timerRecommendationCarousel = setInterval(() => {
        const current = this.idxActiveRecommendationIndicator;
        const next = (this.idxActiveRecommendationIndicator + 1) % this.profile.recommendationsPreview.length;
        this.moveRecommendationCarousel(current, next);
        this._changeDetector.detectChanges();
      }, 8000);  
    } 
  }

  moveRecommendationCarousel(current: number, next: number) {
    const el = this.recommendationCarousel.nativeElement as HTMLDivElement;
    const wEl = el.getBoundingClientRect().width;

    this.idxActiveRecommendationIndicator = next;
    smoothHorizontalScrolling(el, 300, wEl * next - wEl * current, wEl * current);
  }

  onClickRecommendationCarouselIndicator(i: number) {
    if(this.timerRecommendationCarousel) {
      clearInterval(this.timerRecommendationCarousel);
    }
    this.startRecommendationCarousel(i);
  }

  countupProfileView() {
    this._sharedService.postNoAuth({_id: this.profileId}, 'user/update-view-count').pipe(takeUntil(this.destroy$)).subscribe(() => {});
  }

  setMetaForActiveTab() {
    if (!this.profile) {
      return;
    }

    const url = this._router.url.split('?')[0];
    const p = this.profile;
    const canonicalPath = this.getCanonicalPath(url);
    const imageMeta = {
      image: p.imageFull,
      imageType: p.imageType,
      imageAlt: p.name,
    };

    if (url.match(/\/event\/past/)) {
      this._uService.setMeta(canonicalPath, {
        title: `Past events from ${p.name} | PromptHealth Community`,
        description: `View past events and workshops hosted by ${p.name} on PromptHealth.`,
        ...imageMeta,
      });
    } else if (url.match(/\/event/)) {
      this._uService.setMeta(canonicalPath, {
        title: `Upcoming events from ${p.name} | PromptHealth Community`,
        description: `Browse upcoming healthcare events and workshops by ${p.name} on PromptHealth.`,
        ...imageMeta,
      });
    } else if (url.match(/\/service/)) {
      this._uService.setMeta(canonicalPath, {
        title: `Service by ${p.name} | PromptHealth Community`,
        description: `${p.name} offers healthcare services${p.city ? ' in ' + p.city : ''}. Browse available treatments and book an appointment on PromptHealth.`,
        ...imageMeta,
      });
    } else if (url.match(/\/feed/)) {
      this._uService.setMeta(canonicalPath, {
        title: `Contents from ${p.name} | PromptHealth Community`,
        description: `Read health articles, tips, and posts shared by ${p.name} on PromptHealth.`,
        ...imageMeta,
      });
    } else if (url.match(/\/review/)) {
      this._uService.setMeta(canonicalPath, {
        title: `${p.name} review | PromptHealth Community`,
        description: `Read patient reviews for ${p.name} on PromptHealth.` + (p.rating && p.ratingCount ? ` Rated ${p.rating}/5 based on ${p.ratingCount} reviews.` : ''),
        ...imageMeta,
      });
    } else if (url.match(/\/promotion/)) {
      this._uService.setMeta(canonicalPath, {
        title: `Special offers from ${p.name} | PromptHealth Community`,
        description: `View special offers and promotions from ${p.name} on PromptHealth.`,
        ...imageMeta,
      });
    } else {
      this.setMetaForAbout();
    }
  }

  private getCanonicalPath(url: string): string {
    const p = this.profile;
    if (p?.slug) {
      const slugIdx = url.indexOf(p.slug);
      if (slugIdx >= 0) {
        const subPath = url.substring(slugIdx + p.slug.length);
        return `/practitioners/${p.slug}${subPath}`;
      }
    }
    return url;
  }

  setMetaForAbout() {
    const url = this._router.url;
    if(!url.match('service|feed|review|promotion|event')) {
      if (!this.profile || !this.questionnaires?.typeOfProvider || !this.questionnaires?.serviceDelivery) {
        return;
      }
      const typeOfProvider = this._qService.getSelectedLabel(this.questionnaires.typeOfProvider, this.profile.allServiceId);
      const serviceDelivery = this._qService.getSelectedLabel(this.questionnaires.serviceDelivery, this.profile.serviceOfferIds);;
      const canonicalPath = this.profile?.slug ? `/practitioners/${this.profile.slug}` : this._router.url;
      this._uService.setMeta(canonicalPath, {
        title: `${this.profile.name}${this.profile.city || this.profile.state ? ` in ${[this.profile.city, this.profile.state].filter(Boolean).join(', ')}` : ''} | PromptHealth Community`,
        description: `${this.profile.name} is ${typeOfProvider.join(', ')} offering ${serviceDelivery.join(', ')}.`,
      });

      // Set structured data for AI and search engine discoverability
      const medicalSpecialties = this._qService.getSelectedMedicalSpecialties(this.questionnaires.typeOfProvider, this.profile.allServiceId);
      const treatmentModality = this.questionnaires?.treatmentModality
        ? this._qService.getSelectedLabel(this.questionnaires.treatmentModality, this.profile.allServiceId)
        : [];
      const customerHealth = this.questionnaires?.customerHealth
        ? this._qService.getSelectedLabel(this.questionnaires.customerHealth, this.profile.allServiceId)
        : [];
      const jsonLd = this.buildProfileJsonLd(typeOfProvider, serviceDelivery, medicalSpecialties, treatmentModality, customerHealth);
      if (jsonLd) {
        this._jsonLdService.setJsonLd(jsonLd);
      }
    }
  }

  buildProfileJsonLd(typeOfProvider: string[], serviceDelivery: string[], medicalSpecialties: string[] = [], treatmentModality: string[] = [], customerHealth: string[] = []): object[] | null {
    if (!this.profile) { return null; }

    const p = this.profile;
    const canonicalUrl = p.slug
      ? `https://www.prompthealth.ca/practitioners/${p.slug}`
      : `https://www.prompthealth.ca/community/profile/${p._id}`;

    const schemaTypeUrls = [...new Set(typeOfProvider.map(t => lookupSpecialtySchema(t)).filter(Boolean))];
    const primaryTypeUrl = TYPE_PRIORITY.find(t => schemaTypeUrls.includes(t)) || 'https://schema.org/ProfessionalService';
    const primaryTypeShort = primaryTypeUrl.replace('https://schema.org/', '');

    const cleanedHealth = [...new Set(customerHealth.filter(v => v.toLowerCase() !== 'not critical'))];

    // Build the main business/practitioner schema
    const mainSchema: any = {
      '@context': 'https://schema.org',
      '@type': p.isC ? 'MedicalBusiness' : primaryTypeShort,
      'name': p.name,
      'url': canonicalUrl,
      'description': `${p.name}${typeOfProvider.length ? ' is ' + typeOfProvider.join(', ') : ''}${p.city || p.state ? ' in ' + [p.city, p.state].filter(Boolean).join(', ') + ', Canada' : ''}.${treatmentModality.length ? ' Specializes in ' + treatmentModality.join(', ') + '.' : ''}${cleanedHealth.length ? ' Treats: ' + cleanedHealth.join(', ') + '.' : ''}${serviceDelivery.length ? ' Available ' + serviceDelivery.join(', ') + '.' : ''}`,
    };

    if (p.profileImageFull) {
      mainSchema.image = p.profileImageFull;
    }

    if (p.phone) {
      mainSchema.telephone = p.phone;
    }

    if (p.acceptInsurance) {
      const insVal = p.acceptInsurance;
      if (insVal === 'insurance' || insVal === 'both') {
        mainSchema.isAcceptingNewPatients = true;
      }
      const paymentMap: Record<string, string> = {
        'private': 'Private Pay',
        'insurance': 'Insurance',
        'both': 'Insurance, Private Pay',
      };
      if (paymentMap[insVal]) {
        mainSchema.paymentAccepted = paymentMap[insVal];
      }
    }

    if (p.website) {
      mainSchema.sameAs = p.website;
    }

    if (p.priceFull && p.priceFull !== 'N/A') {
      mainSchema.priceRange = p.priceFull + ' / hr';
    }

    // Address
    if (p.address || p.city || p.state) {
      mainSchema.address = {
        '@type': 'PostalAddress',
        ...(p.address ? { 'streetAddress': p.address } : {}),
        ...(p.city ? { 'addressLocality': p.city } : {}),
        ...(p.state ? { 'addressRegion': p.state } : {}),
        'addressCountry': 'CA',
      };
    }

    // Geo coordinates
    if (p.location && p.location[0] && p.location[1]) {
      mainSchema.geo = {
        '@type': 'GeoCoordinates',
        'latitude': p.location[1],
        'longitude': p.location[0],
      };
    }

    // Aggregate rating
    if (p.rating > 0 && p.ratingCount > 0) {
      mainSchema.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': p.rating,
        'reviewCount': p.ratingCount,
        'bestRating': 5,
        'worstRating': 1,
      };
    }

    // Additional structured properties
    if (schemaTypeUrls.length > 0) {
      mainSchema.additionalType = schemaTypeUrls;
    }

    if (medicalSpecialties.length > 0) {
      mainSchema['medicalSpecialty'] = medicalSpecialties;
    }

    if (serviceDelivery.length > 0 || typeOfProvider.length > 0) {
      mainSchema.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        'name': 'Services Offered',
        'itemListElement': [
          ...serviceDelivery.map(sd => ({
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': sd,
            }
          })),
          ...typeOfProvider.map(specialty => ({
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'MedicalTherapy',
              'name': specialty,
              'description': `${specialty} services offered by ${p.firstName} ${p.lastName}`,
            }
          })),
        ],
      };
    }

    if (p.bookingUrl) {
      mainSchema.potentialAction = {
        '@type': 'ReserveAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': p.bookingUrl,
        },
        'result': {
          '@type': 'Reservation',
          'name': `Booking with ${p.name}`,
        },
      };
    }

    // Languages spoken
    if (p.languagesId?.length > 0 && this.questionnaires?.language) {
      const languages = this._qService.getSelectedLabel(this.questionnaires.language, p.languagesId);
      if (languages.length > 0) {
        mainSchema.knowsLanguage = languages;
      }
    }

    // Credentials / certifications
    if (p.certification) {
      const credentials = p.certification.split(',').map(c => c.trim()).filter(c => c.length > 0);
      if (credentials.length > 0) {
        mainSchema.hasCredential = credentials.map(name => ({
          '@type': 'EducationalOccupationalCredential',
          'credentialCategory': 'board certification',
          'name': name,
        }));
      }
    }

    // Professional organizations
    if (p.organization) {
      const orgs = p.organization.split(',').map(o => o.trim()).filter(o => o.length > 0);
      if (orgs.length > 0) {
        mainSchema.memberOf = orgs.map(name => ({
          '@type': 'Organization',
          'name': name,
        }));
      }
    }

    // Typical availability
    if (p.availabilityIds?.length > 0 && this.questionnaires?.availability) {
      const availLabels = this._qService.getSelectedLabel(this.questionnaires.availability, p.availabilityIds);
      if (availLabels.length > 0) {
        mainSchema.additionalProperty = [
          ...(mainSchema.additionalProperty || []),
          {
            '@type': 'PropertyValue',
            'name': 'typicalAvailability',
            'value': availLabels.join(', '),
          },
        ];
      }
    }

    // Opening hours (structured schema.org OpeningHoursSpecification)
    const AVAILABILITY_HOURS_MAP: Record<string, { dayOfWeek: string[]; opens: string; closes: string }> = {
      '5eb1a4e199957471610e6d23': { // Between 9-5
        dayOfWeek: ['https://schema.org/Monday', 'https://schema.org/Tuesday', 'https://schema.org/Wednesday', 'https://schema.org/Thursday', 'https://schema.org/Friday'],
        opens: '09:00', closes: '17:00',
      },
      '5eb1a4e199957471610e6d22': { // Early morning
        dayOfWeek: ['https://schema.org/Monday', 'https://schema.org/Tuesday', 'https://schema.org/Wednesday', 'https://schema.org/Thursday', 'https://schema.org/Friday'],
        opens: '06:00', closes: '09:00',
      },
      '5eb1a4e199957471610e6d24': { // Evenings
        dayOfWeek: ['https://schema.org/Monday', 'https://schema.org/Tuesday', 'https://schema.org/Wednesday', 'https://schema.org/Thursday', 'https://schema.org/Friday'],
        opens: '17:00', closes: '21:00',
      },
      '5eb1a4e199957471610e6d25': { // Saturday
        dayOfWeek: ['https://schema.org/Saturday'],
        opens: '09:00', closes: '17:00',
      },
      '5eb1a4e199957471610e6d26': { // Sunday
        dayOfWeek: ['https://schema.org/Sunday'],
        opens: '09:00', closes: '17:00',
      },
    };
    if (p.availabilityIds?.length > 0) {
      const hoursSpecs = p.availabilityIds
        .filter(id => AVAILABILITY_HOURS_MAP[id])
        .map(id => {
          const h = AVAILABILITY_HOURS_MAP[id];
          return {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': h.dayOfWeek,
            'opens': h.opens,
            'closes': h.closes,
          };
        });
      if (hoursSpecs.length > 0) {
        mainSchema.openingHoursSpecification = hoursSpecs;
      }
    }

    // Audience / age groups served
    const AGE_RANGE_LABEL_MAP: Record<string, string> = {
      '5eb1a4e199957471610e6cd8': 'Child (<12)',
      '5eb1a4e199957471610e6cd9': 'Adolescent (12-18)',
      '5eb1a4e199957471610e6cda': 'Adult (18+)',
      '5eb1a4e199957471610e6cdb': 'Senior (>64)',
    };
    if (p.age_range?.length > 0) {
      const audienceEntries = p.age_range
        .map(id => AGE_RANGE_LABEL_MAP[id])
        .filter(label => !!label)
        .map(label => ({ '@type': 'PeopleAudience', 'audienceType': label }));
      if (audienceEntries.length > 0) {
        mainSchema.audience = audienceEntries;
      }
    }

    if (treatmentModality.length > 0) {
      mainSchema.additionalProperty = [
        ...(mainSchema.additionalProperty || []),
        {
          '@type': 'PropertyValue',
          'name': 'treatmentModality',
          'value': treatmentModality.join(', '),
        },
      ];
    }
    if (cleanedHealth.length > 0) {
      mainSchema.knowsAbout = cleanedHealth;
    }

    // Breadcrumb schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.prompthealth.ca' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Practitioners', 'item': 'https://www.prompthealth.ca/practitioners' },
        { '@type': 'ListItem', 'position': 3, 'name': p.name, 'item': canonicalUrl },
      ],
    };

    // FAQPage schema — practitioner-specific Q&A for AI discoverability
    const locationStr = [p.city, p.state].filter(Boolean).join(', ') || 'Canada';
    const primarySpecialty = typeOfProvider.length > 0 ? typeOfProvider[0] : null;
    const faqEntries: Array<{ q: string; a: string }> = [];

    if (primarySpecialty) {
      faqEntries.push({
        q: `What does ${p.name} specialize in?`,
        a: `${p.name} is ${typeOfProvider.join(', ')} based in ${locationStr}.${cleanedHealth.length ? ' They treat conditions including: ' + cleanedHealth.slice(0, 5).join(', ') + '.' : ''}${treatmentModality.length ? ' Treatment approaches include ' + treatmentModality.slice(0, 3).join(', ') + '.' : ''}`,
      });
    }

    if (serviceDelivery.length > 0) {
      faqEntries.push({
        q: `Does ${p.name} offer virtual or online appointments?`,
        a: serviceDelivery.some(s => /virtual|online/i.test(s))
          ? `Yes, ${p.name} offers virtual appointments${serviceDelivery.some(s => /in.person/i.test(s)) ? ' as well as in-person visits' : ''}.`
          : `${p.name} currently offers ${serviceDelivery.join(', ')} appointments.`,
      });
    }

    if (p.acceptInsurance) {
      const insMap: Record<string, string> = {
        'both': `${p.name} accepts both insurance and private pay.`,
        'insurance': `${p.name} accepts insurance.`,
        'private': `${p.name} operates on a private-pay basis.`,
      };
      const insAnswer = insMap[p.acceptInsurance];
      if (insAnswer) {
        faqEntries.push({ q: `Does ${p.name} accept insurance?`, a: insAnswer });
      }
    }

    if (p.priceFull && p.priceFull !== 'N/A') {
      faqEntries.push({
        q: `How much does ${p.name} charge?`,
        a: `${p.name}'s rate is ${p.priceFull}.`,
      });
    }

    if (p.bookingUrl) {
      faqEntries.push({
        q: `How do I book an appointment with ${p.name}?`,
        a: `You can book an appointment with ${p.name} online through their booking page on PromptHealth.`,
      });
    }

    if (faqEntries.length < 2) {
      faqEntries.push({
        q: `Where is ${p.name} located?`,
        a: `${p.name} practices in ${locationStr}${primarySpecialty ? ' as ' + primarySpecialty : ''}.`,
      });
    }

    const faqSchema = faqEntries.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqEntries.map(entry => ({
        '@type': 'Question',
        'name': entry.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': entry.a },
      })),
    } : null;

    return faqSchema ? [mainSchema, breadcrumbSchema, faqSchema] : [mainSchema, breadcrumbSchema];
  }

  setProfileMenu() {
    this.profileMenus = this.profile.isSA ? profileMenusForPH : this.profile.isProvider ? profileMenusForProvider : profileMenusForCompany;
  }

  getQuestionnaire(type: IUserDetail['roles'] = 'SP'): Promise<QuestionnaireMapProfilePractitioner> {
    return new Promise((resolve, reject) => {
      this._qService.getProfilePractitioner(type).then((questionnaires) => {
        resolve(questionnaires);
      }, error => {
        reject();
      });  
    });
  }

  fetchProfile(id: string): Promise<Professional> {
    return new Promise((resolve, reject) => {
      const path = `user/get-profile/${id}`;
      this._sharedService.getNoAuth(path).pipe(takeUntil(this.destroy$)).subscribe((res: IGetProfileResult) => {
        if(res.statusCode === 200) {
          const p = res.data;
          // Save raw profile data to TransferState during SSR
          if (this._uService.isServer) {
            const stateKey = makeStateKey<any>('profile-' + id);
            this._transferState.set(stateKey, p);
          }
          let professional: Professional | Partner;
          if(p.roles == 'P') {
            professional = new Partner(p);
          } else {
            professional = new Professional(p._id, p);
          }
          this._socialService.saveCacheProfile(professional);
          resolve(professional);
        } else {
          reject();
        }
      }, error => {
        reject();
      });
    });
  }

  fetchTeam(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.profile.markAsTriedFetchingTeam();
      const path = `staff/get-by-user/${this.profile._id}`;
      this._sharedService.getNoAuth(path).pipe(takeUntil(this.destroy$)).subscribe((res: IGetStaffResult) => {
        if(res.statusCode == 200) {

          this.profile.setTeam(res.data.center as IUserDetail);
          resolve();
        } else {
          // console.log(res.message);
          resolve();
        }
      }, error => {
        resolve();
      });
    });
  }

  fetchPromos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = new SocialPostSearchQuery({
        order: 'desc',
        count: this.countPromoPerPage,
        contentType: 'PROMO',        
      });
      this._sharedService.get('note/get-by-author/' + this.profileId + query.toQueryParams()).pipe(takeUntil(this.destroy$)).subscribe((res: IGetSocialContentsByAuthorResult) => {
        if(res.statusCode === 200) {
          this._socialService.saveCachePromosOfUser(res.data, this.profileId);
          resolve();
        } else {
          reject();
        }
      }, error => {
        reject();
      })
    }); 
  }

  onClickLogin() {
    this._modalService.show('login-menu');
  }

  onClickBook() {
    if(this.user) {
      this._modalService.show('booking');
    } else {
      this._modalService.show('login-menu');
    }
  }

  async onClickBookOutside() {
    this._sharedService.post({ _id: this.user._id }, '/booking/gain-booking-count').pipe(takeUntil(this.destroy$)).subscribe(res => {
    }, err => {
      console.error(err);
    });
    window.open(this.profile.bookingUrl, '_blank');
  }

  async onClickFollow() {
    const query = this.isFollowing ? this.unfollow() : this.follow();
    
    this.isFollowLoading = true;
    try {
      await query;
    } catch (error) {
      this._toastr.error('Something went wrong. Please try again later.');
    } finally {
      this.isFollowLoading = false;
    }
  }

  follow() {
    return new Promise((resolve, reject) => {
      const data = {
        id: this.profileId,
        type: 'user',
      }
      this.isFollowing = true;
      this.user.setFollowing(this.profile.decode(), true);
      this.profile.countupFollower();

      this._sharedService.post(data, 'social/follow').pipe(takeUntil(this.destroy$)).subscribe((res: IFollowResult) => {
        if(res.statusCode == 200) {
          resolve(true);
        } else {
        this.isFollowing = false;
        this.user.removeFollowing(this.profile.decode(), true);
          this.profile.countdownFollower();
          reject(false);
        }
      }, error => {
        this.isFollowing = false;
        this.user.removeFollowing(this.profile.decode(), true);
        this.profile.countdownFollower();
        reject(false);
      });  
    })
  }

  async unfollow() {
    return new Promise((resolve, reject) => {
      this.isFollowing = false;
      this.user.removeFollowing(this.profile.decode(), true);
      this.profile.countdownFollower();

      this._sharedService.deleteContent('social/follow/' + this.profileId).pipe(takeUntil(this.destroy$)).subscribe((res: IUnfollowResult) => {
        if (res.statusCode == 200) {
          resolve(true);
        } else {
          this.isFollowing = true;
          this.user.setFollowing(this.profile.decode(), true);
          this.profile.countupFollower();
          reject(false);
        }
      }, error => {
        this.isFollowing = true;
        this.user.setFollowing(this.profile.decode(), true);
        this.profile.countupFollower();
        reject(false);
      });
    });
  }

  async onClickBell() {
    const query = this.isBelling ? this.unbell() : this.bell();
    
    this.isBellLoading = true;
    try {
      await query;
    } catch (error) {
      this._toastr.error('Something went wrong. Please try again later.');
    } finally {
      this.isBellLoading = false;
    }
  }

  async bell() {
    return new Promise((resolve, reject) => {
      const data = {
        id: this.profileId,
      }

      this.isBelling = true;
      
      this._sharedService.post(data, 'social/bell').pipe(takeUntil(this.destroy$)).subscribe((res: IBellResult) => {
        if(res.statusCode == 200) {
          resolve(true);
        } else {
          this.isBelling = false;
          reject(false);
        }
      }, error => {
        this.isBelling = false;
        reject(false);
      });
    });
  }

  async unbell() {
    return new Promise((resolve, reject) => {
      this.isBelling = false;

      this._sharedService.deleteContent('social/bell/' + this.profileId).pipe(takeUntil(this.destroy$)).subscribe((res: IUnbellResult) => {
        if (res.statusCode == 200) {
          resolve(true);
        } else {
          this.isBelling = true;
          reject(false);
        }
      }, error => {
        this.isBelling = true;
        reject(false);
      });
    });
  }

  onClickWriteRecommendation() {
    this._socialService.setProfileForReferral(this.profile);
    const route = this.profile.slug
      ? ['/practitioners', this.profile.slug, 'new-recommend']
      : ['/community/profile/', this.profile._id, 'new-recommend'];
    this._router.navigate(route);
  }


  onSubmitBooking() {
    this.submittedFormBooking = true;
    if (this.formBooking.invalid) {
      this._toastr.error('There are several items that requires your attention');
      return;
    } else {

      const data = {
        drId: this.profileId,
        customerId: this.user._id,
        ...this.formBooking.value,
      };

      data.phone = data.phone.toString();
      // data.bookingDateTime = this.formDateTimeComponent.getFormattedValue().toString();
      this.isBookingLoading = true;
      const path = `booking/create`;
      this._sharedService.post(data, path).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        this.isBookingLoading = false;
        if (res.statusCode === 200) {
          this.submittedFormBooking = false;
          this._toastr.success(res.message);
          this.modalBooking.hide();
        } else {
          this._toastr.error(res.message);
        }
      }, (error) => {
        this.isBookingLoading = false;
        this._toastr.error(error);
      });
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.order;
  }

  observeLoginStatus() {
    this.subscriptionLoginStatus = this._profileService.loginStatusChanged().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.checkFollowStatus();
      this.checkBellStatus();

      if(this.profile?.isP && !this._socialService.promosOfUser(this.profileId)) {
        this.fetchPromos();
      }
    });
  }

  checkFollowStatus() {
    if(this.isFollowLoading || !this.user || this.isProfileMyself) {
      return;
    }

    this.isFollowLoading = true;
    const path = 'social/get-follow-status/' + this.profileId;
    this._sharedService.get(path).pipe(takeUntil(this.destroy$)).subscribe((res: IGetFollowStatusResult) => {
      this.isFollowLoading = false;
      this.isFollowing = !!res.data;
    }, error => {
      this.isFollowLoading = false;
      this.isFollowing = false;
    });
  }

  checkBellStatus() {
    if(this.isBellLoading || !this.user || this.isProfileMyself) {
      return;
    }

    this.isBellLoading = true;
    const path = 'social/get-bell-status/' + this.profileId;
    this._sharedService.get(path).pipe(takeUntil(this.destroy$)).subscribe((res: IGetBellStatusResult) => {
      this.isBellLoading = false;
      this.isBelling = !!res.data;
    }, error => {
      this.isBellLoading = false;
      this.isBelling = false;
    });
  }

  setBreadcrumbs() {
    const name = this.profile?.name || 'Profile';
    this.breadcrumbs = [
      { label: 'Home', url: '/' },
      { label: 'Practitioners', url: '/practitioners' },
      { label: name }
    ];
  }
}

const profileMenusForProvider: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'service', label: 'Service', relativeLink: 'service', },
  {id: 'feed',    label: 'Posts',    relativeLink: 'feed'},
  {id: 'review',  label: 'Review',  relativeLink: 'review'},
];

const profileMenusForCompany: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'promotion', label: 'Discounts', relativeLink: 'promotion', },
  {id: 'event', label: 'Event', relativeLink: 'event', },
  {id: 'review', label: 'Recommendation', relativeLink: 'review', },
];

const profileMenusForPH: IProfileMenuItem[] = [
  {id: 'about',   label: 'About',   relativeLink: null, },
  {id: 'feed',    label: 'Posts',    relativeLink: 'feed'},
  {id: 'review',  label: 'Review',  relativeLink: 'review'},
];

interface IProfileMenuItem {
  id: string;
  label: string;
  relativeLink: string;
}
