import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import {
  IPro2Error, IPro2Fact, IPro2Post, IPro2PostContent, IPro2Topic, pro2Id, pro2PostImage, Pro2Service,
} from 'src/app/shared/services/pro2.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { StudioStateService } from '../studio-state.service';
import { label, POST_STATUS_LABELS, REGENERATIONS_PER_TOPIC, TOPIC_CATEGORY_LABELS } from '../studio-copy';
import { copyText, downloadImage, fileNameFor, fullCaption, Poller } from '../studio-util';

const CHECK_LABELS: { [kind: string]: string } = {
  review: 'Advertising rules',
  lint: 'Wording',
  facts: 'Facts',
  length: 'Length',
};

/* The text fields a member may change, in the order they appear on the
 * image. Which ones a post has depends on its template. */
const TEXT_FIELDS: { key: keyof IPro2PostContent; label: string; multiline?: boolean; max: number }[] = [
  { key: 'kicker', label: 'Small heading', max: 60 },
  { key: 'headline', label: 'Headline', max: 120 },
  { key: 'body', label: 'Text', multiline: true, max: 400 },
  { key: 'name', label: 'Name', max: 80 },
  { key: 'role', label: 'Role', max: 80 },
  { key: 'cta', label: 'Call to action', max: 80 },
];

/*
 * One post: the image, the caption and what it was made from, with the
 * member's choices. A draft is approved or rejected here (or from the
 * email's one-tap link); only an approved post can be downloaded, and the
 * caption is copied with it, ready to paste when the member shares it.
 */
@Component({
  selector: 'studio-post',
  templateUrl: './studio-post.component.html',
  styleUrls: ['./studio-post.component.scss'],
})
export class StudioPostComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private poller: Poller;

  public view: 'loading' | 'ready' | 'missing' | 'failed' = 'loading';
  public post: IPro2Post = null;
  public topic: IPro2Topic = null;
  private facts: { [id: string]: IPro2Fact } = {};

  public editing = false;
  public draft: IPro2PostContent = {};
  public draftPoints = '';
  public draftCaption = '';
  public isSaving = false;
  public editError = '';

  public confirmingReject = false;
  public isDeciding = false;
  public decideError = '';
  public decided: '' | 'approved' | 'rejected' = '';

  public note = '';
  public isRegenerating = false;
  public regenerateError = '';

  public copied = false;
  public downloading = false;

  public readonly statusLabels = POST_STATUS_LABELS;

  get id(): string { return this.post ? pro2Id(this.post) : ''; }
  get image(): string { return pro2PostImage(this.post); }
  get title(): string {
    return (this.topic && this.topic.title) || this.post.topicTitle || this.post.title || (this.post.content && this.post.content.headline) || 'Your post';
  }
  get category(): string { return this.topic ? (this.topic.custom ? 'Your topic' : label(TOPIC_CATEGORY_LABELS, this.topic.category)) : ''; }
  get isDraft(): boolean { return !!this.post && this.post.status === 'awaiting_approval'; }
  get isApproved(): boolean { return !!this.post && this.post.status === 'approved'; }
  get isGenerating(): boolean { return !!this.post && this.post.status === 'generating'; }
  get canEdit(): boolean { return this.isDraft; }
  get regenerationsLeft(): number {
    return this.topic ? Math.max(0, REGENERATIONS_PER_TOPIC - (this.topic.regenerations || 0)) : 0;
  }
  get textFields() {
    const c: IPro2PostContent = (this.post && this.post.content) || {};
    return TEXT_FIELDS.filter(f => c[f.key] !== undefined && c[f.key] !== null && f.key !== 'points');
  }
  get hasPoints(): boolean { return !!(this.post && this.post.content && Array.isArray(this.post.content.points)); }
  get usedFacts(): { id: string; statement: string }[] {
    return (this.post && this.post.factIds || []).map(id => ({ id, statement: this.facts[id] ? this.facts[id].statement : '' }));
  }
  get review(): string { return this.post && typeof this.post.review === 'string' ? this.post.review : ''; }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _pro2: Pro2Service,
    private _state: StudioStateService,
    private _uService: UniversalService,
  ) {
    this.poller = new Poller(this._uService.isBrowser);
  }

  ngOnInit(): void {
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => this.load(params.get('id')));
  }

  ngOnDestroy(): void {
    this.poller.stop();
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(id: string): void {
    this.view = 'loading';
    this.poller.stop();
    this.editing = false;
    this.decided = '';
    /* The facts and the topic only add detail; the post shows without them. */
    forkJoin([
      this._pro2.post(id),
      this._pro2.brand().pipe(catchError(() => of(null))),
      this._pro2.plan().pipe(catchError(() => of(null))),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([post, brand, plan]) => {
      if (!post) {
        this.view = 'missing';
        return;
      }
      this.setPost(post);
      const dna = brand && (brand.approved || brand.proposed);
      this.facts = {};
      ((dna && dna.facts) || []).forEach(f => this.facts[f.id] = f);
      this.topic = plan && post.topicId ? (plan.topics || []).find(t => t.id === post.topicId) || null : null;
      this.view = 'ready';
    }, (error: IPro2Error) => {
      this.view = error.status === 404 || error.status === 400 ? 'missing' : 'failed';
    });
  }

  private setPost(post: IPro2Post): void {
    this.post = post;
    post.content = post.content || {};
    if (post.status === 'generating') {
      this.pollPost();
    } else {
      this.poller.stop();
    }
  }

  private pollPost(): void {
    if (this.poller.running) { return; }
    const id = this.id;
    this.poller.start(() => this._pro2.post(id).pipe(map(post => {
      if (post) { this.post = Object.assign(post, { content: post.content || {} }); }
      return !!post && post.status === 'generating';
    })));
  }

  /* ---------- Edit text ---------- */

  startEdit(): void {
    this.draft = Object.assign({}, this.post.content);
    this.draftPoints = (this.post.content.points || []).join('\n');
    this.draftCaption = this.post.caption || '';
    this.editError = '';
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.editError = '';
  }

  saveEdit(): void {
    if (this.isSaving) { return; }
    const content: IPro2PostContent = Object.assign({}, this.post.content);
    this.textFields.forEach(f => (content as any)[f.key] = String((this.draft as any)[f.key] || '').trim());
    if (this.hasPoints) {
      content.points = this.draftPoints.split('\n').map(p => p.trim()).filter(Boolean);
    }
    const contentChanged = JSON.stringify(content) !== JSON.stringify(this.post.content);
    const caption = this.draftCaption.trim();
    const captionChanged = caption !== (this.post.caption || '').trim();
    if (!contentChanged && !captionChanged) {
      this.editing = false;
      return;
    }
    const patch: { content?: IPro2PostContent; caption?: string } = {};
    if (contentChanged) { patch.content = content; }
    if (captionChanged) { patch.caption = caption; }
    this.isSaving = true;
    this.editError = '';
    this._pro2.patchPost(this.id, patch).pipe(
      switchMap(res => res && res.status ? of(res) : this._pro2.post(this.id)),
      takeUntil(this.destroy$),
    ).subscribe(post => {
      this.isSaving = false;
      this.editing = false;
      this.setPost(post);
    }, (error: IPro2Error) => {
      this.isSaving = false;
      this.editError = error.message || 'Your changes could not be saved. Please try again.';
    });
  }

  /* ---------- Approve or reject ---------- */

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
    this.decideError = '';
    const call = action === 'approve' ? this._pro2.approvePost(this.id) : this._pro2.rejectPost(this.id);
    call.pipe(
      switchMap(res => res && res.status ? of(res) : this._pro2.post(this.id)),
      takeUntil(this.destroy$),
    ).subscribe(post => {
      this.isDeciding = false;
      this.confirmingReject = false;
      this.decided = action === 'approve' ? 'approved' : 'rejected';
      this.setPost(post);
      this._state.refresh().pipe(takeUntil(this.destroy$)).subscribe(() => {}, () => {});
    }, (error: IPro2Error) => {
      this.isDeciding = false;
      this.confirmingReject = false;
      this.decideError = error.status === 429 || error.code === 'PRO2-LIMIT'
        ? (error.message || 'You have approved every post your plan includes this month. Your allowance starts again with your next cycle.')
        : (error.message || 'That did not work. Please try again.');
    });
  }

  /* ---------- A new draft ---------- */

  regenerate(): void {
    if (!this.post.topicId || this.isRegenerating) { return; }
    this.isRegenerating = true;
    this.regenerateError = '';
    this._pro2.preparePost(this.post.topicId, this.note.trim() || undefined).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isRegenerating = false;
      this._router.navigate(['/dashboard/studio/month']);
    }, (error: IPro2Error) => {
      this.isRegenerating = false;
      this.regenerateError = error.message || 'A new draft could not be started. Please try again.';
    });
  }

  /* ---------- Download and copy ---------- */

  download(format: 'jpg' | 'png' = 'jpg'): void {
    if (!this._uService.isBrowser || this.downloading) { return; }
    this.downloading = true;
    this.copyCaption();
    downloadImage(pro2PostImage(this.post, format), fileNameFor(this.title, format)).then(() => this.downloading = false);
  }

  copyCaption(): void {
    if (!this._uService.isBrowser) { return; }
    copyText(fullCaption(this.post.caption, this.post.hashtags)).then(ok => {
      this.copied = ok;
      if (ok) { setTimeout(() => this.copied = false, 6000); }
    });
  }

  checkLabel(kind: string): string { return label(CHECK_LABELS, kind); }
}
