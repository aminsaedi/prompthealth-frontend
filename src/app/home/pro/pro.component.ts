import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LoginStatusType, ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IProError, ProInterval, ProService } from 'src/app/shared/services/pro.service';
import { GrowthApplyComponent } from '../_elements/offer/growth-apply.component';
import { PLAN_CHOICE, PRO_FAQ, PRO_PAGE, PRO_TESTIMONIAL_ATTRIBUTION, PRO_TESTIMONIAL_QUOTE } from './pro-copy';

export const PRO_PLAN_MODAL_ID = 'pro-plan';

/* Who is reading, as far as the join button is concerned. */
type Reader = 'checking' | 'guest' | 'basic' | 'pro' | 'other';

/*
 * /pro, PromptHealth Pro (Hedieh's section 5), in the For Dentists page's
 * style. The header links it only on /for-dentists.
 *
 * Both join buttons open the plan choice (12.1). Continue to Payment sends a
 * signed-in practitioner or clinic straight to Stripe Checkout; anyone else
 * registers first with the usual provider form and comes back through
 * /pro/checkout, which goes on to Stripe. While payments are closed (an MCP
 * switch, no deploy) every join button reads "Coming soon" and collects
 * nothing. A failure to ask counts as closed.
 */
@Component({
  selector: 'app-pro',
  templateUrl: './pro.component.html',
  styleUrls: ['./pro.component.scss'],
})
export class ProComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('apply') private apply: GrowthApplyComponent;

  public readonly page = PRO_PAGE;
  public readonly choice = PLAN_CHOICE;
  public readonly faqs = PRO_FAQ.map(item => ({ ...item }));
  public readonly planModalId = PRO_PLAN_MODAL_ID;
  public readonly planBodyStyle = { 'max-width': '520px', width: 'calc(100vw - 30px)' };
  public readonly testimonial = { quote: PRO_TESTIMONIAL_QUOTE, attribution: PRO_TESTIMONIAL_ATTRIBUTION };
  /* "January 27, 2027", or empty while the API names no session. */
  public nextSession = '';

  /* Closed until the API says open, and on the server render. */
  public paymentsEnabled = false;
  public reader: Reader = 'checking';
  public interval: ProInterval = 'month';
  public isSending = false;
  public errorMessage = '';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _uService: UniversalService,
    private _jsonLd: JsonLdService,
    private _modalService: ModalService,
    private _profileService: ProfileManagementService,
    private _pro: ProService,
  ) {}

  /* A member is sent to the library whether or not payments are open. */
  get joinDisabled(): boolean { return !this.paymentsEnabled && this.reader !== 'pro'; }

  get joinLabel(): string {
    if (this.reader === 'pro') { return this.page.memberButton; }
    if (!this.paymentsEnabled) { return this.page.comingSoon; }
    return this.reader === 'basic' ? this.page.upgradeButton : this.page.joinButton;
  }

  ngOnInit(): void {
    this.setMeta();
    this.setJsonLd();
    this._pro.config().pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.paymentsEnabled = c.paymentsEnabled;
      this.nextSession = formatSessionDate(c.nextLiveSessionAt);
    });

    if (this._uService.isServer) {
      this.reader = 'guest';
      return;
    }
    this.onLoginStatus(this._profileService.loginStatus);
    this._profileService.loginStatusChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => this.onLoginStatus(status));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._jsonLd.removeJsonLd();
  }

  onJoin(): void {
    if (this.reader === 'pro') {
      this._router.navigate(['/pro/library']);
      return;
    }
    if (!this.paymentsEnabled) { return; }
    this.errorMessage = '';
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { modal: PRO_PLAN_MODAL_ID },
      queryParamsHandling: 'merge',
    });
  }

  closePlan(): void {
    this._modalService.hide();
  }

  /* 12.1, Continue to Payment. */
  continueToPayment(): void {
    if (!this.paymentsEnabled || this.isSending) { return; }
    const next = '/pro/checkout?interval=' + this.interval;
    if (this.reader === 'guest') {
      /* The same form as a free profile; the address it returns to opens
       * Checkout. Replaced, so Back from the form lands on /pro, not on the
       * modal. */
      this._router.navigate(['/auth/registration/sp'], { queryParams: { next }, replaceUrl: true });
      return;
    }
    this.isSending = true;
    this.errorMessage = '';
    this._pro.checkout(this.interval).subscribe(res => {
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        this.isSending = false;
        this.errorMessage = 'Checkout could not be opened. Please try again.';
      }
    }, (error: IProError) => {
      this.isSending = false;
      if (error.status === 401) {
        this._router.navigate(['/auth/login'], { queryParams: { next } });
        return;
      }
      this.errorMessage = error.message || 'Checkout could not be opened. Please try again.';
    });
  }

  /* "Apply for Pro" in the FAQ opens the application here, in Pro mode,
   * rather than following its address, which exists only for a reader
   * without script. */
  onFaqClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target && target.closest ? target.closest('a[href*="modal=growth-apply"]') : null;
    if (link && this.apply) {
      event.preventDefault();
      event.stopPropagation();
      this.apply.open('pro');
    }
  }

  private onLoginStatus(status: LoginStatusType): void {
    if (status === 'notChecked' || status === 'loggingIn') {
      this.reader = 'checking';
      return;
    }
    const profile = this._profileService.profile;
    if (status !== 'loggedIn' || !profile) {
      this.reader = 'guest';
      return;
    }
    if (!profile.isProvider) {
      this.reader = 'other';
      return;
    }
    this.reader = 'basic';
    this._pro.me().pipe(takeUntil(this.destroy$)).subscribe(me => {
      this.reader = me && me.isPro ? 'pro' : 'basic';
    }, () => {});
  }

  private setMeta(): void {
    this._uService.setMeta('/pro', {
      title: this.page.seo.title,
      description: this.page.seo.description,
      robots: 'index, follow',
      image: `${environment.config.FRONTEND_BASE}/assets/img/share/for-dentists-share.v1.jpg`,
      imageWidth: 1200,
      imageHeight: 630,
      imageType: 'image/jpeg',
      imageAlt: 'Hedieh Safiyari on set at a practice, with 1.7M followers and 400+ dental videos',
    });
  }

  private setJsonLd(): void {
    const url = 'https://www.prompthealth.ca/pro';
    this._jsonLd.setJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'PromptHealth Pro',
        description: this.page.seo.description,
        url,
        serviceType: 'Video and social media content ideas for dental clinics',
        provider: { '@type': 'Organization', name: 'PromptHealth', url: 'https://www.prompthealth.ca' },
        areaServed: { '@type': 'Country', name: 'Canada' },
        /* Monthly only: the yearly plan is offered at checkout, not on the
         * page (her brief of 2026-10-07), and the markup says what the page
         * says. */
        offers: [
          {
            '@type': 'Offer',
            name: 'Monthly',
            price: '149.00',
            priceCurrency: 'CAD',
            url,
            priceSpecification: { '@type': 'UnitPriceSpecification', price: '149.00', priceCurrency: 'CAD', unitText: 'MONTH', valueAddedTaxIncluded: false },
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: PRO_FAQ.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a.replace(/<[^>]*>/g, '') },
        })),
      },
    ]);
  }
}

/* The session is at a time in Vancouver, so its date is Vancouver's: a
 * reader in Halifax at midnight should not see the day after. Anything that
 * is not a date gives no line rather than "Invalid Date". */
function formatSessionDate(value: any): string {
  if (typeof value !== 'string' || !value) { return ''; }
  const date = new Date(value);
  if (isNaN(date.getTime())) { return ''; }
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Vancouver', month: 'long', day: 'numeric', year: 'numeric',
    }).format(date);
  } catch (e) {
    return '';
  }
}
