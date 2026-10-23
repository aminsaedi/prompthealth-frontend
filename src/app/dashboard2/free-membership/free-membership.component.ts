import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginStatusType, ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IProMembership, ProService } from 'src/app/shared/services/pro.service';
import { FREE_MEMBERSHIP, PRO_WAITLIST } from 'src/app/shared/free-membership-copy';

/*
 * "Your free membership" (Hedieh's brief of 2026-10-22, step 3): the same
 * benefits her welcome email lists, on the dashboard's first page, for a
 * practitioner or clinic that is not on Pro. Dentists are offered Pro, since
 * Pro is open to dental practices; everyone else the Pro waitlist.
 *
 * Hidden until the membership is known, so it never flashes at a Pro member.
 * An API older than isDentist leaves the question open, and the panel then
 * offers Upgrade to Pro as the dashboard did before, never a waitlist the
 * server cannot take.
 */
@Component({
  selector: 'free-membership',
  templateUrl: './free-membership.component.html',
  styleUrls: ['./free-membership.component.scss'],
})
export class FreeMembershipComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public readonly copy = FREE_MEMBERSHIP;
  public readonly waitlist = PRO_WAITLIST;
  public membership: IProMembership = null;
  public show = false;

  constructor(private _profileService: ProfileManagementService, private _pro: ProService) {}

  get profileLink(): string {
    const profile = this._profileService.profile;
    return (profile && profile.linkToProfile) || '/dashboard/profile';
  }

  /* True, false, or null when the API does not say. */
  get isDentist(): boolean | null {
    const value = this.membership && this.membership.isDentist;
    return value === true || value === false ? value : null;
  }

  ngOnInit(): void {
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
    this._pro.me().pipe(takeUntil(this.destroy$)).subscribe(me => {
      this.membership = me;
      this.show = !me.isPro;
    }, () => this.show = false);
  }
}
