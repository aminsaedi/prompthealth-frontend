import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import {
  IPro2Brand, IPro2BrandPatch, IPro2ColourEvidence, IPro2Dna, IPro2Error, IPro2Fact, IPro2LogoCandidate,
  IPro2Me, IPro2Photo, IPro2PositioningAnswers, Pro2ColourRole, pro2Asset, pro2JobRunning, Pro2Service,
} from 'src/app/shared/services/pro2.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { StudioStateService } from '../studio-state.service';
import {
  COLOUR_ROLES, FACT_TYPE_LABELS, FACT_TYPE_ORDER, label, LOGO_SOURCE_LABELS, PHOTO_KIND_LABELS, POSITIONING_QUESTIONS,
} from '../studio-copy';
import { normalizeHex, Poller, sameHex } from '../studio-util';

/* Open-licence fonts a member may switch to when the backend sends no list
 * of its own. Its list (IPro2Brand.fontOptions) wins whenever it is there. */
const FALLBACK_FONTS = [
  'Open Sans', 'Lato', 'Montserrat', 'Nunito', 'Poppins', 'Raleway', 'Source Sans 3', 'Work Sans',
  'Merriweather', 'Playfair Display', 'Lora',
];

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

interface FactGroup { type: string; label: string; facts: IPro2Fact[]; included: number; }

/*
 * Brand DNA: what the Studio read from the member's website, for them to
 * correct and approve. Every post is built from the approved version only.
 *
 * Edits go to the server one at a time as they are made (PATCH
 * /pro2/brand/:version) and the page shows the answer, so what is on the
 * screen is what was saved. Editing the approved version makes a new
 * proposed one on the server, which this page then shows.
 */
@Component({
  selector: 'studio-brand',
  templateUrl: './studio-brand.component.html',
  styleUrls: ['./studio-brand.component.scss'],
})
export class StudioBrandComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private poller: Poller;

  public view: 'loading' | 'start' | 'running' | 'review' | 'failed' = 'loading';
  public brand: IPro2Brand = null;
  public dna: IPro2Dna = null;

  /* Start screen */
  public useOverride = false;
  public websiteOverride = '';
  public startError = '';
  public isStarting = false;
  /* Set when a job ended without giving us a new version. */
  public jobFailed = false;
  private versionBeforeJob = 0;

  /* Review */
  public saving = 0;
  public saved = false;
  public saveError = '';
  public openRole: Pro2ColourRole = null;
  public customHex = '';
  public customHexError = '';
  public uploadError = '';
  public isUploading = false;
  public noLogo = false;
  public answers: { [key: string]: string } = {};
  public answersDirty = false;
  public approveError = '';
  public isApproving = false;
  public approvedJustNow = false;
  public factGroups: FactGroup[] = [];
  public fontOptions: string[] = FALLBACK_FONTS;

  public readonly roles = COLOUR_ROLES;
  public readonly questions = POSITIONING_QUESTIONS;
  public readonly asset = pro2Asset;

  get me(): IPro2Me { return this._state.me; }
  get profileWebsite(): string {
    const fromMe = this.me && this.me.website;
    const user = this._profileService.user;
    return String(fromMe || (user && user.website) || '').trim();
  }
  get isApprovedVersion(): boolean { return !!this.dna && this.dna.status === 'approved'; }
  get chosenLogoId(): string { return this.dna && this.dna.logo ? this.dna.logo.candidateId : ''; }
  get coloursComplete(): boolean {
    return !!this.dna && COLOUR_ROLES.every(r => !!normalizeHex(this.dna.colours && this.dna.colours[r.role]));
  }
  get canApprove(): boolean { return !!this.dna && this.coloursComplete && (!!this.chosenLogoId || this.noLogo); }
  get approveBlocker(): string {
    if (!this.dna) { return ''; }
    if (!this.chosenLogoId && !this.noLogo) { return 'Choose a logo, or tick "Use no logo", to approve.'; }
    if (!this.coloursComplete) { return 'Every colour needs a value to approve.'; }
    return '';
  }
  get photosToDecide(): number { return (this.dna && this.dna.photos || []).filter(p => p.approved === null || p.approved === undefined).length; }
  get photosMissingRights(): number { return (this.dna && this.dna.photos || []).filter(p => p.approved === true && !p.rightsConfirmed).length; }

  constructor(
    private _pro2: Pro2Service,
    private _state: StudioStateService,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _router: Router,
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
    this._state.refresh().pipe(
      switchMap(me => pro2JobRunning(me && me.brand && me.brand.pendingJob) ? of(null) : this._pro2.brand()),
      takeUntil(this.destroy$),
    ).subscribe(brand => {
      if (pro2JobRunning(this.me && this.me.brand && this.me.brand.pendingJob)) {
        this.versionBeforeJob = this.latestVersion(this.brand);
        this.showRunning();
        return;
      }
      this.setBrand(brand);
    }, () => this.view = 'failed');
  }

  private latestVersion(brand: IPro2Brand): number {
    if (!brand) { return 0; }
    return Math.max(brand.proposed ? brand.proposed.version : 0, brand.approved ? brand.approved.version : 0);
  }

  private setBrand(brand: IPro2Brand): void {
    this.brand = brand || { proposed: null, approved: null };
    if (this.brand.fontOptions && this.brand.fontOptions.length) { this.fontOptions = this.brand.fontOptions; }
    const dna = this.brand.proposed || this.brand.approved;
    if (!dna) {
      this.dna = null;
      this.view = 'start';
      return;
    }
    this.setDna(dna);
    this.view = 'review';
  }

  private setDna(dna: IPro2Dna): void {
    this.dna = dna;
    this.dna.logoCandidates = dna.logoCandidates || [];
    this.dna.colours = dna.colours || {};
    this.dna.colourEvidence = dna.colourEvidence || [];
    this.dna.photos = dna.photos || [];
    this.dna.facts = dna.facts || [];
    this.dna.notices = dna.notices || [];
    this.dna.fonts = dna.fonts || {};
    if (!this.answersDirty) {
      this.answers = Object.assign({}, dna.positioning && dna.positioning.answers) as { [key: string]: string };
    }
    this.factGroups = this.groupFacts(this.dna.facts);
    const fonts = [dna.fonts.heading, dna.fonts.body].filter(f => !!f && this.fontOptions.indexOf(f) < 0);
    if (fonts.length) { this.fontOptions = fonts.concat(this.fontOptions); }
  }

  private groupFacts(facts: IPro2Fact[]): FactGroup[] {
    const byType: { [type: string]: IPro2Fact[] } = {};
    facts.forEach(f => {
      const type = f.type || 'other';
      (byType[type] = byType[type] || []).push(f);
    });
    const types = Object.keys(byType).sort((a, b) => {
      const ia = a === 'other' ? 999 : (FACT_TYPE_ORDER.indexOf(a) + 1 || 500);
      const ib = b === 'other' ? 999 : (FACT_TYPE_ORDER.indexOf(b) + 1 || 500);
      return ia - ib || a.localeCompare(b);
    });
    return types.map(type => ({
      type,
      label: label(FACT_TYPE_LABELS, type),
      facts: byType[type],
      included: byType[type].filter(f => !f.excluded).length,
    }));
  }

  /* ---------- Reading the website ---------- */

  startExtraction(): void {
    if (this.isStarting) { return; }
    this.startError = '';
    const override = this.useOverride ? String(this.websiteOverride || '').trim() : '';
    if (this.useOverride && !/^(https?:\/\/)?[^\s/.]+\.[^\s]{2,}$/i.test(override)) {
      this.startError = 'Please enter a website address, like yourpractice.ca.';
      return;
    }
    if (!override && !this.profileWebsite) {
      this.useOverride = true;
      this.startError = 'Your profile has no website yet. Enter its address here.';
      return;
    }
    this.isStarting = true;
    this.versionBeforeJob = this.latestVersion(this.brand);
    this._pro2.extractBrand(override || undefined).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isStarting = false;
      this.jobFailed = false;
      this.showRunning();
    }, (error: IPro2Error) => {
      this.isStarting = false;
      this.startError = error.status === 429
        ? (error.message || 'You can ask for a new reading up to 3 times a day. Please try again tomorrow.')
        : (error.message || 'That did not work. Please try again.');
    });
  }

  private showRunning(): void {
    this.view = 'running';
    this.poller.start(
      () => this._state.refresh().pipe(map(me => {
        if (pro2JobRunning(me && me.brand && me.brand.pendingJob)) { return true; }
        this.afterJob();
        return false;
      })),
      () => this.view = 'failed',
    );
  }

  private afterJob(): void {
    this._pro2.brand().pipe(takeUntil(this.destroy$)).subscribe(brand => {
      this.jobFailed = this.latestVersion(brand) <= this.versionBeforeJob;
      this.setBrand(brand);
    }, () => this.view = 'failed');
  }

  readAgain(): void {
    this.useOverride = false;
    this.websiteOverride = '';
    this.startError = '';
    this.view = 'start';
  }

  /* ---------- Saving edits ---------- */

  private patch(patch: IPro2BrandPatch, then?: () => void): void {
    if (!this.dna) { return; }
    this.saving++;
    this.saved = false;
    this.saveError = '';
    this.approvedJustNow = false;
    this._pro2.patchBrand(this.dna.version, patch).pipe(takeUntil(this.destroy$)).subscribe(dna => {
      this.saving--;
      this.saved = this.saving === 0;
      if (dna && typeof dna.version === 'number') {
        this.setDna(dna);
        this._state.refresh().pipe(takeUntil(this.destroy$)).subscribe(() => {}, () => {});
      } else {
        this.resync();
      }
      if (then) { then(); }
    }, (error: IPro2Error) => {
      this.saving--;
      this.saveError = error.message || 'That change could not be saved. Please try again.';
      this.resync();
    });
  }

  /* After a failed save, show what the server actually holds. */
  private resync(): void {
    this._pro2.brand().pipe(takeUntil(this.destroy$)).subscribe(brand => {
      const dna = brand && (brand.proposed || brand.approved);
      if (dna) { this.setDna(dna); }
    }, () => {});
  }

  /* ---------- Logo ---------- */

  logoSource(c: IPro2LogoCandidate): string {
    return c.uploadedByMember ? 'Uploaded by you' : label(LOGO_SOURCE_LABELS, c.source);
  }

  chooseLogo(c: IPro2LogoCandidate): void {
    if (this.chosenLogoId === c.id) { return; }
    this.noLogo = false;
    this.dna.logo = { candidateId: c.id, s3Key: c.s3Key };
    this.patch({ logoCandidateId: c.id });
  }

  chooseNoLogo(value: boolean): void {
    this.noLogo = value;
    if (value && this.chosenLogoId) {
      this.dna.logo = null;
      this.patch({ logoCandidateId: null });
    }
  }

  onLogoFile(input: HTMLInputElement): void {
    const file = input.files && input.files[0];
    input.value = '';
    this.uploadError = '';
    if (!file) { return; }
    if (LOGO_TYPES.indexOf(file.type) < 0) {
      this.uploadError = 'Please choose a PNG, JPEG, SVG or WebP file.';
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      this.uploadError = 'That file is over 5 MB. Please choose a smaller one.';
      return;
    }
    this.isUploading = true;
    this._pro2.uploadLogo(file).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.isUploading = false;
      if (res && Array.isArray(res.logoCandidates)) {
        this.setDna(res);
      } else {
        this.resync();
      }
    }, (error: IPro2Error) => {
      this.isUploading = false;
      this.uploadError = error.message || 'The logo could not be uploaded. Please try again.';
    });
  }

  /* ---------- Colours ---------- */

  colourOf(role: Pro2ColourRole): string { return normalizeHex(this.dna && this.dna.colours[role]) || ''; }

  evidenceFor(hex: string): IPro2ColourEvidence {
    return (this.dna && this.dna.colourEvidence || []).find(e => sameHex(e.hex, hex)) || null;
  }

  /* A value the Studio did not measure was typed in by the member. */
  isSetByMember(role: Pro2ColourRole): boolean {
    const hex = this.colourOf(role);
    return !!hex && !this.evidenceFor(hex);
  }

  evidenceText(e: IPro2ColourEvidence): string {
    if (!e) { return ''; }
    const parts: string[] = [];
    if (e.note) { parts.push(e.note.charAt(0).toUpperCase() + e.note.slice(1)); }
    const sources = Array.isArray(e.sources) ? e.sources : (e.sources ? [e.sources] : []);
    const where = sources.map((s: any) => {
      if (typeof s === 'string') { return s; }
      if (s && s.kind === 'logo') { return 'logo' + (typeof s.share === 'number' ? ' (' + Math.round(s.share * 100) + '%)' : ''); }
      if (s && s.role) { return String(s.role).replace(/-/g, ' '); }
      return s && s.kind ? String(s.kind) : '';
    }).filter(Boolean);
    if (where.length && !e.note) { parts.push('Seen in: ' + where.join(', ')); }
    return parts.join('. ');
  }

  confidenceText(e: IPro2ColourEvidence): string {
    if (!e || e.confidence === undefined || e.confidence === null) { return ''; }
    if (typeof e.confidence === 'number') {
      return e.confidence >= 0.7 ? 'Strong match' : e.confidence >= 0.4 ? 'Likely' : 'Possible';
    }
    return ({ high: 'Strong match', medium: 'Likely', low: 'Possible' } as any)[e.confidence] || '';
  }

  toggleRole(role: Pro2ColourRole): void {
    this.openRole = this.openRole === role ? null : role;
    this.customHex = this.openRole ? this.colourOf(role) : '';
    this.customHexError = '';
  }

  setColour(role: Pro2ColourRole, value: string): void {
    const hex = normalizeHex(value);
    if (!hex) {
      this.customHexError = 'Use a six digit colour code, like #18427A.';
      return;
    }
    this.customHexError = '';
    this.openRole = null;
    if (sameHex(hex, this.colourOf(role))) { return; }
    const change = { [role]: hex } as IPro2BrandPatch['colours'];
    this.dna.colours = Object.assign({}, this.dna.colours, change);
    this.patch({ colours: change });
  }

  /* ---------- Fonts ---------- */

  setFont(which: 'heading' | 'body', value: string): void {
    if (!value || this.dna.fonts[which] === value) { return; }
    const change = { [which]: value } as IPro2BrandPatch['fonts'];
    this.dna.fonts = Object.assign({}, this.dna.fonts, change);
    this.patch({ fonts: change });
  }

  /* ---------- Photos ---------- */

  photoKind(p: IPro2Photo): string { return label(PHOTO_KIND_LABELS, p.kind); }

  setPhoto(p: IPro2Photo, approved: boolean): void {
    if (p.approved === approved) { return; }
    p.approved = approved;
    if (!approved) { p.rightsConfirmed = false; }
    this.patch({ photos: [{ id: p.id, approved: p.approved, rightsConfirmed: !!p.rightsConfirmed }] });
  }

  setRights(p: IPro2Photo, value: boolean): void {
    p.rightsConfirmed = value;
    this.patch({ photos: [{ id: p.id, approved: p.approved, rightsConfirmed: value }] });
  }

  /* ---------- Facts ---------- */

  setFact(f: IPro2Fact, included: boolean): void {
    f.excluded = !included;
    this.factGroups = this.groupFacts(this.dna.facts);
    this.patch({ facts: [{ id: f.id, excluded: f.excluded }] });
  }

  sourceLabel(url: string): string {
    try {
      const u = new URL(url);
      const path = u.pathname.replace(/\/$/, '');
      return u.hostname.replace(/^www\./, '') + (path.length > 1 ? path : '');
    } catch (e) {
      return url;
    }
  }

  /* ---------- Positioning ---------- */

  suggestionFor(key: string): string {
    const suggested = this.dna && this.dna.positioning && this.dna.positioning.suggested;
    return suggested ? String((suggested as any)[key] || '') : '';
  }

  useSuggestion(q: { key: string; suggested?: string }): void {
    this.answers[q.key] = this.suggestionFor(q.suggested);
    this.answersDirty = true;
  }

  saveAnswers(then?: () => void): void {
    const answers: IPro2PositioningAnswers = {};
    POSITIONING_QUESTIONS.forEach(q => (answers as any)[q.key] = String((this.answers as any)[q.key] || '').trim());
    this.answersDirty = false;
    this.patch({ positioning: { answers } }, then);
  }

  /* ---------- Approve ---------- */

  approve(): void {
    if (!this.canApprove || this.isApproving) { return; }
    /* Unsaved answers go first, so the version approved includes them. */
    if (this.answersDirty) {
      this.saveAnswers(() => this.approve());
      return;
    }
    this.approveError = '';
    this.isApproving = true;
    this._pro2.approveBrand(this.dna.version, !this.chosenLogoId && this.noLogo).pipe(
      switchMap(() => this._pro2.brand()),
      takeUntil(this.destroy$),
    ).subscribe(brand => {
      this.isApproving = false;
      this.approvedJustNow = true;
      this.saved = false;
      this.setBrand(brand);
      this._state.refresh().pipe(takeUntil(this.destroy$)).subscribe(() => {}, () => {});
    }, (error: IPro2Error) => {
      this.isApproving = false;
      this.approveError = error.message || 'Your Brand DNA could not be approved. Please try again.';
    });
  }

  goToMonth(): void {
    this._router.navigate(['/dashboard/studio/month']);
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}
