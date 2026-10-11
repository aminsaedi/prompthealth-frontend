import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { MetaPixelService } from 'src/app/shared/services/meta-pixel.service';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';
import { GrowthApplyComponent } from '../_elements/offer/growth-apply.component';
import { IGrowthLanding } from './growth-landing.model';
import { growthLandingFor } from './landings';

const BASE_URL = environment.config.FRONTEND_BASE;
/* The strategy call modal's id, from when it was a consultation booking. Ads
 * and old links still carry it. */
const OLD_BOOKING_MODAL_ID = 'book-consultation';
/* The inline form's section. */
const APPLY_ID = 'apply';

/*
 * A growth landing: the page a paid ad sends a practitioner to, rendered from a
 * config in ./landings, which names its sections in order. /for-dentists is the
 * overview of PromptHealth Pro and Growth, and /for-dentists/growth is Growth's
 * own page, with the strategy call form written into it under #apply (her brief
 * of 2026-10-11).
 *
 * Until then the form was a modal on /for-dentists, opened by the address
 * (?modal=book-consultation&cta=<button>). Ads and the plan section linked to
 * it that way, so that address still leads to the form: server.ts answers it
 * with a 301 to /for-dentists/growth#apply, and the same thing happens here
 * for a reader who reaches it inside the app, where no request is made.
 */
@Component({
  selector: 'app-growth-landing',
  templateUrl: './growth-landing.component.html',
  styleUrls: ['./growth-landing.component.scss'],
})
export class GrowthLandingComponent implements OnInit, OnDestroy {

  public config: IGrowthLanding = null;
  /* A copy per page: faq-item toggles `opened` on the object it is given, and
   * the config is a module constant shared by every visit to the page. */
  public faqs: IFAQItem[] = [];

  @ViewChild('apply') private apply: GrowthApplyComponent;

  private destroy$ = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _jsonLd: JsonLdService,
    private _pixel: MetaPixelService,
  ) {}

  get heroPortrait(): boolean {
    const video = this.config && this.config.hero.video;
    return !!video && video.height > video.width;
  }

  ngOnInit(): void {
    this.config = growthLandingFor(this._route.snapshot.data.landing);
    if (!this.config) { return; }
    this.faqs = (this.config.faq || []).map(f => ({ ...f }));

    this.setMeta();
    this.setJsonLd();

    /* The first answer is synchronous, so a page that is only passing an old
     * address on knows it before reporting a view of itself. */
    let leaving = false;
    this._route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      leaving = this.onQueryChanged(params);
    });
    if (leaving) { return; }
    /* Arriving at #apply, from /plans or an old link: the layout scrolls a new
     * page to the top at the end of the navigation, so this goes after it. */
    this._route.fragment.pipe(takeUntil(this.destroy$)).subscribe(fragment => {
      if (fragment) { this.scrollToSection(fragment, false); }
    });

    /* Each arrival on the landing, including a return in the same tab: the
     * Pixel ignores the router's own history changes (see MetaPixelService). */
    this._pixel.pageView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._jsonLd.removeJsonLd();
    /* The Pixel runs on this page only; the next page must not report to it. */
    this._pixel.leave();
  }

  /*
   * A button that moves down the page. It is a link to the section, so it
   * works before the script has loaded and without it; once the app runs it
   * scrolls smoothly instead, without adding a history entry.
   */
  onScrollButton(event: Event, target: string): void {
    if (this.scrollToSection(target, true)) { event.preventDefault(); }
  }

  /* "Not a dentist? Apply for Pro." on the Pro card. */
  openApplyPro(): void {
    if (this.apply) { this.apply.open('pro'); }
  }

  /*
   * Brings a section to the top of the screen, under the sticky header (each
   * target has a scroll-margin for it), and moves focus there without a second
   * scroll, so a keyboard reader carries on from the section and not from the
   * button. False on the server, or when the page has no such section.
   */
  private scrollToSection(id: string, smooth: boolean): boolean {
    if (!this._uService.isBrowser) { return false; }
    const go = (): boolean => {
      const el = document.getElementById(id);
      if (!el) { return false; }
      try {
        el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      } catch (e) {
        el.scrollIntoView();
      }
      try { el.focus({ preventScroll: true }); } catch (e) { /* focus is a courtesy */ }
      return true;
    };
    if (smooth) { return go(); }
    /* On arrival the sections are not rendered yet, and the layout's scroll
     * to the top comes at the end of the navigation; both are done by the
     * next task. */
    setTimeout(go);
    return true;
  }

  /*
   * An old address of the strategy call modal. On a page that has the form,
   * the address is tidied and the form brought into view; on a page that no
   * longer has it, the reader is sent to the page that does, with the rest
   * of the query (a campaign's utm_*) kept. Replaced in both cases, so Back
   * does not return to an address that only redirects again. True when the
   * reader is being sent away, so this page reports no view of its own.
   */
  private onQueryChanged(params: ParamMap): boolean {
    if (params.get('modal') !== OLD_BOOKING_MODAL_ID) { return false; }
    const rest: Params = {};
    params.keys.forEach(key => {
      if (key !== 'modal' && key !== 'cta') { rest[key] = params.get(key); }
    });
    if (this.config.booking) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: rest,
        fragment: APPLY_ID,
        replaceUrl: true,
      });
      this.scrollToSection(APPLY_ID, false);
      return false;
    }
    if (this.config.bookingMovedTo) {
      this._router.navigate([this.config.bookingMovedTo], {
        queryParams: rest,
        fragment: APPLY_ID,
        replaceUrl: true,
      });
      return true;
    }
    return false;
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

  /*
   * No offers: Growth's price is never shown, on the page or here. The
   * Service is described on Growth's own page, the one with the form; the
   * overview describes itself and its questions.
   */
  private setJsonLd(): void {
    const c = this.config;
    const pageUrl = BASE_URL + c.path;
    const organization = { '@type': 'Organization', name: 'PromptHealth', url: BASE_URL };
    const items: any[] = [
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
    ];
    if (c.booking) {
      items.push({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'PromptHealth Growth',
        description: c.seo.description,
        url: pageUrl,
        provider: organization,
        areaServed: { '@type': 'Country', name: 'Canada' },
      });
    }
    if (c.faq && c.faq.length > 0 && c.sections.indexOf('faq') >= 0) {
      items.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: c.faq.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a.replace(/<[^>]*>/g, '') },
        })),
      });
    }
    this._jsonLd.setJsonLd(items);
  }
}
