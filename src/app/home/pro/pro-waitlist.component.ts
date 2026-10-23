import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IProError, ProService } from 'src/app/shared/services/pro.service';
import { PRO_WAITLIST_PAGE } from 'src/app/shared/free-membership-copy';
import { signedIn } from './pro-member';

/*
 * Where the welcome email's Join the Pro waitlist lands (Hedieh's brief of
 * 2026-10-22, step 2): /pro/waitlist?u=<user id>&t=<token>. The pair is the
 * proof, so no sign-in is needed; the server adds the Mailchimp tag "Pro
 * waitlist". Sent from the browser only, never from the server render, which
 * would join on behalf of every crawler and link preview that fetched it.
 * The address then drops the pair, as /pro/welcome drops its session id, so
 * it stays out of history and shares.
 *
 * Without the pair, a signed-in practitioner is joined as themselves. noindex,
 * and not in the sitemap.
 */
@Component({
  selector: 'app-pro-waitlist',
  template: `
    <section class="bg-lightyellow py-80p py-md-100p">
      <div class="container text-center" style="max-width: 720px">
        <p *ngIf="state === 'pending'" class="subtitle1 text-label mb-0" role="status">{{ copy.pending }}</p>

        <ng-container *ngIf="state === 'joined'">
          <h1 class="h3 h2-md text-primary-dark mb-20p">{{ copy.heading }}</h1>
          <p class="subtitle1 text-label mx-auto mb-30p">{{ copy.text }}</p>
          <div class="d-flex flex-column flex-sm-row justify-content-center align-items-center">
            <a [routerLink]="dashboardLink" [queryParams]="dashboardQuery" class="btn btn-primary mb-15p mb-sm-0p mr-sm-15p">{{ copy.dashboard }}</a>
            <a routerLink="/for-dentists/growth" class="btn btn-outline">{{ copy.growth }}</a>
          </div>
        </ng-container>

        <ng-container *ngIf="state === 'error'">
          <h1 class="h3 h2-md text-primary-dark mb-20p">{{ copy.errorHeading }}</h1>
          <p class="subtitle1 text-label mx-auto mb-10p" role="alert">{{ errorMessage }}</p>
          <p class="subtitle1 text-label mx-auto mb-0">{{ copy.contactLead }} <a routerLink="/contact-us">{{ copy.contact }}</a> {{ copy.contactTail }}</p>
        </ng-container>
      </div>
    </section>
  `,
})
export class ProWaitlistComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public readonly copy = PRO_WAITLIST_PAGE;
  public state: 'pending' | 'joined' | 'error' = 'pending';
  public errorMessage = '';
  public isSignedIn = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _pro: ProService,
  ) {}

  /* Signed out, the dashboard is behind sign-in, which comes back to it. */
  get dashboardLink(): string { return this.isSignedIn ? '/dashboard' : '/auth/login'; }
  get dashboardQuery(): { [key: string]: string } | null { return this.isSignedIn ? null : { next: '/dashboard' }; }

  ngOnInit(): void {
    this._uService.setMeta('/pro/waitlist', {
      title: this.copy.meta.title,
      description: this.copy.meta.description,
      robots: 'noindex, nofollow',
    });
    if (this._uService.isServer) { return; }

    const query = this._route.snapshot.queryParamMap;
    const u = (query.get('u') || '').trim();
    const t = (query.get('t') || '').trim();

    signedIn(this._profileService).pipe(takeUntil(this.destroy$)).subscribe(isIn => {
      this.isSignedIn = isIn;
      if (u && t) {
        this.join({ u, t });
        this._router.navigate([], { relativeTo: this._route, queryParams: {}, replaceUrl: true });
      } else if (isIn) {
        this.join();
      } else {
        this.fail('');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private join(link?: { u: string; t: string }): void {
    this._pro.joinWaitlist(link).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res && res.joined) {
        this.state = 'joined';
      } else {
        this.fail('');
      }
    }, (error: IProError) => this.fail(error && error.message));
  }

  private fail(message: string): void {
    this.errorMessage = message || this.copy.errorText;
    this.state = 'error';
  }
}
