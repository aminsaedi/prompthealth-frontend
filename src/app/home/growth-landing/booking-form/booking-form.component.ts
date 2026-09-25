import {
  Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild,
} from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { IResponseData } from 'src/app/models/response-data';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { JourneyService } from 'src/app/shared/services/journey.service';
import { AttributionService } from 'src/app/shared/services/attribution.service';
import { MetaPixelService } from 'src/app/shared/services/meta-pixel.service';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';
import { randomHex, uuidV4 } from 'src/app/_helpers/random-id';
import { GrowthBookingField, GrowthCtaPosition, IGrowthBooking, IGrowthLanding } from '../growth-landing.model';

const API_URL = environment.config.API_URL;
const CALENDLY_SCRIPT = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_ORIGIN = 'https://calendly.com';
/* What the backend accepts as the booked event (consultation/request/:id/scheduled). */
const CALENDLY_EVENT_URI = /^https:\/\/api\.calendly\.com\/scheduled_events\/[^\s]{1,150}$/;
const REQUEST_ID = /^[a-f0-9]{24}$/i;
const RETRY_SCHEDULED_MS = 3000;

/*
 * 'form' is step 1. 'schedule' is the Calendly step, which exists only when the
 * landing has a Calendly URL; 'scheduled' is the same step once a time is
 * booked. 'thanks' ends the flow without Calendly, or when Calendly fails to
 * load after the request was already saved.
 */
export type BookingStep = 'form' | 'schedule' | 'scheduled' | 'thanks';

interface IFieldSpec {
  name: GrowthBookingField;
  type: 'text' | 'email' | 'tel' | 'textarea';
  autocomplete: string;
  /* The backend's own limit for the field, so a visitor is stopped while
   * typing rather than refused after sending. */
  max: number;
}

const FIELDS: IFieldSpec[] = [
  { name: 'name',          type: 'text',     autocomplete: 'name',           max: 120 },
  { name: 'practiceName',  type: 'text',     autocomplete: 'organization',   max: 160 },
  { name: 'email',         type: 'email',    autocomplete: 'email',          max: 200 },
  { name: 'phone',         type: 'tel',      autocomplete: 'tel',            max: 40 },
  { name: 'city',          type: 'text',     autocomplete: 'address-level2', max: 120 },
  { name: 'patientSource', type: 'textarea', autocomplete: 'off',            max: 1000 },
];

/* Required means something other than spaces: the server trims first. */
function filled(control: AbstractControl): ValidationErrors | null {
  return String(control.value || '').trim() ? null : { required: true };
}

/* Stricter than Validators.email, which passes "name@clinic" with no domain
 * suffix. The server's check (Joi email) refuses that, and would do it after the
 * visitor had pressed Send. */
function emailAddress(control: AbstractControl): ValidationErrors | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(control.value || '').trim()) ? null : { email: true };
}

/*
 * The consultation request, and after it the Calendly step when there is one.
 *
 * It is projected into a <modal> whose content sits inside *ngIf, and projected
 * components are created with the page regardless, on the server render too.
 * So nothing here touches the browser until the visitor acts: the constructor
 * and ngOnInit do no browser work, the ids are made at the first submit, and
 * Calendly loads only at its step.
 *
 * The instance lives as long as the page, so closing and reopening the modal
 * keeps what was typed and which step it reached, and a second submit after a
 * failure reuses the same eventId, which the server treats as the same request.
 */
@Component({
  selector: 'booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent implements OnChanges, OnDestroy {

  @Input() landing: IGrowthLanding;
  @Input() ctaPosition: GrowthCtaPosition = 'direct';
  /* Whether the modal around this form is open. */
  @Input() open = false;

  @Output() stepChange = new EventEmitter<BookingStep>();

  @ViewChild('heading') private heading: ElementRef;

  public readonly fields = FIELDS;
  public readonly form = new FormGroup({
    name: new FormControl('', [filled, Validators.maxLength(120)]),
    practiceName: new FormControl('', [filled, Validators.maxLength(160)]),
    email: new FormControl('', [filled, emailAddress, Validators.maxLength(200)]),
    phone: new FormControl('', [filled, Validators.maxLength(40)]),
    city: new FormControl('', [filled, Validators.maxLength(120)]),
    patientSource: new FormControl('', [filled, Validators.maxLength(1000)]),
    /* The honeypot. A person never sees it, so anything in it came from a
     * script. It is sent rather than refused here: the server saves the request
     * marked as spam and sends no email, so a browser that autofilled it by
     * mistake loses nothing that cannot be recovered. */
    hp_extra: new FormControl(''),
  });

  public step: BookingStep = 'form';
  public submitted = false;
  public isSending = false;
  public errorMessage = '';

  private eventId = '';
  private scheduleSecret = '';
  private requestId = '';
  private honeypotFilled = false;
  private scheduledFor = '';
  private calendlyMounted = false;
  private listening = false;
  /* Calendly's details form is filled from this, and it is kept to be sent
   * again (resendPrefill). */
  private calendlyPrefill: { [key: string]: string } = null;
  private prefillResentOn: { [cue: string]: boolean } = {};
  /* Bypasses the app's HTTP interceptors. The global one turns every error
   * into a bare string, which hides the status this form decides its message
   * by, and answers any 401 by sending the visitor to the sign-in page, which
   * on a public form would throw a paid-for visitor off the page. */
  private readonly http: HttpClient;

  @ViewChild('calendly') set calendlyContainer(ref: ElementRef) {
    this.calendlyElement = ref ? ref.nativeElement : null;
    if (this.calendlyElement && this.step === 'schedule') {
      /* After this change detection pass, not inside it. */
      setTimeout(() => this.mountCalendly());
    }
  }
  private calendlyElement: HTMLElement = null;

  constructor(
    httpBackend: HttpBackend,
    private _zone: NgZone,
    private _uService: UniversalService,
    private _journey: JourneyService,
    private _attribution: AttributionService,
    private _pixel: MetaPixelService,
    private _analytics: AnalyticsService,
    private _cookies: CookieService,
  ) {
    this.http = new HttpClient(httpBackend);
  }

  get booking(): IGrowthBooking { return this.landing.booking; }
  get hasCalendly(): boolean { return !!this.booking.calendlyUrl; }
  get label(): string { return 'growth-' + this.landing.key; }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.open || !this._uService.isBrowser) { return; }
    if (this.open) {
      if (this.step === 'schedule') { this.listen(); }
      /* Into the dialog, without opening a phone's keyboard over it. */
      setTimeout(() => {
        const el: HTMLElement = this.heading && this.heading.nativeElement;
        if (el && typeof el.focus === 'function') {
          try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
        }
      });
    } else {
      this.unlisten();
    }
  }

  ngOnDestroy(): void {
    this.unlisten();
  }

  showError(name: GrowthBookingField): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit(): void {
    if (this.isSending || !this._uService.isBrowser) { return; }
    this.submitted = true;
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstError();
      return;
    }

    /* Once per form instance, so a retry after a failure is the same request
     * to the server (a duplicate eventId answers with the saved id). */
    if (!this.eventId) {
      this.eventId = uuidV4();
      this.scheduleSecret = randomHex(16);
    }

    const body = this.requestBody();
    this.honeypotFilled = !!body.hp_extra;
    this.isSending = true;

    this.http.post<IResponseData>(API_URL + 'consultation/request', body).subscribe(res => {
      this.isSending = false;
      const id = res && res.statusCode === 200 && res.data && res.data.id ? String(res.data.id) : '';
      if (!id) {
        this.errorMessage = (res && res.statusCode !== 200 && typeof res.message === 'string' && res.message.trim())
          || this.booking.errorGeneric;
        return;
      }
      this.requestId = id;
      /* The visitor sees the result first; reporting follows and can fail on
       * its own. */
      this.goTo(this.hasCalendly ? 'schedule' : 'thanks');
      if (!this.honeypotFilled) {
        this._pixel.track('Lead', { content_name: this.label }, this.eventId);
        this._analytics.event('generate_lead', { form: this.label });
      }
    }, (error: HttpErrorResponse) => {
      this.isSending = false;
      this.errorMessage = this.messageFor(error);
    });
  }

  private goTo(step: BookingStep): void {
    this.step = step;
    this.stepChange.emit(step);
    if (step === 'schedule') {
      this.listen();
    } else if (step === 'thanks') {
      this.unlisten();
    }
  }

  /*
   * The body the backend's schema allows, key by key. Attribution is copied
   * field by field rather than spread: the server refuses unknown keys, and a
   * field added to the attribution record later must not start failing every
   * booking. Optional values are left out when empty.
   */
  private requestBody(): { [key: string]: string } {
    const value = this.form.value;
    const text = (v: any) => String(v || '').trim();
    const body: { [key: string]: string } = {
      name: text(value.name),
      practiceName: text(value.practiceName),
      email: text(value.email),
      phone: text(value.phone),
      city: text(value.city),
      patientSource: text(value.patientSource),
      landing: this.landing.key,
      ctaPosition: this.ctaPosition,
      eventId: this.eventId,
      scheduleSecret: this.scheduleSecret,
      hp_extra: text(value.hp_extra).slice(0, 200),
    };
    const optional = (key: string, v: string) => { if (v) { body[key] = v; } };

    const a = this._attribution.get();
    optional('utmSource', a.utmSource);
    optional('utmMedium', a.utmMedium);
    optional('utmCampaign', a.utmCampaign);
    optional('utmContent', a.utmContent);
    optional('utmTerm', a.utmTerm);
    optional('fbclid', a.fbclid);
    optional('attributedAt', a.attributedAt);
    optional('landingPath', a.landingPath);
    optional('referrerHost', a.referrerHost);

    optional('sessionId', this._journey.session);
    optional('visitorId', this._journey.visitor);

    /* Meta's browser and click ids, present only once the Pixel has run. Kept
     * for a later Conversions API. */
    optional('fbp', this.cookie('_fbp'));
    optional('fbc', this.cookie('_fbc'));
    return body;
  }

  private cookie(name: string): string {
    try {
      return String(this._cookies.get(name) || '').slice(0, 500);
    } catch (e) {
      return '';
    }
  }

  /* The server's own words when it refused the request itself (a field it
   * would not take), which say what to fix. Anything else, a network failure,
   * a rate limit or a server fault, gets the message that offers the email
   * address instead. */
  private messageFor(error: HttpErrorResponse): string {
    const status = error ? error.status : 0;
    const body = error ? error.error : null;
    if (status >= 400 && status < 500 && status !== 429 &&
        body && typeof body.message === 'string' && body.message.trim()) {
      return body.message.trim().slice(0, 300);
    }
    return this.booking.errorGeneric;
  }

  private focusFirstError(): void {
    const first = FIELDS.find(f => this.form.get(f.name).invalid);
    if (!first) { return; }
    setTimeout(() => {
      const el = document.getElementById('booking-' + first.name);
      if (el) { el.focus(); }
    });
  }

  // ------------------------------------------------------------- Calendly

  private mountCalendly(): void {
    if (this.calendlyMounted || !this.calendlyElement || !this._uService.isBrowser) { return; }
    this.calendlyMounted = true;
    loadCalendly().then(() => {
      const calendly = (window as any).Calendly;
      if (!calendly || typeof calendly.initInlineWidget !== 'function') {
        throw new Error('Calendly missing');
      }
      const a = this._attribution.get();
      const utm: { [key: string]: string } = {};
      if (a.utmSource) { utm.utmSource = a.utmSource; }
      if (a.utmMedium) { utm.utmMedium = a.utmMedium; }
      if (a.utmCampaign) { utm.utmCampaign = a.utmCampaign; }
      if (a.utmContent) { utm.utmContent = a.utmContent; }
      if (a.utmTerm) { utm.utmTerm = a.utmTerm; }
      /* Names and campaigns go as objects, which Calendly encodes itself.
       * Joined into the address by hand, "Smith & Jones Dental" would end the
       * name at the ampersand. */
      const url = this.booking.calendlyUrl;
      const name = String(this.form.value.name || '').trim();
      const email = String(this.form.value.email || '').trim();
      const a1 = this.prepNote();
      /* The shape the widget itself sends into its frame. */
      this.calendlyPrefill = {};
      if (name) { this.calendlyPrefill.name = name; }
      if (email) { this.calendlyPrefill.email = email; }
      if (a1) { this.calendlyPrefill.a1 = a1; }
      calendly.initInlineWidget({
        url: url + (url.indexOf('?') === -1 ? '?' : '&') + 'hide_gdpr_banner=1',
        parentElement: this.calendlyElement,
        prefill: { name, email, customAnswers: { a1 } },
        utm,
      });
    }).catch(() => {
      /* The request is saved either way. Without the picker, the visitor gets
       * the thank-you that promises a follow-up by email, which is then true. */
      this._zone.run(() => this.goTo('thanks'));
    });
  }

  /* The event's first question asks for anything that helps her prepare, and
   * the form has just asked the same things. Answered here, they arrive with
   * the calendar invitation rather than only in the saved request. The
   * visitor sees it and can change it. If the event's questions are
   * reordered, this lands in whichever one is first. */
  private prepNote(): string {
    const value = this.form.value;
    const text = (v: any) => String(v || '').trim();
    const place = [text(value.practiceName), text(value.city)].filter(Boolean).join(', ');
    const lines: string[] = [];
    if (place) { lines.push('Practice: ' + place); }
    if (text(value.patientSource)) { lines.push('How patients find us today: ' + text(value.patientSource)); }
    return lines.join('\n').slice(0, 2000);
  }

  /*
   * Calendly's widget hands the prefill to its frame by message, when the
   * frame's load event fires and twice more within 250ms. The booking page in
   * the frame listens only once it has fetched the event, and when that is
   * slower the message reaches nobody and the visitor types their name and
   * email a second time: one run in five in testing, and likelier on the
   * phones this page is for. The page says when it has drawn the calendar and
   * when a time is picked, just before its details form, and the same message
   * is sent at each, once: never after the visitor has seen that form. (Going
   * back and picking another time refills it from the prefill anyway; that is
   * Calendly's own behaviour, with or without this.)
   */
  private resendPrefill(cue: string, source: any): void {
    if (!this.calendlyPrefill || this.prefillResentOn[cue] || !this.calendlyElement) { return; }
    const frame = this.calendlyElement.querySelector('iframe');
    const target = frame && frame.contentWindow;
    if (!target || source !== target) { return; }
    this.prefillResentOn[cue] = true;
    try {
      target.postMessage({ event: 'calendly.prefill', payload: this.calendlyPrefill }, CALENDLY_ORIGIN);
    } catch (e) {
      /* the visitor fills Calendly's form by hand */
    }
  }

  /* Registered once, outside Angular: Calendly posts a message for every
   * resize and page change inside the widget, and few of them matter. */
  private listen(): void {
    if (this.listening || !this._uService.isBrowser) { return; }
    this.listening = true;
    this._zone.runOutsideAngular(() => window.addEventListener('message', this.onMessage));
  }

  private unlisten(): void {
    if (!this.listening) { return; }
    this.listening = false;
    try {
      window.removeEventListener('message', this.onMessage);
    } catch (e) {
      /* nothing to remove */
    }
  }

  private onMessage = (event: MessageEvent) => {
    if (!event || event.origin !== CALENDLY_ORIGIN) { return; }
    const data: any = event.data;
    if (!data) { return; }
    if (data.event === 'calendly.event_type_viewed' || data.event === 'calendly.date_and_time_selected') {
      this.resendPrefill(data.event, event.source);
      return;
    }
    if (data.event !== 'calendly.event_scheduled') { return; }
    /* Once per request, however many times the message arrives. */
    if (!this.eventId || this.scheduledFor === this.eventId) { return; }
    this.scheduledFor = this.eventId;
    const uri = data.payload && data.payload.event && data.payload.event.uri;
    this._zone.run(() => this.onScheduled(typeof uri === 'string' ? uri : ''));
  }

  private onScheduled(uri: string): void {
    this.goTo('scheduled');
    this.unlisten();
    this.postScheduled(uri, true);
    if (!this.honeypotFilled) {
      /* Its own event id: Meta deduplicates on it, and the Lead already used
       * the plain one. */
      this._pixel.track('Schedule', {}, this.eventId + '-s');
      this._analytics.event('schedule', { form: this.label });
    }
  }

  /* Marks the saved request as booked. The secret proves this browser made it;
   * unlike eventId, it never goes to Meta. One retry, which the endpoint's
   * limit allows for. */
  private postScheduled(uri: string, retry: boolean): void {
    if (!REQUEST_ID.test(this.requestId) || !CALENDLY_EVENT_URI.test(uri) || uri.length > 200) { return; }
    this.http.post<IResponseData>(
      `${API_URL}consultation/request/${this.requestId}/scheduled`,
      { scheduleSecret: this.scheduleSecret, calendlyEventUri: uri },
    ).subscribe(() => undefined, (error: HttpErrorResponse) => {
      if (retry && !(error && error.status >= 400 && error.status < 500 && error.status !== 429)) {
        setTimeout(() => this.postScheduled(uri, false), RETRY_SCHEDULED_MS);
      }
    });
  }
}

/* One script for the page's lifetime, however often the step is reached. */
let calendlyLoading: Promise<void> = null;
function loadCalendly(): Promise<void> {
  if ((window as any).Calendly) { return Promise.resolve(); }
  if (!calendlyLoading) {
    calendlyLoading = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CALENDLY_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        calendlyLoading = null;
        reject(new Error('Calendly did not load'));
      };
      document.head.appendChild(script);
    });
  }
  return calendlyLoading;
}
