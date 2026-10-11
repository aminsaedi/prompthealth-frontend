import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { MetaPixelService } from 'src/app/shared/services/meta-pixel.service';
import { IProMembership, ProService } from 'src/app/shared/services/pro.service';
import { WELCOME } from './pro-copy';
import { signedIn } from './pro-member';

/* What a Purchase is worth to her Meta ad reports, by plan: the prices on
 * /pro, before tax, in the currency Stripe charges. */
const PURCHASE_VALUE: { [interval: string]: number } = { month: 149, year: 1490 };
/* Per checkout, in this tab's sessionStorage: a reload or a second visit to
 * the same address must not count the same payment again. */
const PURCHASE_SENT_KEY = 'ph_pro_purchase_sent:';

/*
 * Where Stripe sends a member after paying (12.2). It also asks the API to
 * confirm the checkout, so the library opens at once rather than when the
 * webhook arrives; the welcome email and the rest still happen exactly once,
 * whichever of the two gets there first (ph-backend services/pro.js).
 *
 * The Meta Pixel's Purchase is sent from here (her brief of 2026-10-11 and her
 * email about the Pixel): only once the API's answer shows an active
 * membership, so a payment that did not go through is never counted, and
 * never when checkout is merely opened. Its eventID is the Stripe Checkout
 * session id, which is what Meta deduplicates on, and a mark in
 * sessionStorage keeps a reload from sending it again.
 */
@Component({
  selector: 'app-pro-welcome',
  template: `
    <section class="bg-lightyellow py-80p py-md-100p">
      <div class="container text-center">
        <h1 class="h3 h2-md text-primary-dark mb-20p">{{ copy.heading }}</h1>
        <p class="subtitle1 text-label mx-auto mb-30p" style="max-width: 640px">{{ copy.text }}</p>
        <a routerLink="/pro/library" class="btn btn-primary">{{ copy.button }}</a>
      </div>
    </section>
  `,
})
export class ProWelcomeComponent implements OnInit, OnDestroy {
  public readonly copy = WELCOME;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _pro: ProService,
    private _pixel: MetaPixelService,
  ) {}

  ngOnInit(): void {
    this._uService.setMeta('/pro/welcome', {
      title: 'Welcome to PromptHealth Pro',
      description: 'Your PromptHealth Pro membership.',
      robots: 'noindex, nofollow',
    });
    if (this._uService.isServer) { return; }
    this._pixel.pageView();
    const sessionId = this._route.snapshot.queryParamMap.get('session_id') || '';
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) { return; }
    signedIn(this._profileService).subscribe(isIn => {
      if (!isIn) { return; }
      this._pro.confirm(sessionId).subscribe(membership => this.reportPurchase(sessionId, membership), () => {});
      /* The session id has done its job; keep it out of history and shares. */
      this._router.navigate([], { relativeTo: this._route, queryParams: {}, replaceUrl: true });
    });
  }

  ngOnDestroy(): void {
    /* The Pixel runs on this page only; the library must not report to it. */
    this._pixel.leave();
  }

  private reportPurchase(sessionId: string, membership: IProMembership): void {
    if (!membership || membership.status !== 'active' || !membership.isPro) { return; }
    const value = PURCHASE_VALUE[membership.interval || 'month'];
    if (!value) { return; }
    const key = PURCHASE_SENT_KEY + sessionId;
    if (this.readMark(key)) { return; }
    this.writeMark(key);
    this._pixel.track('Purchase', { value, currency: 'CAD', content_name: 'PromptHealth Pro' }, sessionId);
  }

  /* A browser that refuses storage (private mode, a webview) still sends the
   * Purchase once per load; Meta's eventID deduplication covers a reload. */
  private readMark(key: string): boolean {
    try {
      return window.sessionStorage.getItem(key) === '1';
    } catch (e) {
      return false;
    }
  }

  private writeMark(key: string): void {
    try {
      window.sessionStorage.setItem(key, '1');
    } catch (e) {
      /* see readMark */
    }
  }
}
