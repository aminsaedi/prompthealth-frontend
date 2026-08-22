import { Injectable, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  ILinkDashboard,
  ILinkPolicyRecord,
  ILinkRecord,
  LinkManagerService,
} from 'src/app/shared/services/link-manager.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';

/* The four pages of the link admin all read the same two things: the window
 * everything is measured over, and the catalog. Holding them here means moving
 * between pages does not re-fetch what is already on screen, and the window
 * picker in the header applies everywhere without being passed down by hand.
 *
 * Provided by the module, so it is created with the section and disposed with
 * it rather than living for the life of the app. */
@Injectable()
export class LinkAdminStore implements OnDestroy {
  private destroy$ = new Subject<void>();

  readonly days$ = new BehaviorSubject<number>(30);
  readonly dashboard$ = new BehaviorSubject<ILinkDashboard>(null);
  readonly dashboardLoading$ = new BehaviorSubject<boolean>(false);

  /* The whole catalog, so the grid can sort, filter and export it without a
   * round trip per interaction. Fetched in pages of 500 and capped, because an
   * inventory that outgrows the browser should page on the server instead. */
  readonly links$ = new BehaviorSubject<ILinkRecord[]>([]);
  readonly linksLoading$ = new BehaviorSubject<boolean>(false);
  readonly linksTotal$ = new BehaviorSubject<number>(0);

  readonly policy$ = new BehaviorSubject<ILinkPolicyRecord>(null);
  readonly policyLoading$ = new BehaviorSubject<boolean>(false);

  /* Which site-wide job is running, so both the header buttons and any page
   * showing their result can disable and explain themselves. */
  readonly running$ = new BehaviorSubject<string>('');

  private readonly PAGE = 500;
  private readonly MAX_ROWS = 5000;
  private linksLoaded = false;

  constructor(
    private service: LinkManagerService,
    private profileService: ProfileManagementService,
    private toastr: ToastrService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* The scan, the destination check and the tagging policy are site-wide, so
   * they are the administrator's to run. A practitioner or clinic sees the same
   * pages scoped to their own links, without those controls. */
  get isAdmin(): boolean {
    const profile = this.profileService.profile;
    return !!profile && profile.isSA;
  }

  get days(): number {
    return this.days$.value;
  }

  setDays(days: number): void {
    if (days === this.days$.value) { return; }
    this.days$.next(days);
    this.loadDashboard();
  }

  // ------------------------------------------------------------- dashboard

  loadDashboard(): void {
    this.dashboardLoading$.next(true);
    this.service.dashboard({ days: this.days })
      .pipe(takeUntil(this.destroy$), finalize(() => this.dashboardLoading$.next(false)))
      .subscribe(
        (res: any) => this.dashboard$.next((res && res.data) || null),
        () => this.toastr.error('Could not load the link overview'),
      );
  }

  // --------------------------------------------------------------- catalog

  loadLinks(force = false): void {
    if (this.linksLoaded && !force) { return; }
    this.linksLoaded = true;
    this.linksLoading$.next(true);
    this.fetchPage(1, []);
  }

  private fetchPage(page: number, collected: ILinkRecord[]): void {
    this.service.getAll({ page, count: this.PAGE, sortBy: 'stats.clicks', sortDir: 'desc' })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          const body = (res && res.data) || {};
          const rows = body.data || [];
          const total = body.total || 0;
          const all = collected.concat(rows);
          this.linksTotal$.next(total);

          if (rows.length === this.PAGE && all.length < Math.min(total, this.MAX_ROWS)) {
            /* Emit what has arrived so the grid fills in rather than waiting
             * for the last page of a large catalog. */
            this.links$.next(all);
            this.fetchPage(page + 1, all);
            return;
          }
          this.links$.next(all);
          this.linksLoading$.next(false);
        },
        () => {
          this.linksLoading$.next(false);
          this.toastr.error('Could not load links');
        },
      );
  }

  saveLink(id: string, payload: any): Observable<any> {
    return id ? this.service.update(id, payload) : this.service.create(payload);
  }

  removeLink(link: ILinkRecord): void {
    this.service.remove(link._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => { this.toastr.success('Link deleted'); this.loadLinks(true); this.loadDashboard(); },
        (err: any) => this.toastr.error(messageOf(err, 'Could not delete the link')),
      );
  }

  // ---------------------------------------------------------------- policy

  loadPolicy(force = false): void {
    if (this.policy$.value && !force) { return; }
    this.policyLoading$.next(true);
    this.service.getPolicy()
      .pipe(takeUntil(this.destroy$), finalize(() => this.policyLoading$.next(false)))
      .subscribe(
        (res: any) => this.policy$.next((res && res.data) || null),
        () => this.toastr.error('Could not load the tagging policy'),
      );
  }

  savePolicy(payload: ILinkPolicyRecord, done: () => void): void {
    this.service.updatePolicy(payload)
      .pipe(takeUntil(this.destroy$), finalize(done))
      .subscribe(
        (res: any) => {
          this.policy$.next((res && res.data) || this.policy$.value);
          this.toastr.success('Policy saved. It reaches the site within five minutes.');
        },
        (err: any) => this.toastr.error(messageOf(err, 'Could not save the policy')),
      );
  }

  // ----------------------------------------------------------- maintenance

  checkHealth(): void {
    this.running$.next('health');
    this.service.runHealthCheck({ limit: 100, staleHours: 0 })
      .pipe(takeUntil(this.destroy$), finalize(() => this.running$.next('')))
      .subscribe(
        (res: any) => {
          const data = (res && res.data) || {};
          this.toastr.success(`Checked ${data.checked} destinations`);
          this.loadDashboard();
          this.loadLinks(true);
        },
        (err: any) => this.toastr.error(messageOf(err, 'Could not check destinations')),
      );
  }

  discover(): void {
    this.running$.next('discover');
    this.service.runDiscovery({})
      .pipe(takeUntil(this.destroy$), finalize(() => this.running$.next('')))
      .subscribe(
        (res: any) => {
          const data = (res && res.data) || {};
          const repaired = data.repaired ? `, repaired ${data.repaired}` : '';
          const retired = data.retired ? `, retired ${data.retired}` : '';
          this.toastr.success(`Found ${data.urlsFound} outbound links, filed ${data.registered}${repaired}${retired}`);
          this.loadDashboard();
          this.loadLinks(true);
        },
        (err: any) => this.toastr.error(messageOf(err, 'Could not scan the site')),
      );
  }

  copy(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => this.toastr.success('Copied'),
        () => this.toastr.info(text),
      );
    } else {
      this.toastr.info(text);
    }
  }

  success(message: string): void { this.toastr.success(message); }
  failure(err: any, fallback: string): void { this.toastr.error(messageOf(err, fallback)); }
}

export const messageOf = (err: any, fallback: string): string =>
  (err && err.error && err.error.message) || fallback;
