import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import {
  IPro2Error, IPro2Me, IPro2Plan, IPro2Post, IPro2Topic, pro2Id, pro2JobRunning, pro2PostImage, Pro2Service,
} from 'src/app/shared/services/pro2.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { StudioStateService } from '../studio-state.service';
import { label, REGENERATIONS_PER_TOPIC, TOPIC_CATEGORY_LABELS, TOPIC_STATUS_LABELS } from '../studio-copy';
import { Poller } from '../studio-util';

const DAY = 24 * 60 * 60 * 1000;

interface Week { n: number; start: Date; end: Date; topics: IPro2Topic[]; }
type Panel = 'regenerate' | 'edit' | 'move';

/*
 * This month: the cycle's plan, two topics a week for four weeks, each
 * with its draft. The Studio prepares each week's two drafts on its own at
 * the start of the week; the member can prepare one sooner, ask for a new
 * draft with a note, reword a topic, move it to another week or add their
 * own. Drafts are looked at and approved on the post page.
 */
@Component({
  selector: 'studio-month',
  templateUrl: './studio-month.component.html',
  styleUrls: ['./studio-month.component.scss'],
})
export class StudioMonthComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private poller: Poller;

  public view: 'loading' | 'needs-brand' | 'no-plan' | 'planning' | 'ready' | 'failed' = 'loading';
  public plan: IPro2Plan = null;
  public weeks: Week[] = [];
  public planError = '';
  public isPlanning = false;

  /* One open panel at a time, under the topic it belongs to. */
  public panelTopic: string = null;
  public panel: Panel = null;
  public note = '';
  public editTitle = '';
  public editAngle = '';
  public moveWeek = 1;
  public busyTopic: string = null;
  public topicError: { [topicId: string]: string } = {};

  public addOpen = false;
  public addTitle = '';
  public addAngle = '';
  public addWeek = 1;
  public addError = '';
  public isAdding = false;

  public readonly weekNumbers = [1, 2, 3, 4];
  public readonly regenerationsPerTopic = REGENERATIONS_PER_TOPIC;

  get me(): IPro2Me { return this._state.me; }
  get usage() { return this.me && this.me.usage; }
  get cycle() { return this.me && this.me.cycle; }
  get draftsLeft(): number {
    const u = this.usage;
    return u ? Math.max(0, (u.generationLimit || 0) - (u.generations || 0)) : 0;
  }
  get approvalsLeft(): number {
    const u = this.usage;
    return u ? Math.max(0, (u.allowance || 0) - (u.approved || 0)) : 0;
  }

  constructor(
    private _pro2: Pro2Service,
    private _state: StudioStateService,
    private _uService: UniversalService,
  ) {
    this.poller = new Poller(this._uService.isBrowser);
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.poller.stop();
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.view = 'loading';
    this._state.refresh().pipe(takeUntil(this.destroy$)).subscribe(me => {
      const step = me && me.onboarding;
      if (step === 'extract' || step === 'review-brand') {
        this.view = 'needs-brand';
        return;
      }
      if (!me.plan) {
        this.showNoPlan(me);
        return;
      }
      this.fetchPlan();
    }, () => this.view = 'failed');
  }

  private showNoPlan(me: IPro2Me): void {
    if (pro2JobRunning(me.plan && me.plan.pendingJob) || this.isPlanning) {
      this.view = 'planning';
      this.pollForPlan();
    } else {
      this.view = 'no-plan';
    }
  }

  private fetchPlan(): void {
    this._pro2.plan().pipe(takeUntil(this.destroy$)).subscribe(plan => {
      if (!plan) {
        this.showNoPlan(this.me);
        return;
      }
      this.setPlan(plan);
      this.view = 'ready';
      this.pollIfBusy();
    }, (error: IPro2Error) => {
      if (error.status === 404) {
        this.showNoPlan(this.me);
      } else {
        this.view = 'failed';
      }
    });
  }

  private setPlan(plan: IPro2Plan): void {
    this.plan = plan;
    plan.topics = plan.topics || [];
    const start = new Date(plan.cycleStart || (this.cycle && this.cycle.start));
    const valid = !isNaN(start.getTime());
    this.weeks = this.weekNumbers.map(n => ({
      n,
      start: valid ? new Date(start.getTime() + (n - 1) * 7 * DAY) : null,
      end: valid ? new Date(start.getTime() + (n * 7 - 1) * DAY) : null,
      topics: plan.topics.filter(t => (t.week || 1) === n),
    }));
  }

  /* ---------- Asking for the plan ---------- */

  makePlan(): void {
    if (this.isPlanning) { return; }
    this.planError = '';
    this.isPlanning = true;
    this._pro2.createPlan().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view = 'planning';
      this.pollForPlan();
    }, (error: IPro2Error) => {
      this.isPlanning = false;
      /* Already being planned: wait for it like any other. */
      if (error.status === 409) {
        this.isPlanning = true;
        this.view = 'planning';
        this.pollForPlan();
        return;
      }
      this.planError = error.message || 'Your plan could not be started. Please try again.';
    });
  }

  private pollForPlan(): void {
    this.poller.start(
      () => this._state.refresh().pipe(map(me => {
        if (me && me.plan && !pro2JobRunning(me.plan.pendingJob)) {
          this.isPlanning = false;
          this.fetchPlan();
          return false;
        }
        return true;
      })),
      () => this.view = 'failed',
    );
  }

  /* ---------- Drafts being made ---------- */

  private isBusy(plan: IPro2Plan): boolean {
    return !!plan && plan.topics.some(t => {
      if (t.status === 'queued') { return true; }
      const post = this.postFor(t);
      return !!post && post.status === 'generating';
    });
  }

  private pollIfBusy(): void {
    if (!this.isBusy(this.plan)) {
      this.poller.stop();
      return;
    }
    if (this.poller.running) { return; }
    this.poller.start(
      () => this._pro2.plan().pipe(
        switchMap(plan => this._state.refresh().pipe(map(() => plan))),
        map(plan => {
          if (plan) { this.setPlan(plan); }
          return this.isBusy(this.plan);
        }),
      ),
    );
  }

  /* ---------- Reading a topic ---------- */

  postFor(t: IPro2Topic): IPro2Post {
    if (t.post) { return t.post; }
    const posts = (this.plan && this.plan.posts) || [];
    if (t.postId) {
      const byId = posts.find(p => pro2Id(p) === t.postId);
      if (byId) { return byId; }
    }
    const mine = posts.filter(p => p.topicId === t.id);
    return mine.length ? mine[mine.length - 1] : null;
  }

  postId(t: IPro2Topic): string {
    const post = this.postFor(t);
    return post ? pro2Id(post) : (t.postId || '');
  }

  thumb(t: IPro2Topic): string {
    const post = this.postFor(t);
    return post && post.status !== 'generating' ? pro2PostImage(post) : '';
  }

  categoryLabel(t: IPro2Topic): string {
    return t.custom ? 'Your topic' : label(TOPIC_CATEGORY_LABELS, t.category);
  }

  statusLabel(t: IPro2Topic): string {
    return TOPIC_STATUS_LABELS[t.status] || label({}, t.status);
  }

  statusClass(t: IPro2Topic): string {
    switch (t.status) {
      case 'approved': return 'studio-badge--ok';
      case 'ready': return 'studio-badge--wait';
      case 'queued': return 'studio-badge--busy';
      case 'failed':
      case 'rejected': return 'studio-badge--no';
      default: return '';
    }
  }

  regenerationsLeft(t: IPro2Topic): number {
    return Math.max(0, REGENERATIONS_PER_TOPIC - (t.regenerations || 0));
  }

  canPrepare(t: IPro2Topic): boolean { return t.status === 'idea' || t.status === 'failed'; }
  canRegenerate(t: IPro2Topic): boolean { return t.status === 'ready' || t.status === 'rejected'; }
  canEdit(t: IPro2Topic): boolean { return t.status === 'idea' || t.status === 'rejected' || t.status === 'failed'; }
  canMove(t: IPro2Topic): boolean { return t.status !== 'queued'; }
  canOpen(t: IPro2Topic): boolean { return !!this.postId(t) && t.status !== 'queued' && t.status !== 'idea'; }

  /* ---------- Topic actions ---------- */

  openPanel(t: IPro2Topic, panel: Panel): void {
    if (this.panelTopic === t.id && this.panel === panel) {
      this.closePanel();
      return;
    }
    this.panelTopic = t.id;
    this.panel = panel;
    this.note = '';
    this.editTitle = t.title || '';
    this.editAngle = t.angle || '';
    this.moveWeek = t.week || 1;
    this.topicError[t.id] = '';
  }

  closePanel(): void {
    this.panelTopic = null;
    this.panel = null;
  }

  prepare(t: IPro2Topic, note?: string): void {
    if (this.busyTopic) { return; }
    this.topicError[t.id] = '';
    if (this.draftsLeft <= 0) {
      this.topicError[t.id] = this.limitText();
      return;
    }
    this.busyTopic = t.id;
    this._pro2.preparePost(t.id, (note || '').trim() || undefined).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.busyTopic = null;
      this.closePanel();
      t.status = 'queued';
      this.reloadPlan();
    }, (error: IPro2Error) => {
      this.busyTopic = null;
      this.topicError[t.id] = error.status === 429
        ? (error.message || this.limitText())
        : (error.message || 'That did not work. Please try again.');
    });
  }

  saveTopic(t: IPro2Topic): void {
    const title = this.editTitle.trim();
    if (!title) {
      this.topicError[t.id] = 'The topic needs a title.';
      return;
    }
    this.change(t, { title, angle: this.editAngle.trim() });
  }

  saveWeek(t: IPro2Topic): void {
    const week = Number(this.moveWeek);
    if (week === t.week) {
      this.closePanel();
      return;
    }
    this.change(t, { week });
  }

  private change(t: IPro2Topic, patch: { title?: string; angle?: string; week?: number }): void {
    if (this.busyTopic) { return; }
    this.busyTopic = t.id;
    this.topicError[t.id] = '';
    this._pro2.patchTopic(t.id, patch).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.busyTopic = null;
      this.closePanel();
      this.reloadPlan();
    }, (error: IPro2Error) => {
      this.busyTopic = null;
      this.topicError[t.id] = error.message || 'That change could not be saved. Please try again.';
    });
  }

  addTopic(): void {
    if (this.isAdding) { return; }
    const title = this.addTitle.trim();
    if (!title) {
      this.addError = 'Give your topic a title.';
      return;
    }
    this.addError = '';
    this.isAdding = true;
    this._pro2.addTopic({ title, angle: this.addAngle.trim(), week: Number(this.addWeek) || 1 }).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isAdding = false;
      this.addOpen = false;
      this.addTitle = '';
      this.addAngle = '';
      this.reloadPlan();
    }, (error: IPro2Error) => {
      this.isAdding = false;
      this.addError = error.message || 'Your topic could not be added. Please try again.';
    });
  }

  private reloadPlan(): void {
    this._pro2.plan().pipe(
      switchMap(plan => this._state.refresh().pipe(map(() => plan))),
      takeUntil(this.destroy$),
    ).subscribe(plan => {
      if (plan) { this.setPlan(plan); }
      this.pollIfBusy();
    }, () => {});
  }

  limitText(): string {
    const end = this.cycle && this.cycle.end ? new Date(this.cycle.end) : null;
    const when = end && !isNaN(end.getTime())
      ? ' Your allowance starts again on ' + end.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' }) + '.'
      : '';
    return 'You have made all your drafts for this month.' + when;
  }

  percent(value: number, of: number): number {
    return of > 0 ? Math.min(100, Math.round((value || 0) / of * 100)) : 0;
  }

  skippedLabel(category: string): string { return label(TOPIC_CATEGORY_LABELS, category); }

  trackByTopic(_: number, t: IPro2Topic): string { return t.id; }
}
