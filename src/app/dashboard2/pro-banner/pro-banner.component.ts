import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginStatusType, ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ProService } from 'src/app/shared/services/pro.service';
import { UPGRADE_BANNER } from 'src/app/home/pro/pro-copy';
import { FOR_DENTAL_CLINICS } from 'src/app/home/_elements/offer/offer-copy';

/*
 * The dashboard's Upgrade to Pro banner (Hedieh's 12.3), for practitioners
 * and clinics on Basic. Hidden from patients, from Pro members, and while the
 * membership is still being looked up, so it never flashes at a member. While
 * payments are closed it shows nothing to buy: it says Pro is coming soon.
 * It is shown to every provider, so it says who Pro is for (her brief of
 * 2026-10-07): a physio should not upgrade by mistake.
 */
@Component({
  selector: 'pro-banner',
  template: `
    <div *ngIf="show" class="pro-banner rounded-8p mb-20p">
      <div class="mb-10p mb-md-0p">
        <p class="pro-banner__label mb-5p">{{ label }}</p>
        <p class="pro-banner__text mb-0">{{ copy.text }}</p>
      </div>
      <a *ngIf="paymentsEnabled" routerLink="/pro" [queryParams]="{ modal: 'pro-plan' }" class="btn btn-primary pro-banner__button">{{ copy.button }}</a>
      <a *ngIf="!paymentsEnabled" routerLink="/pro" class="btn btn-outline pro-banner__button">Coming soon</a>
    </div>
  `,
  styles: [`
    .pro-banner {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 16px 20px;
      background: #E0F2FC;
      border: 1px solid #87D4FF;
    }
    @media (min-width: 768px) {
      .pro-banner { flex-direction: row; align-items: center; justify-content: space-between; }
      .pro-banner__button { margin-left: 20px; white-space: nowrap; }
    }
    .pro-banner__text { font-size: 16px; line-height: 24px; font-weight: 600; color: #12339E; }
    .pro-banner__label { font-size: 12px; line-height: 16px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #4264D0; }
  `],
})
export class ProBannerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public readonly copy = UPGRADE_BANNER;
  public readonly label = FOR_DENTAL_CLINICS;
  public show = false;
  public paymentsEnabled = false;

  constructor(private _profileService: ProfileManagementService, private _pro: ProService) {}

  ngOnInit(): void {
    this._pro.config().pipe(takeUntil(this.destroy$)).subscribe(c => this.paymentsEnabled = c.paymentsEnabled);
    this.onStatus(this._profileService.loginStatus);
    this._profileService.loginStatusChanged().pipe(takeUntil(this.destroy$)).subscribe(s => this.onStatus(s));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onStatus(status: LoginStatusType): void {
    const profile = this._profileService.profile;
    if (status !== 'loggedIn' || !profile || !profile.isProvider) {
      this.show = false;
      return;
    }
    this._pro.me().pipe(takeUntil(this.destroy$)).subscribe(me => this.show = !me.isPro, () => this.show = false);
  }
}
