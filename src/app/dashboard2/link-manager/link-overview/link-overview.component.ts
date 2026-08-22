import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ILinkDashboard, ILinkRecord } from 'src/app/shared/services/link-manager.service';
import { HEALTH_META, healthMeta } from '../link-health';
import { buildTrendPaths } from '../link-trend';

interface IRibbonSegment {
  status: string;
  label: string;
  tone: string;
  hint: string;
  count: number;
  percent: number;
}

interface IHostBar {
  hostname: string;
  humans: number;
  percent: number;
}

@Component({
  selector: 'app-link-overview',
  templateUrl: './link-overview.component.html',
})
export class LinkOverviewComponent implements OnChanges {
  @Input() dashboard: ILinkDashboard = null;
  @Input() loading = false;

  @Output() focusHealth = new EventEmitter<string>();

  segments: IRibbonSegment[] = [];
  checked = 0;
  hosts: IHostBar[] = [];

  readonly viewWidth = 720;
  readonly viewHeight = 140;
  linePath = '';
  areaPath = '';
  peak = 0;

  ngOnChanges(): void {
    this.buildRibbon();
    this.buildHosts();
    this.buildTrend();
  }

  private buildRibbon(): void {
    const health = (this.dashboard && this.dashboard.health) || {};
    const total = Object.keys(health).reduce((sum, key) => sum + (health[key] || 0), 0);

    this.segments = HEALTH_META
      .map(meta => {
        const count = health[meta.status] || 0;
        return {
          status: meta.status,
          label: meta.label,
          tone: meta.tone,
          hint: meta.hint,
          count,
          percent: total ? (count / total) * 100 : 0,
        };
      })
      .filter(segment => segment.count > 0);

    this.checked = total - (health.UNKNOWN || 0);
  }

  private buildHosts(): void {
    const rows = (this.dashboard && this.dashboard.topHosts) || [];
    const busiest = rows.reduce((max, row) => Math.max(max, row.humans || 0), 0);
    this.hosts = rows.map(row => ({
      hostname: row.hostname,
      humans: row.humans || 0,
      percent: busiest ? ((row.humans || 0) / busiest) * 100 : 0,
    }));
  }

  private buildTrend(): void {
    const trend = (this.dashboard && this.dashboard.trend) || [];
    const paths = buildTrendPaths(trend.map(row => row.total || 0), this.viewWidth, this.viewHeight);
    this.linePath = paths.line;
    this.areaPath = paths.area;
    this.peak = paths.peak;
  }

  /* Broken destinations that still receive clicks: the ribbon already says how
   * many are dead, this says which ones are costing traffic today. */
  get attention(): ILinkRecord[] {
    const broken = (this.dashboard && this.dashboard.broken) || [];
    return [...broken].sort((a, b) => this.clicksOf(b) - this.clicksOf(a));
  }

  clicksOf(link: ILinkRecord): number {
    return (link.stats && link.stats.humanClicks) || 0;
  }

  statusLabel(link: ILinkRecord): string {
    return healthMeta(link.health && link.health.status).label;
  }

  get sources(): { key: string; value: number }[] {
    const map = (this.dashboard && this.dashboard.inventory && this.dashboard.inventory.bySource) || {};
    return Object.keys(map)
      .map(key => ({ key, value: map[key] }))
      .sort((a, b) => b.value - a.value);
  }

  get firstDay(): string {
    const trend = (this.dashboard && this.dashboard.trend) || [];
    return trend.length ? trend[0].day : '';
  }

  get lastDay(): string {
    const trend = (this.dashboard && this.dashboard.trend) || [];
    return trend.length ? trend[trend.length - 1].day : '';
  }
}
