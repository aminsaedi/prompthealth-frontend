import {
  AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { MetaPixelService } from 'src/app/shared/services/meta-pixel.service';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';
import { GrowthCtaPosition, IGrowthLanding, isGrowthCtaPosition } from './growth-landing.model';
import { growthLandingFor } from './landings';
import { BookingStep } from './booking-form/booking-form.component';

const BASE_URL = environment.config.FRONTEND_BASE;
const BOOKING_MODAL_ID = 'book-consultation';
/* The site header is sticky and this tall on a phone, which is the only width
 * the sticky button shows at. A CTA behind it is out of view. */
const HEADER_HEIGHT_PX = 61;
/* One object, not a new one per change detection pass: the modal's input
 * would otherwise change on every check. */
const WIDE_MODAL_BODY = { maxWidth: '720px' };
/* What Tab can reach. Filtered further by tabIndex, disabled and rendering
 * (see dialogFocusables). */
const FOCUSABLE = 'a[href], area[href], button, input, select, textarea, iframe, [tabindex]';

/*
 * A growth landing: the page a paid ad sends a practitioner to, rendered from a
 * config in ./landings. /for-dentists is the first.
 *
 * Every Book a Consultation button opens the same form, in a modal addressed by
 * the query (?modal=book-consultation&cta=<button>), so back and forward, a
 * reload or a shared link all reopen it, and the request records which button
 * was pressed.
 */
@Component({
  selector: 'app-growth-landing',
  templateUrl: './growth-landing.component.html',
  styleUrls: ['./growth-landing.component.scss'],
})
export class GrowthLandingComponent implements OnInit, AfterViewInit, OnDestroy {

  public config: IGrowthLanding = null;
  /* A copy per page: faq-item toggles `opened` on the object it is given, and
   * the config is a module constant shared by every visit to the page. */
  public faqs: IFAQItem[] = [];

  public readonly bookingModalId = BOOKING_MODAL_ID;
  public isBookingShown = false;
  public ctaPosition: GrowthCtaPosition = 'direct';
  public bookingStep: BookingStep = 'form';
  /* Between location.back() and the address it leads to, so a double click on
   * the close button cannot go back twice and off the page. */
  private isClosing = false;

  /* Whether the reader is between the hero's button and the final one. */
  public isStickyInRange = false;
  private isMenuShown = false;

  @ViewChild('heroCta') private heroCta: ElementRef;
  @ViewChild('stepsCta') private stepsCta: ElementRef;
  @ViewChild('finalCta') private finalCta: ElementRef;
  @ViewChild('stickyCta') private stickyCta: ElementRef;
  @ViewChild('dialog') private dialog: ElementRef;
  private isTrappingFocus = false;

  private observer: IntersectionObserver = null;
  private destroy$ = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _zone: NgZone,
    private _host: ElementRef,
    private _uService: UniversalService,
    private _jsonLd: JsonLdService,
    private _pixel: MetaPixelService,
  ) {}

  /* Out of the way of the mobile menu and of the modal, both of which sit
   * above it anyway; hidden rather than merely covered, so it cannot be
   * reached behind them. */
  get isStickyShown(): boolean {
    return this.isStickyInRange && !this.isBookingShown && !this.isMenuShown;
  }

  get heroPortrait(): boolean {
    const video = this.config && this.config.hero.video;
    return !!video && video.height > video.width;
  }

  /* The modal body is 500px wide with 50px padding; Calendly needs more. */
  get bookingBodyStyle(): { [key: string]: string } {
    return (this.bookingStep === 'schedule' || this.bookingStep === 'scheduled') ? WIDE_MODAL_BODY : null;
  }

  @HostListener('document:keydown.escape') onEscape(): void {
    if (this.isBookingShown) { this.closeBooking(); }
  }

  ngOnInit(): void {
    this.config = growthLandingFor(this._route.snapshot.data.landing);
    if (!this.config) { return; }
    this.faqs = this.config.faq.map(f => ({ ...f }));

    this.setMeta();
    this.setJsonLd();

    this._route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => this.onQueryChanged(params));

    /* Each arrival on the landing, including a return in the same tab: the
     * Pixel ignores the router's own history changes (see MetaPixelService). */
    this._pixel.pageView();
  }

  ngAfterViewInit(): void {
    this.observeCtas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.trapFocus(false);
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this._jsonLd.removeJsonLd();
    /* The Pixel runs on this page only; the next page must not report to it. */
    this._pixel.leave();
  }

  /* Merged into the query as it stands, so a campaign's utm_* stay in the
   * address while the form is open. Not ModalService.show: its query handling
   * double-encoded every campaign until recently, and this page's traffic is
   * the traffic whose query matters, so it does not depend on that code. */
  openBooking(position: GrowthCtaPosition): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { modal: BOOKING_MODAL_ID, cta: position },
      queryParamsHandling: 'merge',
    });
  }

  /*
   * Closes the way the modal's backdrop does (ModalService), so the close
   * button, Escape and the backdrop all leave the same history. Opening pushed
   * an entry, and going back removes it. Replacing it instead left two entries
   * with the landing's address, and the next Back press went from one to the
   * other and seemed to do nothing: an extra press to leave the page, for
   * readers who mostly arrive in an in-app browser.
   *
   * A form reached by a link or a reload has no entry of this page's behind
   * it (the router's first navigation is id 1), and back() would leave the
   * site, so that one is replaced.
   */
  closeBooking(): void {
    if (!this.isBookingShown || this.isClosing) { return; }
    const state: any = this._location.getState();
    if (state && state.navigationId > 1) {
      this.isClosing = true;
      this._location.back();
      return;
    }
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { modal: null, cta: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onBookingStep(step: BookingStep): void {
    this.bookingStep = step;
  }

  /*
   * Tab and Shift+Tab go round the dialog rather than out of it: past Send,
   * focus used to walk on through the footer links behind the backdrop, where
   * nobody can see it. The close button is always the first stop.
   */
  onDialogKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') { return; }
    const items = this.dialogFocusables();
    if (items.length === 0) { return; }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private onQueryChanged(params: ParamMap): void {
    const wasShown = this.isBookingShown;
    const openedFrom = this.ctaPosition;
    this.isClosing = false;
    this.isBookingShown = params.get('modal') === BOOKING_MODAL_ID;
    const cta = params.get('cta');
    this.ctaPosition = isGrowthCtaPosition(cta) ? cta : 'direct';
    this.isMenuShown = params.get('menu') === 'show';

    if (this.isBookingShown && !wasShown) {
      this.trapFocus(true);
    } else if (!this.isBookingShown && wasShown) {
      this.trapFocus(false);
      this.returnFocus(openedFrom);
    }

    /* The modal's backdrop closes it through ModalService, which removes
     * modal and modal-data and knows nothing of cta. Left behind, a stale cta
     * would credit the next opening, by the address, to a button nobody
     * pressed. */
    if (!this.isBookingShown && params.has('cta') && this._uService.isBrowser) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: { cta: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  /* What Tab can reach inside the dialog now: the close button first, then the
   * form or the thank-you, and the Calendly frame on its step. The honeypot is
   * out of the tab order, and a disabled Send is skipped. */
  private dialogFocusables(): HTMLElement[] {
    const root: HTMLElement = this.dialog ? this.dialog.nativeElement : null;
    if (!root) { return []; }
    const all: HTMLElement[] = Array.prototype.slice.call(root.querySelectorAll(FOCUSABLE));
    return all.filter(el => el.tabIndex >= 0 && !(el as any).disabled && el.getClientRects().length > 0);
  }

  /*
   * A fallback for what the keydown handler cannot see. Tab pressed inside the
   * Calendly frame is handled by Calendly's document, not this one, and on
   * the thank-you step Tab from the heading has nowhere in the dialog to go.
   * Either way focus lands on the page behind, and is brought back to the
   * start of the dialog.
   */
  private trapFocus(on: boolean): void {
    if (!this._uService.isBrowser || on === this.isTrappingFocus) { return; }
    this.isTrappingFocus = on;
    if (on) {
      this._zone.runOutsideAngular(() => document.addEventListener('focusin', this.onFocusIn, true));
    } else {
      document.removeEventListener('focusin', this.onFocusIn, true);
    }
  }

  private onFocusIn = (event: FocusEvent) => {
    const root: HTMLElement = this.dialog ? this.dialog.nativeElement : null;
    const target = event.target as Node;
    /* Not yet in the page: the modal renders after the query changes. */
    if (!root || !document.body.contains(root) || !target || root.contains(target)) { return; }
    const items = this.dialogFocusables();
    if (items.length > 0) { items[0].focus(); }
  }

  /*
   * Back to the button that opened the form, however it closed: close
   * button, Escape, backdrop or Back. Without this, focus fell to the body,
   * and a keyboard reader who opened the form from the final button or the
   * sticky bar started again from the logo at the top of the page.
   *
   * The position comes from the address, so it works for a form reopened by
   * Forward as well. A form reached by a link names no button, and focus is
   * left alone.
   *
   * The sticky bar is gone while the form is open, and back only if the
   * reader is still between the hero's button and the final one. If not,
   * the final button when it is on screen, otherwise the hero's. Scrolling is
   * suppressed, so a reader on a touch screen, who never sees focus, is not
   * moved.
   */
  private returnFocus(position: GrowthCtaPosition): void {
    if (!this._uService.isBrowser || position === 'direct') { return; }
    /* After this change detection pass, which puts the sticky bar back. */
    setTimeout(() => {
      let target = this.ctaElement(position);
      if (!target && position === 'sticky') {
        const final = this.ctaElement('final');
        target = final && final.getBoundingClientRect().top < window.innerHeight ? final : this.ctaElement('hero');
      }
      if (!target || typeof target.focus !== 'function') { return; }
      try {
        target.focus({ preventScroll: true });
      } catch (e) {
        target.focus();
      }
    });
  }

  private ctaElement(position: GrowthCtaPosition): HTMLElement {
    let ref: ElementRef = null;
    switch (position) {
      case 'hero': ref = this.heroCta; break;
      case 'steps': ref = this.stepsCta; break;
      case 'final': ref = this.finalCta; break;
      case 'sticky': ref = this.stickyCta; break;
    }
    return ref ? ref.nativeElement : null;
  }

  private setMeta(): void {
    const seo = this.config.seo;
    /* A new object: setMeta fills in defaults on the one it is handed, and
     * config.seo is shared. */
    this._uService.setMeta(this.config.path, {
      title: seo.title,
      description: seo.description,
      image: BASE_URL + seo.image,
      imageWidth: seo.imageWidth,
      imageHeight: seo.imageHeight,
      imageType: seo.imageType,
      imageAlt: seo.imageAlt,
      robots: 'index, follow',
    });
  }

  /* No offers and no price anywhere: nothing on this site states what
   * PromptHealth charges. */
  private setJsonLd(): void {
    const c = this.config;
    const pageUrl = BASE_URL + c.path;
    const organization = { '@type': 'Organization', name: 'PromptHealth', url: BASE_URL };
    this._jsonLd.setJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: c.seo.title,
        description: c.seo.description,
        url: pageUrl,
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: BASE_URL + c.seo.image,
          width: c.seo.imageWidth,
          height: c.seo.imageHeight,
        },
        isPartOf: { '@type': 'WebSite', name: 'PromptHealth', url: BASE_URL },
        publisher: organization,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'PromptHealth Growth',
        description: c.seo.description,
        url: pageUrl,
        provider: organization,
        areaServed: { '@type': 'Country', name: 'Canada' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: c.faq.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a.replace(/<[^>]*>/g, '') },
        })),
      },
    ]);
  }

  /*
   * The sticky button shows only between the hero's button and the final one:
   * once the hero's has scrolled up out of view, and until the final one comes
   * into view or has gone above it. That keeps it off the first screen, which
   * has its own button, and off the footer, which is outside this component.
   *
   * A dedicated observer, because the shared intersectionObserver directive
   * reports only in or out, not which side of the screen a button left by. It
   * watches the page's sections as well as the two buttons, and decides from
   * where the buttons are, not from what the report says about them: an
   * observer reports only when a target's visibility changes, and a fling or a
   * tap on an iPhone's status bar can carry a button from below the screen to
   * above it without it ever being visible. Some section always changes on
   * the way, so the decision is made again.
   */
  private observeCtas(): void {
    if (!this._uService.isBrowser || !this.heroCta || !this.finalCta) { return; }
    const w: any = window;
    if (typeof w.IntersectionObserver !== 'function') { return; }
    const hero: Element = this.heroCta.nativeElement;
    const final: Element = this.finalCta.nativeElement;
    const sections: Element[] = Array.prototype.slice.call(this._host.nativeElement.querySelectorAll('section'));

    this._zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(() => {
        const heroPassed = hero.getBoundingClientRect().bottom <= HEADER_HEIGHT_PX;
        const finalAhead = final.getBoundingClientRect().top >= window.innerHeight;
        const inRange = heroPassed && finalAhead;
        if (inRange !== this.isStickyInRange) {
          this._zone.run(() => { this.isStickyInRange = inRange; });
        }
      }, { rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px`, threshold: 0 });
      [hero, final].concat(sections).forEach(el => this.observer.observe(el));
    });
  }
}
