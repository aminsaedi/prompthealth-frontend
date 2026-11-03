import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IPro2Error, IPro2Me } from 'src/app/shared/services/pro2.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { StudioStateService } from './studio-state.service';

/*
 * PromptHealth Pro 2.0, the Studio (/dashboard/studio): the member's Brand
 * DNA, this month's posts and the library of approved ones. Behind the Pro
 * 2.0 flag and its allowlist: anyone else gets 403 PRO2-NOT-AVAILABLE from
 * the API, and the menu never shows them the entry. Someone who types the
 * address anyway sees a plain "not available" card.
 */
@Component({
  selector: 'app-studio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss'],
  providers: [StudioStateService],
})
export class StudioComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public state: 'loading' | 'ready' | 'unavailable' | 'failed' = 'loading';
  public url = '';

  get me(): IPro2Me { return this._state.me; }
  /* A post opened from This month keeps that tab underlined. */
  get monthActive(): boolean { return /\/dashboard\/studio\/(month|post)(\/|$|\?)/.test(this.url); }

  constructor(
    private _state: StudioStateService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _uService: UniversalService,
  ) {}

  ngOnInit(): void {
    this.url = this._router.url;
    this._router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$),
    ).subscribe((e: NavigationEnd) => {
      this.url = e.urlAfterRedirects;
      this.openDefaultTab();
    });
    this._uService.setMeta(this._router.url.split(/[?#]/)[0], {
      title: 'Studio | PromptHealth',
      robots: 'noindex, nofollow',
    });
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.state = 'loading';
    this._state.refresh().pipe(takeUntil(this.destroy$)).subscribe(me => {
      this.state = me && me.enabled !== false ? 'ready' : 'unavailable';
      this.openDefaultTab();
    }, (error: IPro2Error) => {
      this.state = error.status === 403 ? 'unavailable' : 'failed';
    });
  }

  /* /dashboard/studio on its own opens the step the member is on: the Brand
   * DNA until it is approved, then the month. */
  private openDefaultTab(): void {
    if (this.state !== 'ready' || this._route.children.length > 0) { return; }
    const step = this.me && this.me.onboarding;
    const tab = step === 'extract' || step === 'review-brand' ? 'brand' : 'month';
    this._router.navigate(['/dashboard/studio', tab], { replaceUrl: true });
  }
}
