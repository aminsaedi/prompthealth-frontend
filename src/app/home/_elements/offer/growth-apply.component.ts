import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { DENTISTS_LANDING } from '../../growth-landing/landings/dentists';

const API_URL = environment.config.API_URL;
export const GROWTH_APPLY_MODAL_ID = 'growth-apply';

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
  heading: 'Apply for PromptHealth Growth',
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
 * The PromptHealth Growth application (her section 3), in a modal opened by
 * Apply on the plan section and in the /pro FAQ.
 *
 * Every application is saved and emailed to info@ by the server. A dentist is
 * then sent on to the consultation booking the For Dentists page uses; anyone
 * else is told Growth is for dental practices for now, and the server adds
 * them to the Growth waitlist.
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
  @Input() source: 'for-practitioners' | 'plans' | 'pro' | 'other' = 'other';

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

  public step: 'form' | 'dentist' | 'other' = 'form';
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

  ngOnDestroy(): void {
    clearTimeout(this.redirectTimer);
  }

  open(): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { modal: GROWTH_APPLY_MODAL_ID },
      queryParamsHandling: 'merge',
    });
  }

  close(): void {
    clearTimeout(this.redirectTimer);
    this._modalService.hide();
  }

  onModalState(state: string): void {
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
      if (!body.hp_extra) {
        this._analytics.event('generate_lead', { form: 'growth-apply' });
      }
      if (res.data.isDentist) {
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
