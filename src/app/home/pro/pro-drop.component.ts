import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IProDrop, IProError, PRO_KIND_LABELS, ProService } from 'src/app/shared/services/pro.service';
import { signedIn } from './pro-member';

/* Where the site's own uploads live; a drop's image may be one of their keys. */
const S3_BASE = 'https://prompt-images.s3.us-east-2.amazonaws.com/';
const S3_KEY = /^[A-Za-z0-9][A-Za-z0-9/_.-]{0,250}\.(?:jpe?g|png|webp|gif)$/i;

/*
 * One drop, in two places:
 *
 *   /pro/library/:slug   for members (and administrators).
 *   /pro/preview/:token  the private review page MCP hands Hedieh. Any
 *     status, never indexed, and opening it is what records the version as
 *     reviewed, so it is asked for from the browser only: a link preview
 *     fetching the page must not count as her having looked.
 *
 * The body was checked against an allowlist when it was saved
 * (ph-backend services/proContent.js); Angular's own sanitizer applies on
 * top of that when it is rendered.
 */
@Component({
  selector: 'app-pro-drop',
  templateUrl: './pro-drop.component.html',
  styleUrls: ['./pro-drop.component.scss'],
})
export class ProDropComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public mode: 'library' | 'preview' = 'library';
  public drop: IProDrop = null;
  public body = '';
  public state: 'loading' | 'ready' | 'locked' | 'missing' | 'failed' = 'loading';
  public readonly kinds = PRO_KIND_LABELS;
  public lockedMessage = '';

  /* A week of the evergreen sequence rather than a broadcast. */
  get isWeek(): boolean { return !!this.drop && (this.drop.kind || 'weekly') === 'weekly'; }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _pro: ProService,
  ) {}

  ngOnInit(): void {
    this.mode = this._route.snapshot.data.mode === 'preview' ? 'preview' : 'library';
    this._uService.setMeta(this._router.url.split('?')[0], {
      title: this.mode === 'preview' ? 'Preview | PromptHealth Pro' : "Members' Library | PromptHealth Pro",
      description: 'PromptHealth Pro.',
      robots: 'noindex, nofollow',
    });
    if (this._uService.isServer) { return; }
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.state = 'loading';
      if (this.mode === 'preview') {
        this.load(this._pro.preview(params.get('token')));
        return;
      }
      const slug = params.get('slug');
      signedIn(this._profileService).pipe(takeUntil(this.destroy$)).subscribe(isIn => {
        if (!isIn) {
          this._router.navigate(['/auth/login'], { queryParams: { next: '/pro/library/' + slug }, replaceUrl: true });
          return;
        }
        this.load(this._pro.item(slug));
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(source: ReturnType<ProService['item']>): void {
    source.pipe(takeUntil(this.destroy$)).subscribe(drop => {
      this.drop = drop;
      this.body = withImageAddresses(drop.body || '');
      this.state = 'ready';
      if (this.mode === 'library') {
        this._uService.setMeta(this._router.url.split('?')[0], {
          title: `${drop.title} | PromptHealth Pro`,
          description: drop.summary || 'PromptHealth Pro.',
          robots: 'noindex, nofollow',
        });
      }
    }, (error: IProError) => {
      this.state = error.status === 403 ? 'locked' : error.status === 404 ? 'missing' : 'failed';
      this.lockedMessage = error.code === 'PRO-WEEK-LOCKED' ? error.message : '';
    });
  }
}

/* An image saved as an S3 key gets the bucket's address, as everywhere else
 * on the site. */
function withImageAddresses(html: string): string {
  return html.replace(/(<img\b[^>]*?\ssrc=")([^"]*)(")/g, (whole, start, src, end) =>
    S3_KEY.test(src) && src.indexOf('..') < 0 ? start + S3_BASE + src + end : whole);
}
