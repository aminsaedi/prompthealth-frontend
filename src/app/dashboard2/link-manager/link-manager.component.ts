import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  ILinkDashboard,
  ILinkPolicyRecord,
  ILinkRecord,
  LinkManagerService,
} from 'src/app/shared/services/link-manager.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { environment } from 'src/environments/environment';
import { ILinkFilters, emptyFilters } from './link-catalog/link-catalog.component';
import { buildTrendPaths } from './link-trend';

export type LinkTab = 'overview' | 'links' | 'policy';

@Component({
  selector: 'app-link-manager',
  templateUrl: './link-manager.component.html',
  styleUrls: ['./link-manager.component.scss'],
  /* The panels below are split into presentational children that carry no
   * styles of their own. Turning encapsulation off lets one stylesheet dress
   * all of them; every rule is nested under .link-manager so nothing escapes
   * this page. */
  encapsulation: ViewEncapsulation.None,
})
export class LinkManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly SITE = environment.config.FRONTEND_BASE;
  readonly WINDOWS = [7, 30, 90, 365];

  tab: LinkTab = 'overview';
  days = 30;

  dashboard: ILinkDashboard = null;
  dashboardLoading = false;

  list: ILinkRecord[] = [];
  total = 0;
  page = 1;
  count = 20;
  listLoading = false;
  filters: ILinkFilters = emptyFilters();

  showForm = false;
  editing: ILinkRecord = null;
  saving = false;

  activeLink: ILinkRecord = null;
  analytics: any = null;
  analyticsLoading = false;

  readonly drawerWidth = 480;
  readonly drawerHeight = 80;
  analyticsLine = '';
  analyticsArea = '';

  policy: ILinkPolicyRecord = null;
  policyLoading = false;
  policySaving = false;

  running = '';

  constructor(
    private service: LinkManagerService,
    private profileService: ProfileManagementService,
    private toastr: ToastrService,
  ) {}

  /* The scan, the destination check and the tagging policy are site-wide, so
   * they are the administrator's to run. A practitioner or clinic sees the same
   * page scoped to their own links, without those controls. */
  get isAdmin(): boolean {
    const profile = this.profileService.profile;
    return !!profile && profile.isSA;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get tabs(): LinkTab[] {
    return this.isAdmin ? ['overview', 'links', 'policy'] : ['overview', 'links'];
  }

  selectTab(tab: LinkTab): void {
    if (tab === 'policy' && !this.isAdmin) { return; }
    this.tab = tab;
    if (tab === 'links' && !this.list.length) { this.loadList(); }
    if (tab === 'policy' && !this.policy) { this.loadPolicy(); }
  }

  /* A tablist is expected to move with the arrow keys; without this the roles
   * promise a keyboard behaviour the page does not have. */
  onTabKey(event: KeyboardEvent): void {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) { return; }

    event.preventDefault();
    const tabs = this.tabs;
    const next = tabs[(tabs.indexOf(this.tab) + step + tabs.length) % tabs.length];
    this.selectTab(next);

    const target = document.getElementById('tab' + next.charAt(0).toUpperCase() + next.slice(1));
    if (target) { target.focus(); }
  }

  /* A segment of the health ribbon is the way into the work it represents:
   * clicking "Dead" opens the catalog already filtered to dead destinations
   * rather than describing how to find them. */
  focusHealth(status: string): void {
    this.filters = { ...emptyFilters(), health: status, sortBy: 'stats.clicks' };
    this.tab = 'links';
    this.loadList(true);
  }

  setDays(days: number): void {
    this.days = days;
    this.loadDashboard();
    if (this.activeLink) { this.showAnalytics(this.activeLink); }
  }

  // ------------------------------------------------------------- overview

  loadDashboard(): void {
    this.dashboardLoading = true;
    this.service.dashboard({ days: this.days })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.dashboardLoading = false)))
      .subscribe(
        (res: any) => { this.dashboard = (res && res.data) || null; },
        () => this.toastr.error('Could not load the link overview'),
      );
  }

  // -------------------------------------------------------------- catalog

  loadList(resetPage = false): void {
    if (resetPage) { this.page = 1; }
    this.listLoading = true;
    this.service.getAll({ page: this.page, count: this.count, ...this.cleanFilters() })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.listLoading = false)))
      .subscribe(
        (res: any) => {
          const data = (res && res.data) || {};
          this.list = data.data || [];
          this.total = data.total || 0;
        },
        () => this.toastr.error('Could not load links'),
      );
  }

  private cleanFilters(): any {
    const out: any = {};
    Object.keys(this.filters).forEach(key => {
      const value = (this.filters as any)[key];
      if (value) { out[key] = value; }
    });
    return out;
  }

  applyFilters(filters: ILinkFilters): void {
    this.filters = filters;
    this.loadList(true);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) { return; }
    this.page = page;
    this.loadList();
  }

  get totalPages(): number {
    return this.total > 0 ? Math.ceil(this.total / this.count) : 1;
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

  // --------------------------------------------------------------- editor

  openCreate(): void {
    this.editing = null;
    this.showForm = true;
  }

  openEdit(link: ILinkRecord): void {
    this.editing = link;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(payload: any): void {
    this.saving = true;
    const request = this.editing
      ? this.service.update(this.editing._id, payload)
      : this.service.create(payload);

    request.pipe(takeUntil(this.destroy$), finalize(() => (this.saving = false)))
      .subscribe(
        () => {
          this.toastr.success(this.editing ? 'Link updated' : 'Link created');
          this.showForm = false;
          this.editing = null;
          this.loadList();
        },
        (err: any) => this.toastr.error(this.messageOf(err, 'Could not save the link')),
      );
  }

  private messageOf(err: any, fallback: string): string {
    return (err && err.error && err.error.message) || fallback;
  }

  remove(link: ILinkRecord): void {
    if (!confirm(`Delete ${link.code}? Any /out/${link.code} link stops working.`)) { return; }
    this.service.remove(link._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => { this.toastr.success('Link deleted'); this.loadList(); },
        (err: any) => this.toastr.error(this.messageOf(err, 'Could not delete the link')),
      );
  }

  showAnalytics(link: ILinkRecord): void {
    this.activeLink = link;
    this.analyticsLoading = true;
    this.analytics = null;
    this.analyticsLine = '';
    this.analyticsArea = '';
    this.service.analytics(link._id, { days: this.days })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.analyticsLoading = false)))
      .subscribe(
        (res: any) => {
          this.analytics = (res && res.data) || null;
          const byDay = (this.analytics && this.analytics.byDay) || [];
          const paths = buildTrendPaths(byDay.map((row: any) => row.total || 0), this.drawerWidth, this.drawerHeight);
          this.analyticsLine = paths.line;
          this.analyticsArea = paths.area;
        },
        () => this.toastr.error('Could not load analytics'),
      );
  }

  closeAnalytics(): void {
    this.activeLink = null;
    this.analytics = null;
    this.analyticsLine = '';
    this.analyticsArea = '';
  }

  // --------------------------------------------------------------- policy

  loadPolicy(): void {
    this.policyLoading = true;
    this.service.getPolicy()
      .pipe(takeUntil(this.destroy$), finalize(() => (this.policyLoading = false)))
      .subscribe(
        (res: any) => { this.policy = (res && res.data) || null; },
        () => this.toastr.error('Could not load the tagging policy'),
      );
  }

  savePolicy(payload: ILinkPolicyRecord): void {
    this.policySaving = true;
    this.service.updatePolicy(payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.policySaving = false)))
      .subscribe(
        (res: any) => {
          this.policy = (res && res.data) || this.policy;
          this.toastr.success('Policy saved. It reaches the site within five minutes.');
        },
        (err: any) => this.toastr.error(this.messageOf(err, 'Could not save the policy')),
      );
  }

  // ---------------------------------------------------------- maintenance

  checkHealth(): void {
    this.running = 'health';
    this.service.runHealthCheck({ limit: 100, staleHours: 0 })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.running = '')))
      .subscribe(
        (res: any) => {
          const data = (res && res.data) || {};
          this.toastr.success(`Checked ${data.checked} destinations`);
          this.loadDashboard();
          if (this.list.length) { this.loadList(); }
        },
        (err: any) => this.toastr.error(this.messageOf(err, 'Could not check destinations')),
      );
  }

  discover(): void {
    this.running = 'discover';
    this.service.runDiscovery({})
      .pipe(takeUntil(this.destroy$), finalize(() => (this.running = '')))
      .subscribe(
        (res: any) => {
          const data = (res && res.data) || {};
          const repaired = data.repaired ? `, repaired ${data.repaired}` : '';
          const retired = data.retired ? `, retired ${data.retired}` : '';
          this.toastr.success(`Found ${data.urlsFound} outbound links, filed ${data.registered}${repaired}${retired}`);
          this.loadDashboard();
          if (this.list.length) { this.loadList(); }
        },
        (err: any) => this.toastr.error(this.messageOf(err, 'Could not scan the site')),
      );
  }
}
