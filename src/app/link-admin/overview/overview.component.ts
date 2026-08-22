import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ILinkDashboard, ILinkRecord } from 'src/app/shared/services/link-manager.service';
import { CHART_COLORS, splitConfig, trendConfig } from '../chart/chart-theme';
import { HEALTH_META, healthMeta, IHealthMeta } from '../link-health';
import { LinkAdminStore } from '../link-admin.store';

interface HealthSlice extends IHealthMeta {
  count: number;
  share: number;
}

@Component({
  selector: 'app-link-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  dashboard: ILinkDashboard = null;
  loading = false;
  days = 30;

  trendChart: ChartConfiguration = null;
  healthChart: ChartConfiguration = null;
  deviceChart: ChartConfiguration = null;

  healthSlices: HealthSlice[] = [];

  constructor(public store: LinkAdminStore, private router: Router) {}

  ngOnInit(): void {
    this.store.days$.pipe(takeUntil(this.destroy$)).subscribe(days => (this.days = days));
    this.store.dashboardLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => (this.loading = loading));
    this.store.dashboard$.pipe(takeUntil(this.destroy$)).subscribe(dashboard => {
      this.dashboard = dashboard;
      this.rebuild();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private rebuild(): void {
    if (!this.dashboard) {
      this.trendChart = this.healthChart = this.deviceChart = null;
      this.healthSlices = [];
      return;
    }

    const trend = this.dashboard.trend || [];
    this.trendChart = trendConfig(
      trend.map(row => shortDay(row.day)),
      trend.map(row => row.humans || 0),
      trend.map(row => row.bots || 0),
    );

    const counts = this.dashboard.health || {};
    const inventory = Object.keys(counts).reduce((sum, key) => sum + (counts[key] || 0), 0);
    this.healthSlices = HEALTH_META
      .map(meta => ({
        ...meta,
        count: counts[meta.status] || 0,
        share: inventory ? Math.round(((counts[meta.status] || 0) / inventory) * 1000) / 10 : 0,
      }))
      .filter(slice => slice.count > 0);

    this.healthChart = this.healthSlices.length
      ? splitConfig(
          this.healthSlices.map(slice => slice.label),
          this.healthSlices.map(slice => slice.count),
          this.healthSlices.map(slice => TONE_COLOR[slice.tone]),
        )
      : null;

    const { mobile, desktop } = this.totals;
    this.deviceChart = mobile || desktop
      ? splitConfig(['Mobile', 'Desktop'], [mobile, desktop], [CHART_COLORS.primary, CHART_COLORS.secondary])
      : null;
  }

  get totals() {
    return (this.dashboard && this.dashboard.totals) || { total: 0, humans: 0, bots: 0, mobile: 0, desktop: 0, unique: 0 };
  }

  get inventory() {
    return (this.dashboard && this.dashboard.inventory) || { total: 0, managed: 0, active: 0, hosts: 0, bySource: {}, byType: {} };
  }

  get broken(): ILinkRecord[] {
    return ((this.dashboard && this.dashboard.broken) || []).slice(0, 6);
  }

  get brokenCount(): number {
    const health = (this.dashboard && this.dashboard.health) || {};
    return (health.BROKEN || 0) + (health.UNREACHABLE || 0);
  }

  get topLinks() {
    return ((this.dashboard && this.dashboard.topLinks) || []).slice(0, 8);
  }

  get topHosts() {
    return ((this.dashboard && this.dashboard.topHosts) || []).slice(0, 8);
  }

  get hostPeak(): number {
    return this.topHosts.reduce((max, host) => Math.max(max, host.humans || 0), 0);
  }

  barWidth(value: number): string {
    const peak = this.hostPeak;
    return peak ? `${Math.max(2, Math.round((value / peak) * 100))}%` : '0%';
  }

  healthTone(link: ILinkRecord): string {
    return healthMeta(link.health && link.health.status).tone;
  }

  healthLabel(link: ILinkRecord): string {
    return healthMeta(link.health && link.health.status).label;
  }

  /* A health slice is the way into the work it represents: choosing "Dead"
   * opens the catalog already filtered to dead destinations rather than
   * explaining how to find them. */
  openHealth(status: string): void {
    this.router.navigate(['/link-admin/links'], { queryParams: { health: status } });
  }

  openHost(hostname: string): void {
    this.router.navigate(['/link-admin/reports'], { queryParams: { hostname, groupBy: 'utmCampaign' } });
  }

  label(link: any): string {
    return link.title || link.hostname || link.destinationUrl;
  }
}

const TONE_COLOR: { [key: string]: string } = {
  good: CHART_COLORS.success,
  warn: CHART_COLORS.warning,
  bad: CHART_COLORS.error,
  info: CHART_COLORS.secondary,
  idle: CHART_COLORS.line,
};

/* "Mar 4" reads at a glance where "2026-03-04" has to be parsed, and a year of
 * full dates does not fit the axis anyway. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDay = (day: string): string => {
  const parts = String(day || '').split('-');
  if (parts.length !== 3) { return day; }
  return `${MONTHS[parseInt(parts[1], 10) - 1] || parts[1]} ${parseInt(parts[2], 10)}`;
};
