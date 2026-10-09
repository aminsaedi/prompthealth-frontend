import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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

/* 'form', then 'thanks' once the request is saved. There is no booking step:
 * since her brief of 2026-10-09 she follows up herself. */
export type BookingStep = 'form' | 'thanks';

interface IFieldSpec {
  name: GrowthBookingField;
  type: 'text' | 'email' | 'tel';
  autocomplete: string;
  /* The backend's own limit for the field, so a visitor is stopped while
   * typing rather than refused after sending. */
  max: number;
  optional?: boolean;
  /* Two short fields share a row from tablet width. */
  half?: boolean;
}

const FIELDS: IFieldSpec[] = [
  { name: 'firstName',     type: 'text',  autocomplete: 'given-name',   max: 60, half: true },
  { name: 'lastName',      type: 'text',  autocomplete: 'family-name',  max: 60, half: true },
  { name: 'practiceName',  type: 'text',  autocomplete: 'organization', max: 160 },
  { name: 'email',         type: 'email', autocomplete: 'email',        max: 200 },
  { name: 'phone',         type: 'tel',   autocomplete: 'tel',          max: 40 },
  { name: 'preferredTime', type: 'text',  autocomplete: 'off',          max: 200, optional: true },
];

/* Required means something other than spaces: the server trims first. */
function filled(control: AbstractControl): ValidationErrors | null {
  return String(control.value || '').trim() ? null : { required: true };
}

/*
 * Any country's number, written any of the usual ways: an optional +, digits
 * with spaces, dots, dashes, slashes or brackets between them, and an optional
 * extension. AI-assisted production is offered worldwide (her brief), so
 * nothing here assumes a North American number. Seven to fifteen digits
 * before the extension, which is what E.164 allows at most, counting the
 * country code.
 */
function phoneNumber(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '').trim();
  const match = /^(\+?[0-9\s().\/-]+?)\s*(?:(?:ext\.?|x|#)\s*[0-9]{1,6})?$/i.exec(value);
  const digits = match ? match[1].replace(/[^0-9]/g, '').length : 0;
  return digits >= 7 && digits <= 15 ? null : { phone: true };
}

/* Stricter than Validators.email, which passes "name@clinic" with no domain
 * suffix. The server's check (Joi email) refuses that, and would do it after the
 * visitor had pressed Send. */
function emailAddress(control: AbstractControl): ValidationErrors | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(control.value || '').trim()) ? null : { email: true };
}

/*
 * The strategy call request (her brief of 2026-10-09, update 4), which
 * replaced the consultation booking and its Calendly step. The server saves
 * it to consultationrequests first and then emails info@, so a failed email
 * never loses a lead, and she follows up herself.
 *
 * It is projected into a <modal> whose content sits inside *ngIf, and projected
 * components are created with the page regardless, on the server render too.
 * So nothing here touches the browser until the visitor acts: the constructor
 * does no browser work and the ids are made at the first submit.
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
export class BookingFormComponent implements OnChanges {

  @Input() landing: IGrowthLanding;
  @Input() ctaPosition: GrowthCtaPosition = 'direct';
  /* Whether the modal around this form is open. */
  @Input() open = false;

  @ViewChild('heading') private heading: ElementRef;

  public readonly fields = FIELDS;
  public readonly form = new FormGroup({
    firstName: new FormControl('', [filled, Validators.maxLength(60)]),
    lastName: new FormControl('', [filled, Validators.maxLength(60)]),
    practiceName: new FormControl('', [filled, Validators.maxLength(160)]),
    email: new FormControl('', [filled, emailAddress, Validators.maxLength(200)]),
    phone: new FormControl('', [filled, phoneNumber, Validators.maxLength(40)]),
    preferredTime: new FormControl('', [Validators.maxLength(200)]),
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
  /* Still required by the endpoint, which once used it to let this browser
   * mark its own request as booked in Calendly. Nothing reads it now. */
  private scheduleSecret = '';
  /* Bypasses the app's HTTP interceptors. The global one turns every error
   * into a bare string, which hides the status this form decides its message
   * by, and answers any 401 by sending the visitor to the sign-in page, which
   * on a public form would throw a paid-for visitor off the page. */
  private readonly http: HttpClient;

  constructor(
    httpBackend: HttpBackend,
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
  get label(): string { return 'growth-' + this.landing.key; }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.open || !this._uService.isBrowser) { return; }
    if (this.open) {
      /* Into the dialog, without opening a phone's keyboard over it. */
      setTimeout(() => {
        const el: HTMLElement = this.heading && this.heading.nativeElement;
        if (el && typeof el.focus === 'function') {
          try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
        }
      });
    }
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
    const honeypotFilled = !!body.hp_extra;
    this.isSending = true;

    this.http.post<IResponseData>(API_URL + 'consultation/request', body).subscribe(res => {
      this.isSending = false;
      const id = res && res.statusCode === 200 && res.data && res.data.id ? String(res.data.id) : '';
      if (!id) {
        this.errorMessage = (res && res.statusCode !== 200 && typeof res.message === 'string' && res.message.trim())
          || this.booking.errorGeneric;
        return;
      }
      /* The visitor sees the result first; reporting follows and can fail on
       * its own. Only once the server has saved the request, so a refusal, a
       * network failure or a honeypot hit is never counted as a lead. */
      this.step = 'thanks';
      this.focusHeading();
      if (!honeypotFilled) {
        this._pixel.track('Lead', { content_name: this.label }, this.eventId);
        this._analytics.event('generate_lead', { form: this.label });
      }
    }, (error: HttpErrorResponse) => {
      this.isSending = false;
      this.errorMessage = this.messageFor(error);
    });
  }

  /* The thank-you replaces the form under the same heading; focus goes to
   * the heading, so a screen reader starts from it and focus is not left on
   * a button that no longer exists. */
  private focusHeading(): void {
    setTimeout(() => {
      const el: HTMLElement = this.heading && this.heading.nativeElement;
      if (el && typeof el.focus === 'function') {
        try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      }
    });
  }

  /*
   * The body the backend's schema allows, key by key. Attribution is copied
   * field by field rather than spread: the server refuses unknown keys, and a
   * field added to the attribution record later must not start failing every
   * request. Optional values are left out when empty. city and patientSource,
   * which the consultation booking asked for, are optional on the server and
   * this form no longer asks.
   */
  private requestBody(): { [key: string]: string } {
    const value = this.form.value;
    const text = (v: any) => String(v || '').trim();
    const body: { [key: string]: string } = {
      firstName: text(value.firstName),
      lastName: text(value.lastName),
      practiceName: text(value.practiceName),
      email: text(value.email),
      phone: text(value.phone),
      landing: this.landing.key,
      ctaPosition: this.ctaPosition,
      eventId: this.eventId,
      scheduleSecret: this.scheduleSecret,
      hp_extra: text(value.hp_extra).slice(0, 200),
    };
    const optional = (key: string, v: string) => { if (v) { body[key] = v; } };

    optional('preferredTime', text(value.preferredTime));

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
}
