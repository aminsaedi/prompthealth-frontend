import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { IPro2Approval, IPro2Error, Pro2PostStatus, Pro2Service } from 'src/app/shared/services/pro2.service';

/*
 * One-tap approval from the Studio's weekly email: /pro/approve/:token.
 * The token (an HMAC over the post, the recipient and an expiry) is the
 * proof, so there is no sign-in and no interceptor (Pro2Service), and a
 * signed-in session is never needed or sent.
 *
 * The preview is asked for from the browser only. The server renders a
 * plain shell: the SSR cache keys on the address, so a rendered preview
 * would keep showing "waiting" after the post was decided, and a link
 * scanner fetching the page should learn nothing from it. Deciding is a
 * POST, which only a tap on a button sends.
 *
 * Mobile first: most people open this from the email on a phone. noindex,
 * and not in the sitemap.
 */
@Component({
  selector: 'app-pro-approve',
  templateUrl: './pro-approve.component.html',
  styleUrls: ['./pro-approve.component.scss'],
})
export class ProApproveComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private token = '';

  public state: 'loading' | 'ready' | 'approved' | 'rejected' | 'already' | 'busy' | 'expired' | 'limit' | 'failed' = 'loading';
  public preview: IPro2Approval = null;
  public alreadyStatus: Pro2PostStatus = null;
  public isDeciding = false;
  public confirmingReject = false;
  public errorMessage = '';
  public showFullCaption = false;

  get signInQuery(): { next: string } {
    const postId = this.preview && this.preview.postId;
    return { next: postId ? '/dashboard/studio/post/' + postId : '/dashboard/studio/month' };
  }
  get hashtags(): string { return ((this.preview && this.preview.hashtags) || []).join(' '); }
  get longCaption(): boolean { return !!this.preview && String(this.preview.caption || '').length > 320; }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _pro2: Pro2Service,
  ) {}

  ngOnInit(): void {
    this._uService.setMeta(this._router.url.split(/[?#]/)[0], {
      title: 'Approve your post | PromptHealth Pro',
      description: 'PromptHealth Pro.',
      robots: 'noindex, nofollow',
    });
    if (this._uService.isServer) { return; }
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.token = params.get('token') || '';
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.state = 'loading';
    this.errorMessage = '';
    this._pro2.approval(this.token).pipe(takeUntil(this.destroy$)).subscribe(preview => {
      if (!preview) {
        this.state = 'expired';
        return;
      }
      this.preview = preview;
      this.state = this.stateFor(preview.status);
    }, (error: IPro2Error) => this.onError(error));
  }

  private stateFor(status: Pro2PostStatus): ProApproveComponent['state'] {
    switch (status) {
      case 'awaiting_approval': return 'ready';
      case 'approved':
      case 'rejected':
        this.alreadyStatus = status;
        return 'already';
      case 'generating': return 'busy';
      default: return 'expired';
    }
  }

  approve(): void { this.decide('approve'); }

  reject(): void {
    if (!this.confirmingReject) {
      this.confirmingReject = true;
      return;
    }
    this.decide('reject');
  }

  private decide(action: 'approve' | 'reject'): void {
    if (this.isDeciding) { return; }
    this.isDeciding = true;
    this.errorMessage = '';
    this._pro2.decide(this.token, action).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isDeciding = false;
      this.confirmingReject = false;
      this.state = action === 'approve' ? 'approved' : 'rejected';
    }, (error: IPro2Error) => {
      this.isDeciding = false;
      this.confirmingReject = false;
      this.onError(error);
      /* A dropped connection keeps the draft and its buttons on screen. */
      if (this.state === 'failed') {
        this.state = 'ready';
        this.errorMessage = 'That did not go through. Please check your connection and try again.';
      }
    });
  }

  private onError(error: IPro2Error): void {
    const code = String(error.code || '').toUpperCase();
    if (error.status === 409 || code.indexOf('DECIDED') >= 0) {
      this.state = 'already';
      return;
    }
    if (error.status === 429 || code === 'PRO2-LIMIT') {
      this.state = 'limit';
      this.errorMessage = error.message;
      return;
    }
    if ([400, 401, 403, 404, 410].indexOf(error.status) >= 0) {
      this.state = 'expired';
      return;
    }
    this.state = 'failed';
  }
}
