import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IProError, ProInterval, ProService } from 'src/app/shared/services/pro.service';
import { signedIn } from './pro-member';

/*
 * Two addresses that only hand the reader on to Stripe:
 *
 *   /pro/checkout?interval=month|year  where the registration form returns a
 *     new member, so they go straight to payment (her section 12 B).
 *   /pro/manage  the link in the payment-failed email (12.7): the Customer
 *     Portal, where the card is updated.
 *
 * Signed out, the first goes to the provider registration and the second to
 * sign in, each coming back here afterwards. Any refusal is shown with a way
 * back, never a blank page.
 */
@Component({
  selector: 'app-pro-go',
  template: `
    <section class="container py-80p py-md-100p text-center">
      <ng-container *ngIf="!message; else refused">
        <p class="subtitle1 text-label mb-0" role="status">{{ mode === 'manage' ? 'Opening your membership settings...' : 'Opening secure checkout...' }}</p>
      </ng-container>
      <ng-template #refused>
        <p class="subtitle1 mb-30p" role="alert">{{ message }}</p>
        <a [routerLink]="mode === 'manage' ? '/dashboard/membership' : '/pro'" class="btn btn-primary">{{ mode === 'manage' ? 'Back to Your Membership' : 'Back to PromptHealth Pro' }}</a>
      </ng-template>
    </section>
  `,
})
export class ProGoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public mode: 'checkout' | 'manage' = 'checkout';
  public message = '';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _pro: ProService,
  ) {}

  ngOnInit(): void {
    this.mode = this._route.snapshot.data.mode === 'manage' ? 'manage' : 'checkout';
    this._uService.setMeta(this._router.url, {
      title: this.mode === 'manage' ? 'Manage Membership | PromptHealth Pro' : 'Checkout | PromptHealth Pro',
      description: 'PromptHealth Pro membership.',
      robots: 'noindex, nofollow',
    });
    if (this._uService.isServer) { return; }
    signedIn(this._profileService).pipe(takeUntil(this.destroy$)).subscribe(isIn => {
      const next = this._router.url;
      if (!isIn) {
        const path = this.mode === 'manage' ? '/auth/login' : '/auth/registration/sp';
        this._router.navigate([path], { queryParams: { next }, replaceUrl: true });
        return;
      }
      this.mode === 'manage' ? this.portal() : this.checkout();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkout(): void {
    const interval: ProInterval = this._route.snapshot.queryParamMap.get('interval') === 'year' ? 'year' : 'month';
    this._pro.checkout(interval).subscribe(res => this.go(res && res.url), (error: IProError) => this.refused(error));
  }

  private portal(): void {
    this._pro.portal().subscribe(res => this.go(res && res.url), (error: IProError) => this.refused(error));
  }

  private go(url: string): void {
    if (url) {
      window.location.replace(url);
    } else {
      this.message = 'Stripe could not be reached. Please try again in a moment.';
    }
  }

  private refused(error: IProError): void {
    if (error.code === 'PRO-ALREADY') {
      this._router.navigate(['/dashboard/membership'], { replaceUrl: true });
      return;
    }
    this.message = error.message || 'Stripe could not be reached. Please try again in a moment.';
  }
}
