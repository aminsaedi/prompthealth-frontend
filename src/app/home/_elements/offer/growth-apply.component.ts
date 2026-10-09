import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { DENTISTS_LANDING } from '../../growth-landing/landings/dentists';
import { PRO_JOIN } from './offer-copy';

const API_URL = environment.config.API_URL;
export const GROWTH_APPLY_MODAL_ID = 'growth-apply';

/* Which offer the application is for. The form is the same; the address
 * carries the choice next to ?modal (?interest=pro), as the booking form's
 * address carries its button, so a reload or a shared link reopens it as it
 * was. Absent means Growth, which is what every older link meant. */
export type ApplyInterest = 'growth' | 'pro';
const INTEREST_PARAM = 'interest';

/* Her section 3, in her order. The backend accepts exactly these. */
export const PRACTITIONER_TYPES = [
  'Dentist',
  'Physiotherapist',
  'Chiropractor',
  'Naturopathic Doctor',
  'Registered Massage Therapist',
  'Other',
];

export const GROWTH_APPLY_COPY = {
  heading: {
    growth: 'Apply for PromptHealth Growth',
    pro: 'Apply for PromptHealth Pro',
  },
  intro: 'Tell us about your practice. We review every application personally.',
  labels: {
    name: 'Your name',
    email: 'Email',
    phone: 'Phone',
    practiceName: 'Practice name',
    city: 'City',
    website: 'Website or Instagram',
    practitionerType: 'What type of practitioner are you?',
    practitionerTypeOther: 'Please specify',
  },
  submit: 'Send Application',
  thanksDentist: 'Thanks! Next, book your 30-minute consultation.',
  bookButton: 'Book a 30-Minute Consultation',
  thanksOther: "Thanks for applying. PromptHealth Growth is currently available for dental practices. We'll contact you as soon as it opens for your profession.",
  /* A dentist who applied for Pro does not need to apply: Pro is open to
   * dental clinics, and the plan choice is one click away. */
  thanksProDentist: 'Thanks! PromptHealth Pro is open to dental clinics now, so you can join today.',
  joinProButton: PRO_JOIN.button,
  thanksProOther: "Thanks for applying. PromptHealth Pro is for dental clinics for now, and you're on the list. We'll be in touch when it opens to your profession.",
  error: 'Your application could not be sent. Please try again, or email info@prompthealth.ca.',
};

type ApplyField = 'name' | 'email' | 'phone' | 'practiceName' | 'city' | 'website' | 'practitionerType' | 'practitionerTypeOther';

const VALIDATION: { [field in ApplyField]: string } = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter your phone number.',
  practiceName: 'Please enter your practice name.',
  city: 'Please enter your city.',
  website: '',
  practitionerType: 'Please choose your type of practice.',
  practitionerTypeOther: 'Please tell us your type of practice.',
};

const TEXT_FIELDS: { name: ApplyField; type: string; autocomplete: string; max: number; optional?: boolean }[] = [
  { name: 'name', type: 'text', autocomplete: 'name', max: 120 },
  { name: 'email', type: 'email', autocomplete: 'email', max: 200 },
  { name: 'phone', type: 'tel', autocomplete: 'tel', max: 40 },
  { name: 'practiceName', type: 'text', autocomplete: 'organization', max: 160 },
  { name: 'city', type: 'text', autocomplete: 'address-level2', max: 120 },
  { name: 'website', type: 'text', autocomplete: 'url', max: 300, optional: true },
];

function filled(control: AbstractControl): ValidationErrors | null {
  return String(control.value || '').trim() ? null : { required: true };
}

/* The same rule as the booking form: the server's refuses an address without
 * a dot in its domain, and should not be the one to say so. */
function emailAddress(control: AbstractControl): ValidationErrors | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(control.value || '').trim()) ? null : { email: true };
}

/* Seconds the dentists' message stays up before the booking page opens. */
const BOOKING_REDIRECT_MS = 2500;

/*
 * The PromptHealth Growth and Pro application (her section 3 of offer v2,
 * and her brief of 2026-10-08), in a modal opened by Apply on the plan
 * section, on /for-dentists and in the /pro FAQ.
 *
 * Every application is saved and emailed to info@ by the server. For Growth,
 * a dentist is then sent on to the consultation booking the For Dentists page
 * uses; anyone else is told Growth is for dental practices for now, and the
 * server adds them to the Growth waitlist. For Pro, a dentist is offered the
 * plan choice, since Pro is already open to dental clinics, and anyone else is
 * told they are on the list.
 *
 * Like the booking form, it is created with the page, on the server render
 * too, and does no browser work until it is used.
 */
@Component({
  selector: 'growth-apply',
  templateUrl: './growth-apply.component.html',
  styleUrls: ['./growth-apply.component.scss'],
})
export class GrowthApplyComponent implements OnDestroy {
  /* Which page the form was opened on, stored with the application. */
  @Input() source: 'for-practitioners' | 'for-dentists' | 'plans' | 'pro' | 'home' | 'other' = 'other';

  @ViewChild('heading') private heading: ElementRef;

  public readonly modalId = GROWTH_APPLY_MODAL_ID;
  public readonly copy = GROWTH_APPLY_COPY;
  public readonly textFields = TEXT_FIELDS;
  public readonly types = PRACTITIONER_TYPES;
  public readonly validation = VALIDATION;
  public readonly bodyStyle = { 'max-width': '560px', width: 'calc(100vw - 30px)', 'max-height': 'calc(100vh - 40px)', 'overflow-y': 'auto' };

  public readonly form = new FormGroup({
    name: new FormControl('', [filled, Validators.maxLength(120)]),
    email: new FormControl('', [filled, emailAddress, Validators.maxLength(200)]),
    phone: new FormControl('', [filled, Validators.maxLength(40)]),
    practiceName: new FormControl('', [filled, Validators.maxLength(160)]),
    city: new FormControl('', [filled, Validators.maxLength(120)]),
    website: new FormControl('', [Validators.maxLength(300)]),
    practitionerType: new FormControl('', [filled]),
    practitionerTypeOther: new FormControl('', [Validators.maxLength(120)]),
    hp_extra: new FormControl(''),
  });

  public interest: ApplyInterest = 'growth';
  public readonly proJoin = PRO_JOIN;
  /* What the last successful application was for, so reopening the form for
   * the other offer starts at the form again rather than at a thank-you
   * meant for the first. */
  private sentInterest: ApplyInterest = null;

  public step: 'form' | 'dentist' | 'other' | 'pro-dentist' | 'pro-other' = 'form';
  public submitted = false;
  public isSending = false;
  public errorMessage = '';
  public bookingUrl = '';

  private redirectTimer: any = null;
  private readonly http: HttpClient;

  constructor(
    httpBackend: HttpBackend,
    private _router: Router,
    private _route: ActivatedRoute,
    private _uService: UniversalService,
    private _analytics: AnalyticsService,
    private _modalService: ModalService,
  ) {
    this.http = new HttpClient(httpBackend);
  }

  get isOther(): boolean { return this.form.value.practitionerType === 'Other'; }

  get headingText(): string { return this.copy.heading[this.interest]; }

  ngOnDestroy(): void {
    clearTimeout(this.redirectTimer);
  }

  /* Always names the interest, or clears it for Growth, so an earlier
   * opening's ?interest=pro left in the address cannot carry over. */
  open(interest: ApplyInterest = 'growth'): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { modal: GROWTH_APPLY_MODAL_ID, [INTEREST_PARAM]: interest === 'pro' ? 'pro' : null },
      queryParamsHandling: 'merge',
    });
  }

  close(): void {
    clearTimeout(this.redirectTimer);
    this._modalService.hide();
  }

  onModalState(state: string): void {
    /* Read on the server render too, so a link to the Pro form is served
     * with the Pro heading. */
    if (state === 'open') {
      this.interest = this._route.snapshot.queryParamMap.get(INTEREST_PARAM) === 'pro' ? 'pro' : 'growth';
      if (this.step !== 'form' && this.sentInterest !== this.interest) {
        this.step = 'form';
        this.submitted = false;
        this.errorMessage = '';
      }
    }
    if (state !== 'open' || !this._uService.isBrowser) {
      clearTimeout(this.redirectTimer);
      return;
    }
    setTimeout(() => {
      const el: HTMLElement = this.heading && this.heading.nativeElement;
      if (el && typeof el.focus === 'function') {
        try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      }
    });
  }

  showError(name: ApplyField): boolean {
    const control = this.form.get(name);
    if (name === 'practitionerTypeOther') {
      return this.isOther && !String(control.value || '').trim() && (control.touched || this.submitted);
    }
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit(): void {
    if (this.isSending || !this._uService.isBrowser) { return; }
    this.submitted = true;
    this.errorMessage = '';
    const otherMissing = this.isOther && !String(this.form.value.practitionerTypeOther || '').trim();
    if (this.form.invalid || otherMissing) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const text = (value: any) => String(value || '').trim();
    const body: { [key: string]: string } = {
      name: text(v.name),
      email: text(v.email),
      phone: text(v.phone),
      practiceName: text(v.practiceName),
      city: text(v.city),
      practitionerType: v.practitionerType,
      source: this.source,
      interest: this.interest,
      hp_extra: text(v.hp_extra).slice(0, 200),
    };
    if (text(v.website)) { body.website = text(v.website); }
    if (this.isOther) { body.practitionerTypeOther = text(v.practitionerTypeOther); }

    this.isSending = true;
    this.http.post<any>(API_URL + 'growth/apply', body).subscribe(res => {
      this.isSending = false;
      if (!res || res.statusCode !== 200 || !res.data) {
        this.errorMessage = this.copy.error;
        return;
      }
      /* The server's answer names the offer it saved; an older server that
       * does not is answering for the one sent. */
      const interest: ApplyInterest = res.data.interest === 'pro' || res.data.interest === 'growth' ? res.data.interest : this.interest;
      this.sentInterest = interest;
      if (!body.hp_extra) {
        this._analytics.event('generate_lead', { form: interest === 'pro' ? 'pro-apply' : 'growth-apply' });
      }
      if (interest === 'pro') {
        this.step = res.data.isDentist ? 'pro-dentist' : 'pro-other';
      } else if (res.data.isDentist) {
        this.step = 'dentist';
        this.bookingUrl = this.calendlyUrl(body.name, body.email);
        /* Her checklist: the applicant lands on the consultation booking. The
         * message is read first; the button is there for anyone quicker. */
        this.redirectTimer = setTimeout(() => this.goToBooking(), BOOKING_REDIRECT_MS);
      } else {
        this.step = 'other';
      }
    }, (error: HttpErrorResponse) => {
      this.isSending = false;
      const message = error && error.error && typeof error.error.message === 'string' ? error.error.message : '';
      this.errorMessage = error && error.status === 400 && message ? message : this.copy.error;
    });
  }

  goToBooking(): void {
    clearTimeout(this.redirectTimer);
    if (this.bookingUrl && this._uService.isBrowser) {
      window.location.href = this.bookingUrl;
    }
  }

  /* The For Dentists page's Calendly event, with the name and email filled
   * in. Calendly reads both from the query of its own page. */
  private calendlyUrl(name: string, email: string): string {
    const base = DENTISTS_LANDING.booking.calendlyUrl;
    if (!base) { return ''; }
    const query = 'name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email);
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + query;
  }
}
