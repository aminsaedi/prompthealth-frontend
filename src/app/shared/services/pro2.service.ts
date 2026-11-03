import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UniversalService } from './universal.service';

const API_URL = environment.config.API_URL;
const S3_BASE = environment.config.AWS_S3;

/*
 * PromptHealth Pro 2.0 (the Studio): ph-backend api/v1/pro2, as described in
 * plan-specs/pro2/stage-d-build-spec.md.
 *
 * Like ProService it bypasses the app's interceptors. The global one turns an
 * error into a bare string and answers a 401 by sending the reader to sign
 * in; the Studio needs the status and code (403 PRO2-NOT-AVAILABLE hides the
 * menu entry, 429 PRO2-LIMIT explains an allowance), and the approval page
 * from the email is public and must never bounce anyone to a login. The
 * session token goes on by hand.
 *
 * Where the spec names a summary without its fields, the shapes below are
 * what this side reads, and every reader tolerates a missing field.
 */

export interface IPro2Error {
  status: number;
  code: string;
  message: string;
}

export interface IPro2Job {
  _id?: string;
  id?: string;
  kind?: 'brand' | 'plan' | 'post' | 'render';
  status?: 'queued' | 'claimed' | 'done' | 'failed';
  createdAt?: string;
  error?: string;
}

export interface IPro2DnaSummary {
  version: number;
  status: 'proposed' | 'approved' | 'superseded';
  website?: string;
  extractedAt?: string;
  approvedAt?: string;
}

export interface IPro2PlanSummary {
  _id?: string;
  status?: 'active' | 'closed';
  cycleStart?: string;
  cycleEnd?: string;
  /* A plan job still running, when the backend says so. */
  pendingJob?: IPro2Job | boolean | null;
}

export type Pro2Onboarding = 'extract' | 'review-brand' | 'plan' | 'ready';

export interface IPro2Me {
  enabled: boolean;
  cycle: { start: string; end: string };
  usage: { approved: number; allowance: number; generations: number; generationLimit: number };
  brand: {
    approved: IPro2DnaSummary | null;
    proposed: IPro2DnaSummary | null;
    pendingJob: IPro2Job | boolean | null;
    /* The last brand job when it failed, if the backend reports it. */
    lastJob?: IPro2Job | null;
  };
  plan: IPro2PlanSummary | null;
  onboarding: Pro2Onboarding;
  /* The website on the profile, if the backend includes it. */
  website?: string;
  /* A plan job still running before any plan exists. */
  planPendingJob?: IPro2Job | null;
}

export interface IPro2LogoCandidate {
  id: string;
  s3Key: string;
  originalS3Key?: string;
  source?: string;
  sourceUrl?: string;
  isIcon?: boolean;
  format?: string;
  width?: number;
  height?: number;
  transparent?: boolean;
  uploadedByMember?: boolean;
}

export type Pro2ColourRole = 'primary' | 'secondary' | 'accent' | 'ink' | 'paper';

export interface IPro2ColourEvidence {
  hex: string;
  confidence?: number | string;
  note?: string;
  sources?: string[] | string;
}

export interface IPro2Photo {
  id: string;
  s3Key: string;
  sourceUrl?: string;
  alt?: string;
  kind?: string;
  showsPractice?: boolean;
  suitable?: boolean;
  focus?: string;
  stockHint?: string | boolean;
  approved: boolean | null;
  rightsConfirmed?: boolean;
}

export interface IPro2Fact {
  id: string;
  type: string;
  statement: string;
  quote?: string;
  sourceId?: string;
  sourceUrl?: string;
  retrievedAt?: string;
  importance?: string;
  excluded?: boolean;
}

export interface IPro2PositioningAnswers {
  idealClient?: string;
  knownFor?: string;
  feel?: string;
  different?: string;
  tone?: string;
  avoid?: string;
}

export interface IPro2Dna {
  _id?: string;
  userId?: string;
  version: number;
  status: 'proposed' | 'approved' | 'superseded';
  source?: 'extraction' | 'refresh' | 'manual';
  website?: string;
  extractedAt?: string;
  logo: { candidateId: string; s3Key: string } | null;
  logoCandidates: IPro2LogoCandidate[];
  colours: { [role in Pro2ColourRole]?: string };
  colourEvidence: IPro2ColourEvidence[];
  colourSetByMember?: boolean;
  fonts: { heading?: string; body?: string; substituteFor?: string };
  photos: IPro2Photo[];
  facts: IPro2Fact[];
  notices: { quote: string; sourceUrl?: string; meaning?: string }[];
  cautions?: { quote: string; why?: string }[];
  positioning?: {
    suggested?: { idealClient?: string; knownFor?: string; approach?: string; tone?: string };
    answers?: IPro2PositioningAnswers;
  };
  voice?: { tone?: string[]; audience?: string };
  concerns?: string[];
  approvedAt?: string;
  noLogo?: boolean;
  fontOptions?: string[];
}

export interface IPro2Brand {
  proposed: IPro2Dna | null;
  approved: IPro2Dna | null;
  /* Fonts the member may pick, if the backend sends its list. */
  fontOptions?: string[];
}

/* The member's edits to a Brand DNA version (PATCH /pro2/brand/:version).
 * logoCandidateId null means "no logo". */
export interface IPro2BrandPatch {
  logoCandidateId?: string | null;
  colours?: { [role in Pro2ColourRole]?: string };
  fonts?: { heading?: string; body?: string };
  facts?: { id: string; excluded: boolean }[];
  photos?: { id: string; approved: boolean | null; rightsConfirmed: boolean }[];
  positioning?: { answers: IPro2PositioningAnswers };
}

export type Pro2TopicStatus = 'idea' | 'queued' | 'ready' | 'approved' | 'rejected' | 'failed';
export type Pro2PostStatus = 'generating' | 'awaiting_approval' | 'approved' | 'rejected' | 'failed';

export interface IPro2PostContent {
  template?: string;
  kicker?: string;
  headline?: string;
  body?: string;
  points?: string[];
  cta?: string;
  name?: string;
  role?: string;
  photoId?: string;
  background?: string;
}

export interface IPro2Check {
  kind?: string;
  ok?: boolean;
  detail?: string;
}

export interface IPro2Post {
  _id: string;
  planId?: string;
  topicId?: string;
  version?: number;
  status: Pro2PostStatus;
  content?: IPro2PostContent;
  caption?: string;
  hashtags?: string[];
  factIds?: string[];
  checks?: IPro2Check[];
  review?: any;
  draftNote?: string;
  images?: { jpgS3Key?: string; pngS3Key?: string };
  /* Absolute addresses, when the backend resolves them (the library does). */
  imageUrl?: string;
  jpgUrl?: string;
  pngUrl?: string;
  approval?: { by?: string; byEmail?: string; at?: string; via?: 'dashboard' | 'email' };
  autoPrepared?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /* Library rows may carry the topic's title. */
  title?: string;
  topicTitle?: string;
}

export interface IPro2Topic {
  id: string;
  week: number;
  category?: string;
  title: string;
  angle?: string;
  factIds?: string[];
  template?: string;
  photoId?: string;
  status: Pro2TopicStatus;
  postId?: string;
  regenerations?: number;
  custom?: boolean;
  /* The topic's latest post, when the plan embeds it. */
  post?: IPro2Post | null;
}

export interface IPro2Plan {
  _id: string;
  cycleStart: string;
  cycleEnd: string;
  status: 'active' | 'closed';
  topics: IPro2Topic[];
  skipped?: { category: string; reason: string }[];
  /* The topics' latest posts, when the plan lists them beside the topics. */
  posts?: IPro2Post[];
}

export interface IPro2Approval {
  postId?: string;
  imageUrl: string;
  caption: string;
  hashtags?: string[];
  practiceName: string;
  status: Pro2PostStatus;
  title?: string;
  expiresAt?: string;
}

/* An S3 object key or an absolute address, as an address. */
export function pro2Asset(keyOrUrl: string): string {
  if (!keyOrUrl) { return ''; }
  return /^https?:\/\//i.test(keyOrUrl) ? keyOrUrl : S3_BASE + keyOrUrl.replace(/^\//, '');
}

export function pro2PostImage(post: IPro2Post, format: 'jpg' | 'png' = 'jpg'): string {
  if (!post) { return ''; }
  if (format === 'png') {
    return post.pngUrl || pro2Asset(post.images && post.images.pngS3Key) || pro2PostImage(post, 'jpg');
  }
  return post.jpgUrl || post.imageUrl || pro2Asset(post.images && post.images.jpgS3Key);
}

export function pro2Id(item: { _id?: string; id?: string }): string {
  return item ? (item._id || item.id || '') : '';
}

/* What a job field says, whichever way the backend writes it. */
export function pro2JobRunning(job: IPro2Job | boolean | null | undefined): boolean {
  if (!job) { return false; }
  if (job === true) { return true; }
  return !job.status || job.status === 'queued' || job.status === 'claimed';
}

/*
 * The backend wraps most answers ({ post }, { plan, pendingJob }, { brand })
 * and names ids `id`. The screens were built against the bare shapes above,
 * so the answers are unwrapped here, in one place, and given `_id` as well.
 */
function withId<T>(item: T): T {
  const row = item as any;
  if (row && row.id && !row._id) { row._id = row.id; }
  return item;
}

function asPost(post: any): IPro2Post {
  if (!post) { return null; }
  withId(post);
  if (!post.jpgUrl && post.imageUrl) { post.jpgUrl = post.imageUrl; }
  return post as IPro2Post;
}

function asPlan(plan: any): IPro2Plan {
  if (!plan) { return null; }
  withId(plan);
  plan.topics = (plan.topics || []).map((topic: any) => Object.assign(topic, { post: asPost(topic.post) }));
  return plan as IPro2Plan;
}

function asMe(me: any): IPro2Me {
  if (!me) { return me; }
  me.website = me.website || (me.profile && me.profile.website) || '';
  if (me.plan) {
    withId(me.plan);
    me.plan.pendingJob = me.plan.pendingJob || me.planPendingJob || null;
  }
  return me as IPro2Me;
}

function asBrand(brand: any): IPro2Brand {
  if (!brand) { return brand; }
  [brand.proposed, brand.approved].forEach(withId);
  const current = brand.proposed || brand.approved;
  if (!brand.fontOptions && current && current.fontOptions) { brand.fontOptions = current.fontOptions; }
  return brand as IPro2Brand;
}

/* A library row as a post: approved, with its approval record. */
function asLibraryPost(row: any): IPro2Post {
  asPost(row);
  row.status = row.status || 'approved';
  row.approval = row.approval || { at: row.approvedAt, byEmail: row.approvedBy, via: row.approvedVia };
  return row as IPro2Post;
}

/* The approval page links to the post once signed in; the token begins with
 * the post's id. */
function asApproval(token: string, view: any): IPro2Approval {
  if (!view) { return view; }
  view.postId = view.postId || String(token || '').split('.')[0];
  view.title = view.title || view.topicTitle || view.headline || '';
  return view as IPro2Approval;
}

const field = (key: string) => map((res: any) => (res && res[key] !== undefined ? res[key] : res));

@Injectable({ providedIn: 'root' })
export class Pro2Service {
  private readonly http: HttpClient;

  constructor(httpBackend: HttpBackend, private _uService: UniversalService) {
    this.http = new HttpClient(httpBackend);
  }

  private headers(): HttpHeaders {
    const token = this._uService.isBrowser ? this._uService.localStorage.getItem('token') : null;
    return token ? new HttpHeaders({ Authorization: token }) : new HttpHeaders();
  }

  private unwrap<T>(source: Observable<any>): Observable<T> {
    return source.pipe(
      map(res => (res && res.data !== undefined ? res.data : null) as T),
      catchError((error: HttpErrorResponse) => {
        const body = error && error.error;
        throw {
          status: error ? error.status : 0,
          code: body && typeof body.errorCode === 'string' ? body.errorCode : '',
          message: body && typeof body.message === 'string' ? body.message : '',
        } as IPro2Error;
      }),
    );
  }

  private get<T>(path: string): Observable<T> {
    return this.unwrap<T>(this.http.get(API_URL + path, { headers: this.headers() }));
  }

  private send<T>(method: 'POST' | 'PATCH', path: string, body: any = {}): Observable<T> {
    return this.unwrap<T>(this.http.request(method, API_URL + path, { body, headers: this.headers() }));
  }

  /* Overview */
  me(): Observable<IPro2Me> { return this.get('pro2/me').pipe(map(asMe)); }

  /* Brand DNA */
  extractBrand(websiteOverride?: string): Observable<any> {
    return this.send('POST', 'pro2/brand/extract', websiteOverride ? { websiteOverride } : {});
  }
  brand(): Observable<IPro2Brand> { return this.get('pro2/brand').pipe(map(asBrand)); }
  patchBrand(version: number, patch: IPro2BrandPatch): Observable<IPro2Dna> {
    return this.send('PATCH', 'pro2/brand/' + version, patch).pipe(field('brand'), map(withId));
  }
  /* noLogo is the member's explicit "no logo" when none is chosen. */
  approveBrand(version: number, noLogo: boolean): Observable<IPro2Dna> {
    return this.send('POST', 'pro2/brand/' + version + '/approve', noLogo ? { noLogo: true } : {}).pipe(field('brand'), map(withId));
  }
  uploadLogo(file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.unwrap(this.http.post(API_URL + 'pro2/brand/logo', form, { headers: this.headers() })).pipe(field('brand'), map(withId));
  }

  /* Plan */
  createPlan(): Observable<any> { return this.send('POST', 'pro2/plan'); }
  plan(): Observable<IPro2Plan> { return this.get('pro2/plan').pipe(field('plan'), map(asPlan)); }
  patchTopic(topicId: string, patch: { title?: string; angle?: string; week?: number }): Observable<any> {
    return this.send('PATCH', 'pro2/plan/topics/' + encodeURIComponent(topicId), patch);
  }
  addTopic(topic: { title: string; angle: string; week: number }): Observable<any> {
    return this.send('POST', 'pro2/plan/topics', topic);
  }

  /* Posts */
  preparePost(topicId: string, note?: string): Observable<any> {
    return this.send('POST', 'pro2/posts', note ? { topicId, note } : { topicId });
  }
  post(id: string): Observable<IPro2Post> { return this.get('pro2/posts/' + encodeURIComponent(id)).pipe(field('post'), map(asPost)); }
  patchPost(id: string, patch: { content?: IPro2PostContent; caption?: string }): Observable<IPro2Post> {
    return this.send('PATCH', 'pro2/posts/' + encodeURIComponent(id), patch).pipe(field('post'), map(asPost));
  }
  approvePost(id: string): Observable<IPro2Post> {
    return this.send('POST', 'pro2/posts/' + encodeURIComponent(id) + '/approve').pipe(field('post'), map(asPost));
  }
  rejectPost(id: string): Observable<IPro2Post> {
    return this.send('POST', 'pro2/posts/' + encodeURIComponent(id) + '/reject').pipe(field('post'), map(asPost));
  }
  library(): Observable<IPro2Post[] | { posts: IPro2Post[] }> {
    return this.get('pro2/library').pipe(map((res: any) => ({ posts: ((res && res.posts) || []).map(asLibraryPost) })));
  }

  /* One-tap approval from the email: public, never carries a session. */
  approval(token: string): Observable<IPro2Approval> {
    return this.unwrap(this.http.get(API_URL + 'pro2/approval/' + encodeURIComponent(token))).pipe(map(view => asApproval(token, view)));
  }
  decide(token: string, action: 'approve' | 'reject'): Observable<IPro2Approval | { status: Pro2PostStatus }> {
    return this.unwrap(this.http.post(API_URL + 'pro2/approval/' + encodeURIComponent(token), { action })).pipe(map(view => asApproval(token, view)));
  }
}
