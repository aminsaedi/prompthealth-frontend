import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IProError, IProMembership, ProService } from 'src/app/shared/services/pro.service';
import { UPGRADE_BANNER } from 'src/app/home/pro/pro-copy';
import { NOT_A_DENTIST_APPLY_FOR_PRO, PRO_AVAILABILITY, PRO_JOIN } from 'src/app/home/_elements/offer/offer-copy';

/*
 * Account settings, membership (Hedieh's 12.4): PromptHealth Basic with the
 * way up, or PromptHealth Pro with its plan, the next payment and Manage
 * Membership, which opens Stripe's Customer Portal (switch monthly and
 * yearly, change the card, invoices, cancel at the end of the period).
 *
 * A Pro member also lists up to ten teammates here; each gets the weekly
 * email (Amin, 2026-10-05).
 */
@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss'],
})
export class MembershipComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public membership: IProMembership = null;
  public paymentsEnabled = false;
  public loadFailed = false;
  public isOpeningPortal = false;
  public portalError = '';

  public team: string[] = [];
  public newEmail = '';
  public teamMessage = '';
  public teamError = '';
  public isSavingTeam = false;

  public readonly upgradeLabel = UPGRADE_BANNER.button;
  public readonly upgradeText = UPGRADE_BANNER.text;
  public readonly proJoin = PRO_JOIN;
  public readonly proAvailability = PRO_AVAILABILITY;
  public readonly applyForPro = NOT_A_DENTIST_APPLY_FOR_PRO;
  /* The application on /pro, opened for Pro. */
  public readonly applyForProQuery = { modal: 'growth-apply', interest: 'pro' };

  constructor(private _pro: ProService, private _profileService: ProfileManagementService) {}

  get isProvider(): boolean {
    const profile = this._profileService.profile;
    return !!(profile && profile.isProvider);
  }

  get planName(): string {
    const interval = this.membership && this.membership.interval;
    return interval === 'year' ? 'Yearly' : interval === 'month' ? 'Monthly' : '';
  }

  ngOnInit(): void {
    this._pro.config().pipe(takeUntil(this.destroy$)).subscribe(c => this.paymentsEnabled = c.paymentsEnabled);
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loadFailed = false;
    this._pro.me().pipe(takeUntil(this.destroy$)).subscribe(me => {
      this.membership = me;
      this.team = (me.teamEmails || []).slice();
    }, () => this.loadFailed = true);
  }

  manage(): void {
    if (this.isOpeningPortal) { return; }
    this.isOpeningPortal = true;
    this.portalError = '';
    this._pro.portal().subscribe(res => {
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        this.isOpeningPortal = false;
        this.portalError = 'Stripe could not be reached. Please try again.';
      }
    }, (error: IProError) => {
      this.isOpeningPortal = false;
      this.portalError = error.message || 'Stripe could not be reached. Please try again.';
    });
  }

  addEmail(): void {
    this.teamError = '';
    this.teamMessage = '';
    const email = String(this.newEmail || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      this.teamError = 'Please enter a valid email address.';
      return;
    }
    if (this.team.indexOf(email) >= 0) {
      this.newEmail = '';
      return;
    }
    if (this.team.length >= this.membership.teamLimit) {
      this.teamError = `Up to ${this.membership.teamLimit} team emails.`;
      return;
    }
    this.saveTeam(this.team.concat(email), () => this.newEmail = '');
  }

  removeEmail(email: string): void {
    this.teamError = '';
    this.teamMessage = '';
    this.saveTeam(this.team.filter(e => e !== email));
  }

  private saveTeam(emails: string[], done?: () => void): void {
    this.isSavingTeam = true;
    this._pro.setTeam(emails).subscribe(me => {
      this.isSavingTeam = false;
      this.membership = me;
      this.team = (me.teamEmails || []).slice();
      this.teamMessage = 'Saved.';
      if (done) { done(); }
    }, (error: IProError) => {
      this.isSavingTeam = false;
      this.teamError = error.message || 'Could not save. Please try again.';
    });
  }
}
