import { Component, OnDestroy, OnInit } from '@angular/core';
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

type Tab = 'overview' | 'links' | 'policy';

interface IFilters {
  search: string;
  source: string;
  health: string;
  slugType: string;
  sortBy: string;
}

const EMPTY_FORM = (): Partial<ILinkRecord> => ({
  title: '',
  description: '',
  destinationUrl: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmContent: '',
  slugType: 'CUSTOM',
  code: '',
  isActive: true,
});

@Component({
  selector: 'app-link-manager',
  templateUrl: './link-manager.component.html',
  styleUrls: ['./link-manager.component.scss'],
})
export class LinkManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly SITE = environment.config.FRONTEND_BASE;
  readonly SLUG_TYPES = ['SOCIAL', 'PROFILE_WEBSITE', 'BOOKING', 'ARTICLE', 'EVENT', 'CUSTOM'];
  readonly SOURCES = ['MANUAL', 'PROFILE', 'BOOKING', 'DISCOVERED', 'CLICK'];
  readonly HEALTH_STATUSES = ['OK', 'REDIRECT', 'BROKEN', 'UNREACHABLE', 'BLOCKED', 'UNKNOWN'];
  readonly WINDOWS = [7, 30, 90, 365];

  tab: Tab = 'overview';

  // Overview
  dashboard: ILinkDashboard = null;
  dashboardLoading = false;
  days = 30;

  // Catalog
  list: ILinkRecord[] = [];
  total = 0;
  page = 1;
  count = 20;
  listLoading = false;
  filters: IFilters = { search: '', source: '', health: '', slugType: '', sortBy: 'stats.clicks' };

  // Editor
  showForm = false;
  editing: ILinkRecord = null;
  form: Partial<ILinkRecord> = EMPTY_FORM();
  saving = false;

  // Per-link analytics
  activeLink: ILinkRecord = null;
  analytics: any = null;
  analyticsLoading = false;

  // Policy
  policy: ILinkPolicyRecord = null;
  policyLoading = false;
  policySaving = false;
  internalHostsText = '';
  excludeHostsText = '';

  // Maintenance
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

  selectTab(tab: Tab): void {
    if (tab === 'policy' && !this.isAdmin) { return; }
    this.tab = tab;
    if (tab === 'links' && !this.list.length) { this.loadList(); }
    if (tab === 'policy' && !this.policy) { this.loadPolicy(); }
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

  setDays(days: number): void {
    this.days = days;
    this.loadDashboard();
    if (this.activeLink) { this.showAnalytics(this.activeLink); }
  }

  /* Bar heights for the click trend, scaled to the busiest day in the window. */
  get trendMax(): number {
    if (!this.dashboard || !this.dashboard.trend.length) { return 1; }
    return Math.max(1, ...this.dashboard.trend.map(row => row.total));
  }

  barHeight(value: number): string {
    return `${Math.round((value / this.trendMax) * 100)}%`;
  }

  entries(map: { [key: string]: number }): { key: string; value: number }[] {
    if (!map) { return []; }
    return Object.keys(map)
      .map(key => ({ key, value: map[key] }))
      .sort((a, b) => b.value - a.value);
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

  clearFilters(): void {
    this.filters = { search: '', source: '', health: '', slugType: '', sortBy: 'stats.clicks' };
    this.loadList(true);
  }

  get totalPages(): number {
    return this.total > 0 ? Math.ceil(this.total / this.count) : 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) { return; }
    this.page = page;
    this.loadList();
  }

  shortUrl(link: ILinkRecord): string {
    return `${this.SITE}/out/${link.code}`;
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

  healthClass(link: ILinkRecord): string {
    const status = (link.health && link.health.status) || 'UNKNOWN';
    switch (status) {
      case 'OK': return 'health-ok';
      case 'REDIRECT': return 'health-warn';
      case 'BLOCKED': return 'health-warn';
      case 'BROKEN':
      case 'UNREACHABLE': return 'health-bad';
      default: return 'health-unknown';
    }
  }

  // --------------------------------------------------------------- editor

  openCreate(): void {
    this.editing = null;
    this.form = EMPTY_FORM();
    this.showForm = true;
  }

  openEdit(link: ILinkRecord): void {
    this.editing = link;
    this.form = {
      title: link.title || '',
      description: link.description || '',
      destinationUrl: link.destinationUrl || '',
      utmSource: link.utmSource || '',
      utmMedium: link.utmMedium || '',
      utmCampaign: link.utmCampaign || '',
      utmContent: link.utmContent || '',
      slugType: link.slugType || 'CUSTOM',
      code: link.code || '',
      isActive: link.isActive !== false,
      managed: link.managed === true,
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(): void {
    if (!this.form.destinationUrl) {
      this.toastr.error('A destination URL is required');
      return;
    }
    this.saving = true;
    const payload = this.strip(this.form);
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

  /* Empty strings would clear fields the editor never showed, and the create
   * endpoint rejects a blank custom code. */
  private strip(form: Partial<ILinkRecord>): any {
    const out: any = {};
    Object.keys(form).forEach(key => {
      const value = (form as any)[key];
      if (value !== '' && value !== null && value !== undefined) { out[key] = value; }
    });
    return out;
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
    this.service.analytics(link._id, { days: this.days })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.analyticsLoading = false)))
      .subscribe(
        (res: any) => { this.analytics = (res && res.data) || null; },
        () => this.toastr.error('Could not load analytics'),
      );
  }

  closeAnalytics(): void {
    this.activeLink = null;
    this.analytics = null;
  }

  get analyticsMax(): number {
    if (!this.analytics || !this.analytics.byDay || !this.analytics.byDay.length) { return 1; }
    return Math.max(1, ...this.analytics.byDay.map((row: any) => row.total));
  }

  analyticsBar(value: number): string {
    return `${Math.round((value / this.analyticsMax) * 100)}%`;
  }

  // --------------------------------------------------------------- policy

  loadPolicy(): void {
    this.policyLoading = true;
    this.service.getPolicy()
      .pipe(takeUntil(this.destroy$), finalize(() => (this.policyLoading = false)))
      .subscribe(
        (res: any) => {
          this.policy = (res && res.data) || null;
          if (this.policy) {
            this.internalHostsText = (this.policy.internalHosts || []).join('\n');
            this.excludeHostsText = (this.policy.excludeHosts || []).join('\n');
          }
        },
        () => this.toastr.error('Could not load the tagging policy'),
      );
  }

  addRule(): void {
    if (!this.policy) { return; }
    this.policy.routeRules = [...(this.policy.routeRules || []), { pattern: '', campaign: '', label: '' }];
  }

  removeRule(index: number): void {
    this.policy.routeRules = this.policy.routeRules.filter((_, i) => i !== index);
  }

  savePolicy(): void {
    if (!this.policy) { return; }
    const rules = (this.policy.routeRules || []).filter(rule => rule.pattern && rule.campaign);
    const invalid = rules.find(rule => !this.isValidPattern(rule.pattern));
    if (invalid) {
      this.toastr.error(`"${invalid.pattern}" is not a valid pattern`);
      return;
    }

    this.policySaving = true;
    this.service.updatePolicy({
      ...this.policy,
      routeRules: rules,
      internalHosts: this.splitLines(this.internalHostsText),
      excludeHosts: this.splitLines(this.excludeHostsText),
    })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.policySaving = false)))
      .subscribe(
        (res: any) => {
          this.policy = (res && res.data) || this.policy;
          this.toastr.success('Policy saved. It reaches the site within five minutes.');
        },
        (err: any) => this.toastr.error(this.messageOf(err, 'Could not save the policy')),
      );
  }

  private isValidPattern(pattern: string): boolean {
    try {
      new RegExp(pattern);
      return true;
    } catch (e) {
      return false;
    }
  }

  private splitLines(text: string): string[] {
    return (text || '').split('\n').map(line => line.trim().toLowerCase()).filter(Boolean);
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
        (err: any) => this.toastr.error(this.messageOf(err, 'Health check failed')),
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
        (err: any) => this.toastr.error(this.messageOf(err, 'Discovery failed')),
      );
  }
}
