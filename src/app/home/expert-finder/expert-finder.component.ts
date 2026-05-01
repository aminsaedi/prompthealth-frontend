import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren , OnDestroy } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Subscription , Subject } from 'rxjs';
import { skip , take, takeUntil } from 'rxjs/operators';
import { ExpertFinderController, FilterFieldName, IExpertFinderFilterParams, IExpertFinderFilterQueryParams, IFilterData } from 'src/app/models/expert-finder-controller';
import { Professional } from 'src/app/models/professional';
import { IGetPractitionersResult } from 'src/app/models/response-data';
import { FormItemCheckboxGroupComponent } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { SearchBarComponent } from 'src/app/shared/search-bar/search-bar.component';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { GeoLocationService } from 'src/app/shared/services/user-location.service';
import { expandVerticalAnimation, fadeAnimation, slideVerticalAnimation } from 'src/app/_helpers/animations';
import { getDistanceFromLatLng } from 'src/app/_helpers/latlng-to-distance';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';
import { titleCaseOf } from 'src/app/_helpers/titlecase';
import { slugify } from 'src/app/_helpers/slugify';
import { locationsNested } from 'src/app/_helpers/location-data';
import { isIndexableCityCategory, isIndexableCityType } from 'src/app/_helpers/indexable-combos';
import { SPECIALTY_SCHEMA_MAP, TYPE_PRIORITY, lookupSpecialtySchema } from 'src/app/_helpers/specialty-schema-map';
import { BreadcrumbItem } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';

@Component({
  selector: 'app-expert-finder',
  templateUrl: './expert-finder.component.html',
  styleUrls: ['./expert-finder.component.scss'],
  animations: [slideVerticalAnimation, fadeAnimation, expandVerticalAnimation],
})
export class ExpertFinderComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get sizeS() { return !window || window.innerWidth < 768; }
  get f() { return this.formFilter?.controls; }
  get fCompare() { return this.formCompare.controls; }
  get isFilterApplied() { return this.controller.isFilterApplied; }
  get isVirtual() { return this.controller.isVirtual; }

  // list of selected category & typeOfProvider
  // used for showing which field are selected. 
  get selectedTypesLabel() {
    return this.selectedTypes.length == 0 ? 
        'all different fields' :
        this.selectedTypes.length == 1 ? 
          this.selectedTypes[0].item_text : 
          'several fields that you select';
  }
  get selectedTypes() {
    const result = [];
    if(this._catService.categoryList && this.questionnaires) {
      this.controller.category.forEach(id => {
        const cat = this._catService.categoryListFlatten.find(item => item._id == id);
        if(cat) {
          result.push(cat);
        }
      });
      
      this.controller.typeOfProvider.forEach(id => {
        const type = this.questionnaires.typeOfProvider.answers.find(item => item._id == id);
        if(type) {
          result.push(type);
        }
      })
    }
    return result;
  }



  professionalOf(id: string) {
    const professionals = this.controller.professionalsAll
    let res: Professional = null;
    if(professionals) {
      for(let p of professionals) {
        if(p._id == id) {
          res = p;
          break;  
        }
      }
    }
    return res;
  }

  public viewState: IViewState = {
    style: 'list',
    isGettingUserLocation: false,
  }

  public mapRect = {
    top: 0,
    height: 0,
  }

  public controller: ExpertFinderController;
  public breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Practitioners' }
  ];
  public pageCurrent: number = 1;
  public pageHeading: string = 'Find Best Healthcare Providers in Canada';
  public introText: string = '';
  public faqItems: IFAQItem[] = [];
  public faqHeading: string = '';

  public questionnaires: QuestionnaireMapProfilePractitioner;
  public currentCity: string = null;
  public otherCities: { id: string, label: string }[] = [];

  private mapDataCurrent: {lat: number, lng: number, zoom: number, dist: number} = {lat: null, lng: null, zoom: null, dist: null};
  private formFilter: FormGroup;
  private formCompare: FormGroup;

  private queryParamsCurrent: Params;
  private _jsonLdSet = false;
  public selectedProfessionalInMap: Professional;
  public compareList: Professional[] = [];

  public distanceFilterData = {
    min: 5,
    max: 100,
    step: 1,
    isLabelShown: false,
  }

  @ViewChildren('filter') private filters: QueryList<FormItemCheckboxGroupComponent>;
  @ViewChild('searchBar') private searchBar: SearchBarComponent;
  @ViewChild('blurSearchbar') private blurSearchBar: ElementRef;

  constructor(
    private _geoService: GeoLocationService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _changeDetector: ChangeDetectorRef,
    private _modalService: ModalService,
    private _qService: QuestionnaireService,
    private _toastr: ToastrService,
    private _catService: CategoryService,
    private _jsonLdService: JsonLdService,
    private _transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  private subscriptionGeoLocation: Subscription;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._jsonLdService.removeJsonLd();
    this._jsonLdSet = false;
    if(this.subscriptionGeoLocation) {
      this.subscriptionGeoLocation.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    if (isPlatformServer(this.platformId)) return;
    const mapRect = this.getMapBoundingRect();
    if(mapRect.top != this.mapRect.top || mapRect.height != this.mapRect.height) {
      this.mapRect = mapRect;
      this._changeDetector.detectChanges();
    }
  }

  ngAfterViewInit() {
    if (isPlatformServer(this.platformId)) return;
    this.searchBar.retrieveData();
    const el = this.blurSearchBar.nativeElement as HTMLDivElement;
    el?.click();
  }

  async ngOnInit() {
    this.questionnaires = await this._qService.getProfilePractitioner('SP');

    await this._catService.getCategoryAsync();

    if (isPlatformServer(this.platformId)) {
      // SSR path: initialize controller and fetch listing data.
      // Kept minimal to avoid zone.js timing issues with stability detection.
      this.initController();
      // Populate intro text & FAQ items BEFORE fetching listings so that
      // setListingJsonLd() → buildFaqSchema() can include FAQPage in the
      // same JSON-LD script tag as ItemList + BreadcrumbList.
      await this.setMeta();
      await this.prefetchListingForSSR();
      // Fallback: inject BreadcrumbList + FAQPage if listing API returned
      // no results and setListingJsonLd() never fired.
      this.ensureBreadcrumbJsonLd();
      return;
    }

    // Client-side fallback: redirect old ObjectId URLs to slug URLs (type)
    const params = this._route.snapshot.params as IExpertFinderFilterParams;
    if (params.typeOfProviderSlug && /^[0-9a-f]{24}$/i.test(params.typeOfProviderSlug)) {
      const answer = this.questionnaires?.typeOfProvider?.answers?.find(
        a => a._id === params.typeOfProviderSlug
      );
      if (answer) {
        const slug = slugify(answer.item_text);
        const segments = params.city
          ? ['/practitioners/type', slug, params.city]
          : ['/practitioners/type', slug];
        this._router.navigate(segments, { replaceUrl: true });
        return;
      }
    }

    // Client-side fallback: redirect old ObjectId URLs to slug URLs (category)
    if (params.categorySlug && /^[0-9a-f]{24}$/i.test(params.categorySlug)) {
      const cat = this._catService.categoryListFlatten.find(
        c => c._id === params.categorySlug
      );
      if (cat) {
        const slug = slugify(cat.item_text);
        const segments = params.city
          ? ['/practitioners/category', slug, params.city]
          : ['/practitioners/category', slug];
        this._router.navigate(segments, { replaceUrl: true });
        return;
      }
    }

    await this.setMeta();

    this.initController();

    this._route.params.pipe(skip(1)).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.initController();
    });

    this._route.queryParams.subscribe((param: IExpertFinderFilterQueryParams) => {
      if(param.modal) {
        this.showFilterDistanceLabel();
      }
      const p = {...param};
      delete p.page;
      delete p.modal;
      delete p['modal-data'];
      delete p.menu;

      if(this.queryParamsCurrent && JSON.stringify(p) != JSON.stringify(this.queryParamsCurrent)) {
        this.initController();
      }

      this.queryParamsCurrent = p;
    });
  }

  async setMeta() {
    const param = this._route.snapshot.params as IExpertFinderFilterParams;

    let category = null;
    if(param.categorySlug) {
      await this._catService.getCategoryAsync();
      category = this._catService.titleOfBySlug(param.categorySlug).toLowerCase()
        || param.categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').toLowerCase();
    } else if(param.categoryId) {
      await this._catService.getCategoryAsync();
      category = this._catService.titleOf(param.categoryId).toLowerCase();
    }

    let typeOfProvider: string = null;
    if(param.typeOfProviderSlug) {
      const answer = this.questionnaires?.typeOfProvider?.answers?.find(
        item => slugify(item.item_text) === param.typeOfProviderSlug
      );
      typeOfProvider = answer ? answer.item_text.toLowerCase()
        : param.typeOfProviderSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').toLowerCase();
    } else if(param.typeOfProviderId) {
      const answer = this.questionnaires?.typeOfProvider?.answers?.find(item => item._id == param.typeOfProviderId);
      typeOfProvider = answer ? answer.item_text.toLowerCase() : null;
    }

    let city = param.city ? titleCaseOf(param.city) : null;

    this.currentCity = param.city || null;
    if (param.city) {
      const allCities: { id: string, label: string }[] = [];
      for (const province of locationsNested) {
        if (province.subitems) {
          for (const c of province.subitems) {
            if (c.id !== param.city) {
              allCities.push({ id: c.id, label: c.label });
            }
          }
        }
      }
      this.otherCities = allCities.slice(0, 8);
    } else {
      this.otherCities = [];
    }

    let specialist = category ? `${category}` : typeOfProvider ? `${typeOfProvider}` : 'healthcare providers';
    let area = city ? city : 'Canada';

    this.pageHeading = `Find Best ${titleCaseOf(specialist)} in ${area}`;

    this.introText = this.generateIntroText(specialist, area);
    this.faqItems = this.generateFaqItems(specialist, area);
    this.faqHeading = `Frequently Asked Questions about ${titleCaseOf(specialist)} in ${area}`;

    // SEO-077: there are two URL shapes for every city × specialty combo —
    // the legacy specialty-first form (/practitioners/(category|type)/:slug/:city)
    // and the area-first form (/practitioners/area/:city/(category|type)/:slug).
    // The area-first form is the one we emit in the sitemap, so it's the
    // canonical for indexable combos. Both shapes point at the area-first
    // canonical when both city and specialty are set, so opening up the
    // allowlist doesn't accidentally index two URLs per page.
    let canonicalPath = '/practitioners';
    if (param.city && param.typeOfProviderSlug) {
      canonicalPath = `/practitioners/area/${param.city}/type/${param.typeOfProviderSlug}`;
    } else if (param.city && param.categorySlug) {
      canonicalPath = `/practitioners/area/${param.city}/category/${param.categorySlug}`;
    } else if (param.categorySlug) {
      canonicalPath += `/category/${param.categorySlug}`;
    } else if (param.typeOfProviderSlug) {
      canonicalPath += `/type/${param.typeOfProviderSlug}`;
    } else if (param.city) {
      canonicalPath += `/area/${param.city}`;
    }

    // SEO-064: noindex city × category / city × type intersection pages
    // that are not explicitly allowlisted. Prevents the ~2,600 programmatic
    // combos from tripping Google's doorway-pattern heuristic. Single-dimension
    // pages (area-only, category-only, type-only) stay indexable.
    let robots: string | undefined;
    if (param.city && param.categorySlug && !isIndexableCityCategory(param.city, param.categorySlug)) {
      robots = 'noindex, follow';
    } else if (param.city && param.typeOfProviderSlug && !isIndexableCityType(param.city, param.typeOfProviderSlug)) {
      robots = 'noindex, follow';
    }

    this._uService.setMeta(canonicalPath, {
      title: `Find Best ${titleCaseOf(specialist)} in ${area} | PromptHealth`,
      description: `Use our Expert Finder to find a top-rated ${specialist} in ${area} or offering virtual appointment.`,
      ...(robots ? { robots } : {}),
    });

  }

  private generateIntroText(specialist: string, area: string): string {
    const specialistProf = specialist === 'healthcare providers' ? 'healthcare professionals' : `${specialist} professionals`;
    if (specialist === 'healthcare providers' && area === 'Canada') {
      return 'Looking for a healthcare professional in Canada? Browse our directory of trusted practitioners across specialties. Whether you need an in-person visit or a virtual consultation, PromptHealth makes it easy to compare providers and book your appointment.';
    }
    if (area !== 'Canada') {
      return `Looking for a trusted ${specialist} in ${area}? Browse our directory of top-rated ${specialistProf} in ${area} and find the right provider for your health needs. Whether you need an in-person visit or a virtual consultation, PromptHealth makes it easy to compare providers and book your appointment.`;
    }
    return `Find top-rated ${specialistProf} across Canada on PromptHealth. Compare providers by ratings, specialties, and availability to find the right ${specialist} for your health and wellness goals.`;
  }

  private generateFaqItems(specialist: string, area: string): IFAQItem[] {
    const faqLookup: { [key: string]: IFAQItem[] } = {
      'dentist': [
        { q: `What does a dentist do?`, a: `A dentist diagnoses and treats conditions affecting the teeth, gums, and mouth. Services include routine cleanings, fillings, crowns, root canals, and preventive care to maintain your oral health.`, opened: false },
        { q: `How do I find a dentist in ${area}?`, a: `You can use PromptHealth's Expert Finder to browse dentists in ${area}. Filter by ratings, availability, and whether they offer virtual consultations to find the right fit.`, opened: false },
        { q: `What should I expect at my first dentist appointment?`, a: `Your first visit typically includes a comprehensive oral exam, dental X-rays, a professional cleaning, and a discussion about your dental health history and any concerns you may have.`, opened: false },
        { q: `How much does a dentist visit cost in ${area}?`, a: `Costs vary depending on the type of service. A routine check-up and cleaning may range from $150 to $350. Many dental offices in ${area} accept insurance plans and offer payment options.`, opened: false },
        { q: `Do I need a referral to see a dentist?`, a: `No, you do not need a referral to see a dentist. You can book an appointment directly with any dental practice in ${area}.`, opened: false },
      ],
      'psychologist': [
        { q: `What does a psychologist do?`, a: `A psychologist provides assessment, diagnosis, and therapy for mental health conditions. They use evidence-based approaches like cognitive-behavioural therapy (CBT) to help with anxiety, depression, trauma, and other concerns.`, opened: false },
        { q: `How do I find a psychologist in ${area}?`, a: `Use PromptHealth to search for psychologists in ${area}. You can filter by specialty areas, ratings, availability, and virtual appointment options to find the right match.`, opened: false },
        { q: `What should I expect at my first psychologist appointment?`, a: `Your first session is usually an intake assessment where the psychologist learns about your background, concerns, and goals. Together, you will develop a plan for therapy going forward.`, opened: false },
        { q: `How much does a psychologist cost in ${area}?`, a: `Psychologist fees in ${area} typically range from $150 to $250 per session. Many extended health insurance plans cover psychological services, so check with your provider.`, opened: false },
        { q: `Do I need a referral to see a psychologist?`, a: `In most provinces, you do not need a referral to see a psychologist. You can book directly, though a referral from your family doctor may help with insurance coverage.`, opened: false },
      ],
      'physiotherapist': [
        { q: `What does a physiotherapist do?`, a: `A physiotherapist helps you recover from injuries, manage chronic pain, and improve mobility through exercise programs, manual therapy, and education about movement and prevention.`, opened: false },
        { q: `How do I find a physiotherapist in ${area}?`, a: `Search for physiotherapists in ${area} on PromptHealth. Compare providers by ratings, specialties, and whether they offer virtual or in-person sessions.`, opened: false },
        { q: `What should I expect at my first physiotherapy appointment?`, a: `Your first visit will include a physical assessment, a review of your medical history, and discussion of your goals. Your physiotherapist will then create a personalized treatment plan.`, opened: false },
        { q: `How much does physiotherapy cost in ${area}?`, a: `Physiotherapy sessions in ${area} typically cost between $80 and $150. Many extended health plans and workplace benefits cover physiotherapy treatments.`, opened: false },
        { q: `Do I need a referral to see a physiotherapist?`, a: `No referral is needed to see a physiotherapist in most provinces. You can book an appointment directly, though some insurance plans may require a doctor's note for coverage.`, opened: false },
      ],
      'chiropractor': [
        { q: `What does a chiropractor do?`, a: `A chiropractor specializes in diagnosing and treating musculoskeletal disorders, particularly those affecting the spine. Treatment often includes spinal adjustments, soft tissue therapy, and exercise recommendations.`, opened: false },
        { q: `How do I find a chiropractor in ${area}?`, a: `Browse chiropractors in ${area} on PromptHealth. Filter by patient ratings, availability, and services offered to find the right provider for your needs.`, opened: false },
        { q: `What should I expect at my first chiropractic appointment?`, a: `Your first visit typically includes a health history review, physical examination, and possibly X-rays. The chiropractor will discuss findings with you and recommend a treatment plan.`, opened: false },
        { q: `How much does a chiropractor cost in ${area}?`, a: `Chiropractic visits in ${area} generally range from $60 to $120 per session. Many workplace health benefits and insurance plans include chiropractic coverage.`, opened: false },
        { q: `Do I need a referral to see a chiropractor?`, a: `No, you can see a chiropractor without a referral. Simply book an appointment directly with a chiropractic clinic in ${area}.`, opened: false },
      ],
      'naturopath': [
        { q: `What does a naturopath do?`, a: `A naturopathic doctor uses natural therapies including herbal medicine, nutrition, acupuncture, and lifestyle counselling to support the body's ability to heal and maintain health.`, opened: false },
        { q: `How do I find a naturopath in ${area}?`, a: `Search for naturopaths in ${area} on PromptHealth. Compare practitioners by their specialties, patient reviews, and availability.`, opened: false },
        { q: `What should I expect at my first naturopath appointment?`, a: `A first visit usually lasts 60 to 90 minutes and involves a detailed review of your health history, lifestyle, diet, and current concerns. The naturopath will then suggest a personalized treatment plan.`, opened: false },
        { q: `How much does a naturopath cost in ${area}?`, a: `Initial naturopathic consultations in ${area} typically range from $150 to $300, with follow-up visits costing $80 to $150. Some extended health plans cover naturopathic services.`, opened: false },
        { q: `Do I need a referral to see a naturopath?`, a: `No referral is required. You can book directly with a naturopathic doctor in ${area}.`, opened: false },
      ],
      'massage therapist': [
        { q: `What does a massage therapist do?`, a: `A registered massage therapist provides hands-on treatment to relieve pain, reduce stress, and improve mobility. Techniques may include deep tissue massage, Swedish massage, and myofascial release.`, opened: false },
        { q: `How do I find a massage therapist in ${area}?`, a: `Use PromptHealth to find massage therapists in ${area}. Filter results by ratings, specialties, and appointment availability.`, opened: false },
        { q: `What should I expect at my first massage therapy appointment?`, a: `Your therapist will ask about your health history, areas of concern, and treatment goals before beginning a hands-on session tailored to your needs.`, opened: false },
        { q: `How much does massage therapy cost in ${area}?`, a: `Massage therapy in ${area} typically costs between $80 and $140 per session, depending on the duration. Many health benefit plans cover registered massage therapy.`, opened: false },
        { q: `Do I need a referral to see a massage therapist?`, a: `No referral is needed. You can book directly with a registered massage therapist in ${area}.`, opened: false },
      ],
      'nutritionist': [
        { q: `What does a nutritionist do?`, a: `A nutritionist or registered dietitian provides personalized dietary advice to help manage health conditions, improve eating habits, and support overall wellness through evidence-based nutrition plans.`, opened: false },
        { q: `How do I find a nutritionist in ${area}?`, a: `Search for nutritionists and dietitians in ${area} on PromptHealth. Compare providers by their specialties, ratings, and consultation options.`, opened: false },
        { q: `What should I expect at my first nutritionist appointment?`, a: `Your first session will typically involve a review of your dietary habits, health goals, medical history, and lifestyle. The nutritionist will then create a personalized eating plan.`, opened: false },
        { q: `How much does a nutritionist cost in ${area}?`, a: `Nutrition consultations in ${area} typically range from $80 to $175 per session. Some insurance and employee benefit plans cover visits with registered dietitians.`, opened: false },
        { q: `Do I need a referral to see a nutritionist?`, a: `In most cases, no referral is required. You can book directly with a nutritionist or dietitian in ${area}.`, opened: false },
      ],
      'acupuncturist': [
        { q: `What does an acupuncturist do?`, a: `An acupuncturist uses thin needles inserted at specific points on the body to stimulate healing, relieve pain, and restore balance. Acupuncture is commonly used for chronic pain, migraines, stress, and digestive issues.`, opened: false },
        { q: `How do I find an acupuncturist in ${area}?`, a: `Use PromptHealth to search for licensed acupuncturists in ${area}. Filter by patient ratings, availability, and whether they offer initial consultations to find the right practitioner.`, opened: false },
        { q: `What should I expect at my first acupuncture appointment?`, a: `Your first visit typically includes a health history review and assessment of your concerns. The acupuncturist will explain the treatment, insert thin needles at specific points, and you will rest for 20 to 30 minutes during the session.`, opened: false },
        { q: `How much does acupuncture cost in ${area}?`, a: `Acupuncture sessions in ${area} typically range from $75 to $120 per treatment. Many extended health insurance plans cover acupuncture performed by a registered practitioner.`, opened: false },
        { q: `Do I need a referral to see an acupuncturist?`, a: `No referral is needed to see an acupuncturist. You can book an appointment directly with a licensed acupuncturist in ${area}.`, opened: false },
      ],
      'osteopath': [
        { q: `What does an osteopath do?`, a: `An osteopath uses hands-on manual techniques including stretching, massage, and joint mobilization to improve the body's structure and function. Osteopathy treats musculoskeletal pain, headaches, and postural issues.`, opened: false },
        { q: `How do I find an osteopath in ${area}?`, a: `Search for osteopaths in ${area} on PromptHealth. Compare practitioners by ratings, specialties, and availability to find the best fit for your needs.`, opened: false },
        { q: `What should I expect at my first osteopathy appointment?`, a: `Your first visit usually lasts 45 to 60 minutes and includes a detailed health history, postural assessment, and hands-on examination. The osteopath will then perform manual therapy tailored to your condition.`, opened: false },
        { q: `How much does an osteopath cost in ${area}?`, a: `Osteopathy sessions in ${area} typically range from $90 to $150. Many extended health benefit plans cover osteopathic treatments.`, opened: false },
        { q: `Do I need a referral to see an osteopath?`, a: `No, you do not need a referral. You can book directly with an osteopath in ${area}.`, opened: false },
      ],
      'optometrist': [
        { q: `What does an optometrist do?`, a: `An optometrist provides eye exams, diagnoses vision problems, prescribes corrective lenses, and detects eye diseases such as glaucoma and macular degeneration. They also manage conditions like dry eye and eye infections.`, opened: false },
        { q: `How do I find an optometrist in ${area}?`, a: `Browse optometrists in ${area} on PromptHealth. Filter by patient ratings, clinic locations, and available appointment times to find a provider near you.`, opened: false },
        { q: `What should I expect at my first optometrist appointment?`, a: `Your first visit typically includes a comprehensive eye exam with vision tests, eye pressure measurement, and retinal examination. The optometrist will discuss your results and recommend corrective lenses or treatment if needed.`, opened: false },
        { q: `How much does an optometrist visit cost in ${area}?`, a: `A comprehensive eye exam in ${area} typically costs between $75 and $150. Many provincial health plans cover routine eye exams for children and seniors, and employer benefit plans often include vision care.`, opened: false },
        { q: `Do I need a referral to see an optometrist?`, a: `No referral is required to see an optometrist. You can book an eye exam directly with any optometry clinic in ${area}.`, opened: false },
      ],
      'occupational therapist': [
        { q: `What does an occupational therapist do?`, a: `An occupational therapist helps people develop, recover, or maintain the skills needed for daily living and working. They address challenges related to injury, illness, disability, or mental health through therapeutic activities and adaptive strategies.`, opened: false },
        { q: `How do I find an occupational therapist in ${area}?`, a: `Use PromptHealth to search for occupational therapists in ${area}. Filter by specialty areas such as pediatrics, mental health, or workplace rehabilitation to find the right match.`, opened: false },
        { q: `What should I expect at my first occupational therapy appointment?`, a: `Your first session involves an assessment of your daily activities, physical and cognitive abilities, and goals. The therapist will create a personalized treatment plan to help you improve your independence and quality of life.`, opened: false },
        { q: `How much does occupational therapy cost in ${area}?`, a: `Occupational therapy sessions in ${area} typically range from $100 to $175. Many workplace benefits, insurance plans, and provincial programs cover occupational therapy services.`, opened: false },
        { q: `Do I need a referral to see an occupational therapist?`, a: `In most provinces, you can see an occupational therapist without a referral. However, some insurance plans may require one for coverage. Check with your provider for details.`, opened: false },
      ],
      'social worker': [
        { q: `What does a social worker do?`, a: `A clinical social worker provides counselling and therapy for mental health concerns including anxiety, depression, grief, relationship issues, and trauma. They use evidence-based approaches to help clients build coping skills and improve well-being.`, opened: false },
        { q: `How do I find a social worker in ${area}?`, a: `Search for registered social workers in ${area} on PromptHealth. Filter by specialty areas, ratings, and whether they offer virtual sessions to find the right therapist.`, opened: false },
        { q: `What should I expect at my first social worker appointment?`, a: `Your first session is typically an intake assessment where the social worker learns about your background, current concerns, and goals for therapy. Together you will develop a plan for ongoing support.`, opened: false },
        { q: `How much does a social worker cost in ${area}?`, a: `Social work therapy sessions in ${area} typically range from $100 to $175. Many extended health plans cover services from registered social workers, and some practitioners offer sliding-scale fees.`, opened: false },
        { q: `Do I need a referral to see a social worker?`, a: `No, you generally do not need a referral to see a social worker for counselling. You can book directly with a registered social worker in ${area}.`, opened: false },
      ],
      'psychiatrist': [
        { q: `What does a psychiatrist do?`, a: `A psychiatrist is a medical doctor who specializes in diagnosing and treating mental health conditions. They can prescribe medication, provide psychotherapy, and manage complex conditions such as depression, bipolar disorder, ADHD, and schizophrenia.`, opened: false },
        { q: `How do I find a psychiatrist in ${area}?`, a: `Use PromptHealth to browse psychiatrists in ${area}. Filter by subspecialty, availability, and consultation format to find a provider suited to your needs.`, opened: false },
        { q: `What should I expect at my first psychiatrist appointment?`, a: `Your first visit typically includes a comprehensive psychiatric evaluation covering your medical history, symptoms, and mental health concerns. The psychiatrist will discuss diagnosis and treatment options, which may include medication and therapy.`, opened: false },
        { q: `How much does a psychiatrist cost in ${area}?`, a: `Psychiatrist visits in ${area} are often covered by provincial health insurance when referred by a family doctor. Private psychiatry sessions may range from $200 to $400 depending on the type of assessment.`, opened: false },
        { q: `Do I need a referral to see a psychiatrist?`, a: `In most Canadian provinces, you need a referral from a family doctor or nurse practitioner to see a psychiatrist covered by provincial health insurance. Some private-practice psychiatrists accept self-referrals.`, opened: false },
      ],
      'physician': [
        { q: `What does a physician do?`, a: `A physician (medical doctor) diagnoses, treats, and manages a wide range of health conditions. They provide preventive care, order tests, prescribe medications, and coordinate referrals to specialists when needed.`, opened: false },
        { q: `How do I find a physician in ${area}?`, a: `Search for physicians in ${area} on PromptHealth. Filter by specialty, patient ratings, and whether they are accepting new patients to find the right doctor for your needs.`, opened: false },
        { q: `What should I expect at my first physician appointment?`, a: `Your first visit typically includes a review of your medical history, a physical examination, and a discussion of any current health concerns. The physician may order tests and create a care plan tailored to your needs.`, opened: false },
        { q: `How much does a physician visit cost in ${area}?`, a: `Most physician visits in ${area} are covered by provincial health insurance for Canadian residents. Some services such as executive health assessments or uninsured treatments may have additional fees.`, opened: false },
        { q: `Do I need a referral to see a physician?`, a: `You do not need a referral to see a family physician or general practitioner. Referrals are typically required to see medical specialists and are arranged by your family doctor.`, opened: false },
      ],
      'medical doctor': [
        { q: `What does a medical doctor do?`, a: `A medical doctor diagnoses, treats, and manages a wide range of health conditions. They provide preventive care, order tests, prescribe medications, and coordinate referrals to specialists when needed.`, opened: false },
        { q: `How do I find a medical doctor in ${area}?`, a: `Search for medical doctors in ${area} on PromptHealth. Filter by specialty, patient ratings, and whether they are accepting new patients to find the right doctor for your needs.`, opened: false },
        { q: `What should I expect at my first medical doctor appointment?`, a: `Your first visit typically includes a review of your medical history, a physical examination, and a discussion of any current health concerns. The doctor may order tests and create a care plan tailored to your needs.`, opened: false },
        { q: `How much does a medical doctor visit cost in ${area}?`, a: `Most medical doctor visits in ${area} are covered by provincial health insurance for Canadian residents. Some services such as executive health assessments or uninsured treatments may have additional fees.`, opened: false },
        { q: `Do I need a referral to see a medical doctor?`, a: `You do not need a referral to see a family doctor or general practitioner. Referrals are typically required to see medical specialists and are arranged by your family doctor.`, opened: false },
      ],
      'personal trainer': [
        { q: `What does a personal trainer do?`, a: `A personal trainer designs and supervises exercise programs tailored to your fitness goals. They provide guidance on proper form, workout planning, and motivation to help you build strength, lose weight, or improve overall fitness.`, opened: false },
        { q: `How do I find a personal trainer in ${area}?`, a: `Browse personal trainers in ${area} on PromptHealth. Filter by specialties, client ratings, and whether they offer virtual or in-person sessions to find the right fit.`, opened: false },
        { q: `What should I expect at my first personal training session?`, a: `Your first session usually includes a fitness assessment, discussion of your health history and goals, and an introductory workout. The trainer will use this information to create a personalized exercise program.`, opened: false },
        { q: `How much does a personal trainer cost in ${area}?`, a: `Personal training sessions in ${area} typically range from $50 to $120 per session depending on the trainer's experience and session length. Some trainers offer package discounts.`, opened: false },
        { q: `Do I need a referral to see a personal trainer?`, a: `No referral is needed. You can book directly with a certified personal trainer in ${area}.`, opened: false },
      ],
      'speech therapist': [
        { q: `What does a speech therapist do?`, a: `A speech-language pathologist assesses and treats communication and swallowing disorders. They work with children and adults on speech articulation, language development, fluency, voice disorders, and cognitive communication.`, opened: false },
        { q: `How do I find a speech therapist in ${area}?`, a: `Search for speech therapists and speech-language pathologists in ${area} on PromptHealth. Filter by age group specialization, ratings, and appointment availability.`, opened: false },
        { q: `What should I expect at my first speech therapy appointment?`, a: `Your first visit includes a comprehensive assessment of speech, language, and communication skills. The therapist will discuss findings and develop a treatment plan with specific goals tailored to your or your child's needs.`, opened: false },
        { q: `How much does speech therapy cost in ${area}?`, a: `Speech therapy sessions in ${area} typically range from $100 to $200 per session. Many extended health plans, workplace benefits, and provincial programs for children cover speech-language pathology services.`, opened: false },
        { q: `Do I need a referral to see a speech therapist?`, a: `In most provinces, you do not need a referral to see a speech-language pathologist privately. However, some insurance plans or publicly funded programs may require one.`, opened: false },
      ],
      'speech-language pathologist': [
        { q: `What does a speech-language pathologist do?`, a: `A speech-language pathologist assesses and treats communication and swallowing disorders. They work with children and adults on speech articulation, language development, fluency, voice disorders, and cognitive communication.`, opened: false },
        { q: `How do I find a speech-language pathologist in ${area}?`, a: `Search for speech-language pathologists in ${area} on PromptHealth. Filter by age group specialization, ratings, and appointment availability.`, opened: false },
        { q: `What should I expect at my first speech-language pathologist appointment?`, a: `Your first visit includes a comprehensive assessment of speech, language, and communication skills. The pathologist will discuss findings and develop a treatment plan with specific goals tailored to your or your child's needs.`, opened: false },
        { q: `How much does a speech-language pathologist cost in ${area}?`, a: `Speech-language pathology sessions in ${area} typically range from $100 to $200 per session. Many extended health plans, workplace benefits, and provincial programs for children cover these services.`, opened: false },
        { q: `Do I need a referral to see a speech-language pathologist?`, a: `In most provinces, you do not need a referral to see a speech-language pathologist privately. However, some insurance plans or publicly funded programs may require one.`, opened: false },
      ],
      'podiatrist': [
        { q: `What does a podiatrist do?`, a: `A podiatrist diagnoses and treats conditions affecting the feet and lower limbs, including plantar fasciitis, bunions, ingrown toenails, diabetic foot care, and sports injuries. They may prescribe orthotics and perform minor foot surgeries.`, opened: false },
        { q: `How do I find a podiatrist in ${area}?`, a: `Use PromptHealth to search for podiatrists in ${area}. Compare providers by patient ratings, services offered, and appointment availability.`, opened: false },
        { q: `What should I expect at my first podiatrist appointment?`, a: `Your first visit typically includes a review of your medical history, a physical examination of your feet and lower limbs, and a discussion of your symptoms. The podiatrist may recommend imaging, orthotics, or a treatment plan.`, opened: false },
        { q: `How much does a podiatrist cost in ${area}?`, a: `Podiatry visits in ${area} typically range from $75 to $150 per appointment. Custom orthotics are an additional cost. Many extended health plans cover podiatric care.`, opened: false },
        { q: `Do I need a referral to see a podiatrist?`, a: `No referral is needed to see a podiatrist. You can book an appointment directly with a podiatry clinic in ${area}.`, opened: false },
      ],
      'healthcare providers': [
        { q: `What types of healthcare providers are available in ${area}?`, a: `${area} offers a wide range of healthcare providers including family doctors, specialists, physiotherapists, psychologists, chiropractors, naturopaths, massage therapists, and more. You can use PromptHealth to explore all available provider types in your area and filter by specialty, ratings, and availability.`, opened: false },
        { q: `How do I book a same-day appointment in ${area}?`, a: `Many healthcare providers in ${area} offer same-day or next-day appointments, especially for urgent concerns. Use PromptHealth to filter providers by availability and look for those offering online booking or virtual consultations for faster access to care.`, opened: false },
        { q: `What is the difference between in-person and virtual care in ${area}?`, a: `In-person appointments in ${area} allow for hands-on examinations and procedures, while virtual care lets you consult with a provider from home via video or phone. Both are effective for many conditions, and many providers in ${area} offer both options so you can choose what works best for your needs.`, opened: false },
        { q: `How do I find the best healthcare provider in ${area}?`, a: `Start by identifying the type of provider you need, then use PromptHealth to compare practitioners in ${area} by patient ratings, years of experience, areas of specialty, and appointment availability. Reading patient reviews and checking credentials can also help you make an informed choice.`, opened: false },
        { q: `What should I look for when choosing a healthcare provider in ${area}?`, a: `Consider factors such as the provider's qualifications, patient reviews, location convenience, availability of virtual appointments, accepted insurance plans, and areas of specialization. PromptHealth lets you filter healthcare providers in ${area} by all of these criteria to find the right fit.`, opened: false },
      ],
    };

    const specialistLower = specialist.toLowerCase();
    const matched = faqLookup[specialistLower];
    if (matched) {
      return matched;
    }

    // Generic FAQ items for specialties not in the lookup
    // Singularize 'healthcare providers' for grammatically correct questions (e.g. "What does a healthcare provider do?")
    const singularSpecialist = specialist === 'healthcare providers' ? 'healthcare provider' : specialist;
    return [
      { q: `What does a ${singularSpecialist} do?`, a: `A ${singularSpecialist} is a health care professional who provides specialized assessment, treatment, and ongoing support for conditions within their area of expertise. They work with patients to develop personalized care plans.`, opened: false },
      { q: `How do I find a ${singularSpecialist} in ${area}?`, a: `You can use PromptHealth's Expert Finder to browse ${singularSpecialist} providers in ${area}. Filter by ratings, availability, and virtual consultation options to find the right match for your needs.`, opened: false },
      { q: `What should I expect at my first ${singularSpecialist} appointment?`, a: `Your first visit typically includes a review of your health history, an assessment of your current concerns, and a discussion of treatment options. The provider will work with you to develop a care plan.`, opened: false },
      { q: `How much does a ${singularSpecialist} cost in ${area}?`, a: `Fees vary depending on the type of service and provider. Many ${singularSpecialist} practitioners in ${area} accept insurance or offer flexible payment options. Check with the provider directly for pricing details.`, opened: false },
      { q: `Do I need a referral to see a ${singularSpecialist}?`, a: `Referral requirements depend on the profession and your province. Many ${singularSpecialist} providers accept direct bookings without a referral. Check with the specific provider or your insurance plan for details.`, opened: false },
    ];
  }

  private buildFaqSchema(): object | null {
    if (!this.faqItems || this.faqItems.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': this.faqItems.map(item => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.a,
        }
      }))
    };
  }

  setListingJsonLd(professionals: Professional[]) {
    // Resolve page-level type filter once for fallback use
    const params = this._route.snapshot.params as IExpertFinderFilterParams;
    let pageTypeSchemaUrl: string | null = null;
    try {
      if (params.typeOfProviderSlug && this.questionnaires?.typeOfProvider?.answers) {
        const answer = this.questionnaires.typeOfProvider.answers.find(
          a => slugify(a.item_text) === params.typeOfProviderSlug
        );
        if (answer) {
          pageTypeSchemaUrl = lookupSpecialtySchema(answer.item_text) || null;
        }
      }
    } catch (e) {
      // Defensive: don't let type resolution break schema injection
    }

    const items = professionals.slice(0, 10).map((p, i) => {
      const typeNames = this.questionnaires?.typeOfProvider
        ? this._qService.getSelectedLabel(this.questionnaires.typeOfProvider, p.serviceIds)
        : [];
      const schemaTypeUrls = [...new Set(typeNames.map(t => lookupSpecialtySchema(t)).filter(Boolean))];
      let primaryTypeUrl = TYPE_PRIORITY.find(t => schemaTypeUrls.includes(t)) || 'https://schema.org/ProfessionalService';

      // Fallback: when serviceIds resolution yields generic ProfessionalService
      // and a page-level type filter is active, use the filter's schema type
      if (primaryTypeUrl === 'https://schema.org/ProfessionalService' && pageTypeSchemaUrl) {
        primaryTypeUrl = pageTypeSchemaUrl;
      }

      const schemaType = p.isC ? 'MedicalBusiness' : primaryTypeUrl.replace('https://schema.org/', '');

      const item: any = {
        '@type': 'ListItem',
        'position': i + 1,
        'item': {
          '@type': schemaType,
          'name': p.name,
          'url': p.slug ? `https://www.prompthealth.ca/practitioners/${p.slug}` : `https://www.prompthealth.ca/community/profile/${p._id}`,
          ...(p.profileImageFull ? { 'image': p.profileImageFull } : {}),
          ...(p.city || p.state ? {
            'address': {
              '@type': 'PostalAddress',
              ...(p.city ? { 'addressLocality': p.city } : {}),
              ...(p.state ? { 'addressRegion': p.state } : {}),
              'addressCountry': 'CA',
            }
          } : {}),
          ...(p.rating > 0 && p.ratingCount > 0 ? {
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': p.rating,
              'reviewCount': p.ratingCount,
              'bestRating': 5,
            }
          } : {}),
          ...(p.priceFull && p.priceFull !== 'N/A' ? { 'priceRange': p.priceFull + ' / hr' } : {}),
          ...(p.phone ? { 'telephone': p.phone } : {}),
          'isAcceptingNewPatients': true,
        },
      };
      return item;
    });

    if (items.length > 0) {
      const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': this.pageHeading,
        'numberOfItems': professionals.length,
        'itemListElement': items,
      };

      const breadcrumbSchema = this.buildBreadcrumbSchema();
      const faqSchema = this.buildFaqSchema();

      const schemas: object[] = [itemListSchema];
      if (breadcrumbSchema) schemas.push(breadcrumbSchema);
      if (faqSchema) schemas.push(faqSchema);

      this._jsonLdService.setJsonLd(schemas);
      this._jsonLdSet = true;
    }
  }

  private buildBreadcrumbSchema(): object | null {
    const param = this._route.snapshot.params as IExpertFinderFilterParams;

    let specialtyLabel: string = null;
    if (param.categorySlug) {
      specialtyLabel = this._catService.titleOfBySlug(param.categorySlug)
        || param.categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } else if (param.typeOfProviderSlug && this.questionnaires?.typeOfProvider?.answers) {
      const answer = this.questionnaires.typeOfProvider.answers.find(
        a => slugify(a.item_text) === param.typeOfProviderSlug
      );
      specialtyLabel = answer ? answer.item_text : null;
    }

    const cityLabel = param.city ? titleCaseOf(param.city) : null;

    const breadcrumbItems: object[] = [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.prompthealth.ca' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Find Practitioners', 'item': 'https://www.prompthealth.ca/practitioners' },
    ];

    let position = 3;

    // SEO-077: city × specialty pages use the area-first canonical URL
    // regardless of which route shape served the request, so breadcrumb
    // hierarchy (Practitioners > City > Specialty) must match.
    if (cityLabel && param.typeOfProviderSlug) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': position++,
        'name': cityLabel,
        'item': `https://www.prompthealth.ca/practitioners/area/${param.city}`,
      });
      if (specialtyLabel) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          'position': position,
          'name': specialtyLabel,
          'item': `https://www.prompthealth.ca/practitioners/area/${param.city}/type/${param.typeOfProviderSlug}`,
        });
      }
    } else if (cityLabel && param.categorySlug) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': position++,
        'name': cityLabel,
        'item': `https://www.prompthealth.ca/practitioners/area/${param.city}`,
      });
      if (specialtyLabel) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          'position': position,
          'name': specialtyLabel,
          'item': `https://www.prompthealth.ca/practitioners/area/${param.city}/category/${param.categorySlug}`,
        });
      }
    } else {
      if (specialtyLabel) {
        const pathSegment = param.categorySlug
          ? `category/${param.categorySlug}`
          : `type/${param.typeOfProviderSlug}`;
        breadcrumbItems.push({
          '@type': 'ListItem',
          'position': position++,
          'name': specialtyLabel,
          'item': `https://www.prompthealth.ca/practitioners/${pathSegment}`,
        });
      }

      if (cityLabel) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          'position': position,
          'name': cityLabel,
        });
      }
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbItems,
    };
  }

  /**
   * Ensures BreadcrumbList JSON-LD is present in the SSR output even when the
   * listing API call fails or returns no results.  If setListingJsonLd() already
   * injected JSON-LD (which includes both ItemList + BreadcrumbList), this is a
   * no-op because the flag is set.
   */
  private ensureBreadcrumbJsonLd(): void {
    if (this._jsonLdSet) return;
    try {
      const schemas: object[] = [];
      const breadcrumbSchema = this.buildBreadcrumbSchema();
      if (breadcrumbSchema) schemas.push(breadcrumbSchema);
      const faqSchema = this.buildFaqSchema();
      if (faqSchema) schemas.push(faqSchema);
      if (schemas.length > 0) {
        this._jsonLdService.setJsonLd(schemas);
        this._jsonLdSet = true;
      }
    } catch (e) {
      // Non-critical — don't let breadcrumb/FAQ injection crash SSR
    }
  }

  private resolveTypeOfProviderSlug(slug: string): string | null {
    if (!this.questionnaires?.typeOfProvider?.answers) return null;
    const answer = this.questionnaires.typeOfProvider.answers.find(
      a => slugify(a.item_text) === slug
    );
    return answer ? answer._id : null;
  }

  private resolveCategorySlug(slug: string): string | null {
    if (!this._catService.categoryList) return null;
    const cat = this._catService.categoryListFlatten.find(
      c => slugify(c.item_text) === slug
    );
    return cat ? cat._id : null;
  }

  initController() {
    const filterData: IFilterData = {
      ...this._route.snapshot.queryParams as IExpertFinderFilterQueryParams,
      ...this._route.snapshot.params as IExpertFinderFilterParams,
    }

    // Resolve typeOfProviderSlug to typeOfProviderId for the controller
    if (filterData.typeOfProviderSlug && !filterData.typeOfProviderId) {
      const resolvedId = this.resolveTypeOfProviderSlug(filterData.typeOfProviderSlug);
      if (resolvedId) {
        filterData.typeOfProviderId = resolvedId;
      }
    }

    // Resolve categorySlug to categoryId for the controller
    if (filterData.categorySlug && !filterData.categoryId) {
      const resolvedId = this.resolveCategorySlug(filterData.categorySlug);
      if (resolvedId) {
        filterData.categoryId = resolvedId;
      }
    }

    this.controller = new ExpertFinderController(filterData, {countPerPage: 10});
    if (!this.formFilter) {
      this.formFilter = this.controller.createForm();
      this.f.distance.valueChanges.subscribe(() => {
        this.showFilterDistanceLabel();
      });
    }

    // During SSR, skip search() — prefetchListingForSSR() handles data fetching
    // so zone.js properly tracks the HTTP call and Angular Universal waits for it.
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (!this.controller.locationInitializedByFilter) {
      this.viewState.isGettingUserLocation = true;
      this._geoService.getCurrentLocation().then(location => {
        this.viewState.isGettingUserLocation = false;
        this.controller.updateFilterByUserLocation(location);
        this.search();
      }, () => {
        this.viewState.isGettingUserLocation = false;
        this.search();
      });
    } else {
      this.search();
    }
  }

  getMapBoundingRect(): IRect {
    if(!this._uService.isServer) {
      const header = document.getElementsByTagName('header')[0] as HTMLElement;
      const h = window.innerHeight;
      const hHeader = header.clientHeight;
      return {top: hHeader, height: h - hHeader}; 
    } else {
      return {top: 0, height: 0};
    }
  }

  onClickButtonToggleVirtual() { 
    this.controller.updateFilter('virtual', !this.isVirtual);

    const [path, query] = this._modalService.currentPathAndQueryParams;
    this._router.navigate([path], {queryParams: this.controller.toQueryParams()});
    // this.search();
  }

  // onSearchBarSubmitted(e: SearchKeywords) {
  //   this.controller.updateFilterByKeywords(e);
  //   const [path, query] = this._modalService.currentPathAndQueryParams;
  //   this._router.navigate([path], {queryParams: this.controller.toQueryParams()});
  // }
  
  onMapZoomChanged(e: number) {
    this.mapDataCurrent.zoom = e;
  }

  onMapMoved(e: google.maps.LatLngBounds) {
    const bounds = e.toJSON();
    const center = e.getCenter();    
    const dist = getDistanceFromLatLng(bounds.north, bounds.east, bounds.south, bounds.west);
    this.mapDataCurrent.lat = center.lat();
    this.mapDataCurrent.lng = center.lng();
    this.mapDataCurrent.dist = Math.floor(dist);
  }

  onMapClicked(e: Event) {
    this.selectedProfessionalInMap = null;
  }

  onMapMarkerClicked(professional: Professional) {
    if(this.selectedProfessionalInMap && professional._id == this.selectedProfessionalInMap._id) {
      this.selectedProfessionalInMap.setMapIcon();
      this.selectedProfessionalInMap = null;
    } else {
      if(this.selectedProfessionalInMap) {
        this.selectedProfessionalInMap.setMapIcon();
      }
      
      this.selectedProfessionalInMap = professional;
      this.selectedProfessionalInMap.setMapIcon(true);
      this._changeDetector.detectChanges();  
    }
  }

  changePage(i: number) {
    this.pageCurrent = i;

    if (this.controller.totalPractitioners > 0) {
      // Server-side pagination: fetch page from backend
      const payload = this.controller.toPayload({ count: 20, page: i });
      this._sharedService.postNoAuth(payload, 'user/filter').pipe(takeUntil(this.destroy$)).subscribe((res: IGetPractitionersResult) => {
        if (res.data.total != null) {
          this.controller.setTotalPractitioners(res.data.total);
        }
        this.controller.setPage(i);
        this.controller.setProfessionals(res.data.dataArr, this._uService.isBrowser);
        this.controller.setProfesionnalsPerPage(i);
        this.controller.initPaginator(i);
        this._changeDetector.detectChanges();
        if (this._uService.isBrowser) {
          smoothWindowScrollTo(0);
        }
      });
    } else {
      // Client-side pagination fallback (e.g. non-paginated responses)
      this.controller.setProfesionnalsPerPage(i);
      this.controller.initPaginator(i);
      if (this._uService.isBrowser) {
        smoothWindowScrollTo(0);
      }
    }
  }

  onClickButtonUpdateUserLocation() {
    this.viewState.isGettingUserLocation = true;
    this._geoService.updateCurrentLocation().then(location => {
      this.viewState.isGettingUserLocation = false;
      this.controller.updateFilterByUserLocation(this.mapDataCurrent);
      setTimeout(() => {
        this.controller.updateFilterByUserLocation(location);
        this._changeDetector.detectChanges();  
      }, 100);
    }, error => {
      this.viewState.isGettingUserLocation = false;
      if (error.code == 1) {
        this._toastr.success('Please enable your location in order to see options in your geographical area. Alternatively you can only view virtual options!')
      } else {
        this._toastr.error('Could not get current location');
      }
    });
  }

  onClickButtonSearchInThisArea() {
    this.controller.updateFilterByMap(this.mapDataCurrent);
    this.f.distance.setValue(this.mapDataCurrent.dist);

    const [path, query] = this._modalService.currentPathAndQueryParams;
    this._router.navigate([path], {queryParams: this.controller.toQueryParams()});
    // this.search();
  }

  onClickButtonMapSize() {
    this.viewState.style = (this.viewState.style == 'list') ? 'map' : 'list';
  }

  onClickButtonFilterRating(i: number) {
    const valueCurrent = this.f.rating.value;
    const valueNext = valueCurrent == i ? 0 : i;
    this.f.rating.setValue(valueNext);
  }

  onFilterReseted() {
    this.filters.forEach(filter => {
      filter.deselectAll();
      this.controller.updateFilter(filter.id as FilterFieldName, []);
    });
    this.f.distance.setValue(100);
    this.f.rating.setValue(0);

    this.controller.updateFilter('dist', this.f.distance.value);
    this.controller.updateFilter('rating', this.f.rating.value);

    this.closeModal();
  }

  onFilterSaved() {
    this.filters.forEach(filter => {
      this.controller.updateFilter(filter.id as FilterFieldName, filter.getSelected());
    });

    this.controller.updateFilter('dist', this.f.distance.value);
    this.controller.updateFilter('rating', this.f.rating.value);

    this.closeModal();
  }

  private timerFilterDistance: any;
  showFilterDistanceLabel() {
    this.distanceFilterData.isLabelShown = true;
    if(this.timerFilterDistance) {
      clearTimeout(this.timerFilterDistance);
    }
    this.timerFilterDistance = setTimeout(() => {
      this.distanceFilterData.isLabelShown = false;
    }, 1200);
  } 
  getDistanceFilterLabelPosition(val: number) {
    const d = this.distanceFilterData;
    const left = 100 / (d.max - d.min) * (val - d.min);
    return left > 100 ? 100 : left < 0 ? 0 : left;
  }

  closeModal() {
    const [path, query] = this._modalService.currentPathAndQueryParams;
    this._modalService.hide(true, [path], this.controller.toQueryParams());
  }

  preventDefaultClickAction(e: Event, stopPropagation = true) {
    e.preventDefault();
    if(stopPropagation) {
      this.stopPropagation(e);
    }
  }

  stopPropagation(e: Event) {
    e.stopPropagation();    
  }

  private async prefetchListingForSSR(): Promise<void> {
    const LISTING_KEY = makeStateKey<any>('listing-ssr-data');
    const payload = this.controller.toPayload({ count: 20, page: 1 });
    const params = this._route.snapshot.params as IExpertFinderFilterParams;

    // Guard: if the route has a categorySlug but the payload has no services
    // (resolveCategorySlug() returned null during initController because
    // categoryList wasn't ready), resolve it now and inject into the payload
    // so the backend applies the correct $in filter.
    if ((!payload.services || payload.services.length === 0) && params.categorySlug) {
      const cat = this._catService.categoryListFlatten.find(
        c => slugify(c.item_text) === params.categorySlug
      );
      if (cat) {
        payload.services = [cat._id];
      } else {
        // Category list not loaded yet during SSR — fetch directly from API
        try {
          const res: any = await this._sharedService
            .getNoAuth('questionare/get-service')
            .pipe(take(1))
            .toPromise();
          if (res?.statusCode === 200 && res?.data) {
            let matched = false;
            for (const group of res.data) {
              if (group.category_type?.toLowerCase() === 'goal') {
                for (const rootCat of (group.category || [])) {
                  if (slugify(rootCat.item_text) === params.categorySlug) {
                    payload.services = [rootCat._id];
                    matched = true;
                    break;
                  }
                  for (const sub of (rootCat.subCategory || [])) {
                    if (slugify(sub.item_text) === params.categorySlug) {
                      payload.services = [sub._id];
                      matched = true;
                      break;
                    }
                  }
                  if (matched) break;
                }
                break;
              }
            }
          }
        } catch (e) {
          console.warn('prefetchListingForSSR: failed to fetch categories for slug resolution', e);
        }
      }
    }

    // Guard: if the route has a typeOfProviderSlug but the payload has no services
    // (resolveTypeOfProviderSlug() returned null during initController because
    // questionnaire data wasn't ready), resolve it now so the backend filters
    // correctly and schema injection receives the right practitioners.
    if ((!payload.services || payload.services.length === 0) && params.typeOfProviderSlug && !params.categorySlug) {
      const resolvedId = this.resolveTypeOfProviderSlug(params.typeOfProviderSlug);
      if (resolvedId && !payload.services?.includes(resolvedId)) {
        payload.services = [...(payload.services || []), resolvedId];
      }
    }

    return new Promise<void>((resolve) => {
      this._sharedService.postNoAuth(payload, 'user/filter').pipe(take(1)).subscribe(
        (res: IGetPractitionersResult) => {
          try {
            this._transferState.set(LISTING_KEY, res);
            if (res?.data?.dataArr) {
              if (res.data.total != null) {
                this.controller.setTotalPractitioners(res.data.total);
              }
              this.controller.setPage(1);
              this.controller.setProfessionals(res.data.dataArr, false);
              // Populate the per-page slice so the template iterates over
              // controller.professionals during SSR. Without this the grid
              // is empty even though professionalsInitialized is true,
              // producing the "N providers found / zero cards" mismatch
              // that AI crawlers and Googlebot observe.
              this.controller.setProfesionnalsPerPage(1);
              this.controller.initPaginator(1);
              const professionals = this.controller.professionalsAll;
              if (professionals && professionals.length > 0) {
                this.setListingJsonLd(professionals);
              } else if (params.city && payload.latLong) {
                // Geo-filtered query returned 0 results for a combined
                // specialty+city page. Retry without geo filter so we can
                // still emit ItemList JSON-LD for SEO purposes.
                const fallbackPayload = { ...payload, latLong: '', miles: null };
                this._sharedService.postNoAuth(fallbackPayload, 'user/filter')
                  .pipe(take(1)).subscribe(
                    (fallbackRes: IGetPractitionersResult) => {
                      try {
                        if (fallbackRes?.data?.dataArr) {
                          if (fallbackRes.data.total != null) {
                            this.controller.setTotalPractitioners(fallbackRes.data.total);
                          }
                          this.controller.setProfessionals(fallbackRes.data.dataArr, false);
                          this.controller.setProfesionnalsPerPage(1);
                          this.controller.initPaginator(1);
                          const fallbackPros = fallbackRes.data.dataArr.map(
                            d => new Professional(d.userId, d.userData)
                          );
                          if (fallbackPros.length > 0) {
                            this.setListingJsonLd(fallbackPros);
                          } else {
                            // Both geo and geo-less queries returned 0 results.
                            // Override to noindex so we don't serve an empty
                            // allowlisted page to Google — even though setMeta()
                            // already ran, the Meta service can be updated again.
                            this._uService.setRobots('noindex, follow');
                          }
                        }
                      } catch (e) {
                        // Non-critical — don't let fallback crash SSR
                      }
                      resolve();
                    },
                    () => { resolve(); }
                  );
                return; // resolve() is handled by the fallback subscription
              } else if (params.city && (params.typeOfProviderSlug || params.categorySlug)) {
                // No geo filter applied but still 0 results on a city+specialty page.
                this._uService.setRobots('noindex, follow');
              }
            }
          } catch (e) {
            // Gracefully handle data processing errors during SSR
          }
          resolve();
        },
        () => { resolve(); }
      );
    });
  }

  search() {
    const LISTING_KEY = makeStateKey<any>('listing-ssr-data');
    const cached = this._transferState.get(LISTING_KEY, null);
    if (cached) {
      this._transferState.remove(LISTING_KEY);
      this.applySearchResults(cached as IGetPractitionersResult);
      return;
    }

    const payload = this.controller.toPayload({ count: 20, page: 1 });
    const geoWasApplied = !!(payload.latLong && payload.miles);
    this.controller.disposeProfesionnals();
    this._sharedService.postNoAuth(payload, 'user/filter').pipe(takeUntil(this.destroy$)).subscribe((res: IGetPractitionersResult) => {
      // Geo-fallback: if geo-filtering returned no results but providers exist,
      // retry without geo params so directory pages are never empty (SEO-027).
      if (geoWasApplied && (!res.data.dataArr || res.data.dataArr.length === 0) && res.data.total > 0) {
        this.controller.clearGeoFilter();
        const fallbackPayload = this.controller.toPayload({ count: 20, page: 1 });
        this._sharedService.postNoAuth(fallbackPayload, 'user/filter').pipe(takeUntil(this.destroy$)).subscribe((fallbackRes: IGetPractitionersResult) => {
          this.applySearchResults(fallbackRes);
        });
        return;
      }
      this.applySearchResults(res);
    })
  }

  private applySearchResults(res: IGetPractitionersResult) {
    if (res.data.total != null) {
      this.controller.setTotalPractitioners(res.data.total);
    }
    this.controller.setPage(1);
    this.controller.setProfessionals(res.data.dataArr, this._uService.isBrowser);
    const professionals = this.controller.professionalsAll;
    this.formCompare = new FormGroup({});
    if (professionals) {
      professionals.forEach(p => {
        this.formCompare.addControl(p._id, new FormControl());
      });
      if (this.queryParamsCurrent && this.queryParamsCurrent.keyloc) {
        this.controller.updateFilterByProfessionalsLocation();
      }
      this.setListingJsonLd(professionals);
    }
    this.pageCurrent = 1;
    this.controller.setProfesionnalsPerPage(1);
    this.controller.initPaginator(1);
  }

  onChangeCompareValue(id: string) {
    const selected = this.fCompare[id].value;
    if(selected) {
      this.addToCompareList(id);
    } else {
      this.removeFromCompareList(id, false);
    }
  }
  removeFromCompareList(id: string, updateValue: boolean = true) {
    this.compareList = this.compareList.filter(p => p._id != id);
    const controller = this.fCompare[id];
    if(updateValue && controller) {
      controller.setValue(false);
    }
  }

  addToCompareList(id: string) {
    const exist = this.compareList.find(p => p.id == id);
    if(!exist) {
      this.compareList.push(this.professionalOf(id));
    }
  }

  setCompare() {
    this._sharedService.setCompareList(this.compareList);
    this._router.navigate(['/compare-practitioners']);
  }

}

interface IViewState {
  style: 'list' | 'map';
  isGettingUserLocation: boolean;
}

interface IRect {
  top: number,
  height: number
}