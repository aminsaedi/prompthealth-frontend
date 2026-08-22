import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { IReport, IReportFacet, LinkManagerService } from 'src/app/shared/services/link-manager.service';
import { rankingConfig, trendConfig } from '../chart/chart-theme';
import { LinkAdminStore } from '../link-admin.store';

interface Field { key: string; label: string; hint?: string; }

/* Everything the report is made of lives in the address bar. A question worth
 * asking twice is then a bookmark, and "clicks to cmha.ca by campaign" can be
 * pasted to someone else and open exactly as it was left. */
const FILTERS: Field[] = [
  { key: 'hostname', label: 'Destination site' },
  { key: 'utmSource', label: 'utm_source' },
  { key: 'utmMedium', label: 'utm_medium' },
  { key: 'utmCampaign', label: 'utm_campaign' },
  { key: 'utmContent', label: 'utm_content' },
  { key: 'sourcePath', label: 'Page clicked from' },
  { key: 'deviceType', label: 'Device' },
  { key: 'channel', label: 'Click type' },
];

const GROUPS: Field[] = [
  { key: 'day', label: 'Day' },
  { key: 'hostname', label: 'Destination site' },
  { key: 'link', label: 'Link' },
  { key: 'utmSource', label: 'utm_source' },
  { key: 'utmMedium', label: 'utm_medium' },
  { key: 'utmCampaign', label: 'utm_campaign' },
  { key: 'utmContent', label: 'utm_content' },
  { key: 'sourcePath', label: 'Page clicked from' },
  { key: 'deviceType', label: 'Device' },
  { key: 'channel', label: 'Click type' },
];

@Component({
  selector: 'app-link-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly FILTERS = FILTERS;
  readonly GROUPS = GROUPS;
  readonly WINDOWS = [7, 30, 90, 180];
  readonly isBrowser: boolean;

  /* Read from the URL on every navigation; never written to directly by the
   * controls, so there is one copy of the truth. */
  state: any = {};
  report: IReport = null;
  facets: { [key: string]: IReportFacet[] } = {};
  loading = false;
  failed = false;

  trendChart: ChartConfiguration = null;
  rankingChart: ChartConfiguration = null;

  rows: any[] = [];
  columnDefs: any[] = [];
  defaultColDef: any = { sortable: true, filter: true, resizable: true };
  gridOptions: any = {
    animateRows: false,
    pagination: true,
    paginationPageSize: 25,
    rowHeight: 40,
    headerHeight: 40,
    suppressCellSelection: true,
    overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">No clicks matched these filters.</span>',
  };
  private gridApi: any = null;

  constructor(
    public store: LinkAdminStore,
    private service: LinkManagerService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.state = this.readState(params);
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private readState(params: any): any {
    const state: any = {
      groupBy: params.groupBy || 'hostname',
      audience: params.audience || 'humans',
      linkId: params.linkId || '',
      from: params.from || '',
      to: params.to || '',
      days: parseInt(params.days, 10) || 30,
    };
    FILTERS.forEach(field => (state[field.key] = params[field.key] || ''));
    return state;
  }

  /* The request the server understands, built from the state rather than kept
   * as a second copy that can drift out of step with the controls. */
  private query(): any {
    const params: any = { groupBy: this.state.groupBy, limit: 500 };
    if (this.state.from && this.state.to) {
      params.from = this.state.from;
      params.to = this.state.to;
    } else {
      params.days = this.state.days;
    }
    if (this.state.linkId) { params.linkId = this.state.linkId; }
    if (this.state.audience === 'humans') { params.humansOnly = true; }
    if (this.state.audience === 'bots') { params.botsOnly = true; }
    FILTERS.forEach(field => {
      if (this.state[field.key]) { params[field.key] = this.state[field.key]; }
    });
    return params;
  }

  private load(): void {
    const params = this.query();
    this.loading = true;
    this.failed = false;

    this.service.report(params)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loading = false)))
      .subscribe(
        (res: any) => {
          this.report = (res && res.data) || null;
          this.rebuild();
        },
        () => { this.failed = true; this.report = null; },
      );

    /* Facets follow the same window so the choices offered are choices that
     * would actually return something. */
    const facetParams: any = { limit: 200 };
    if (params.from) { facetParams.from = params.from; facetParams.to = params.to; }
    else { facetParams.days = params.days; }
    this.service.reportFacets(facetParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => (this.facets = ((res && res.data) || {}).facets || {}),
        () => (this.facets = {}),
      );
  }

  private rebuild(): void {
    if (!this.report) {
      this.rows = [];
      this.trendChart = null;
      this.rankingChart = null;
      return;
    }

    const trend = this.report.trend || [];
    this.trendChart = trend.length
      ? trendConfig(trend.map(row => shortDay(row.day)), trend.map(row => row.humans || 0), trend.map(row => row.bots || 0))
      : null;

    const rows = this.report.rows || [];
    this.rows = rows;

    const top = rows.slice(0, 12);
    this.rankingChart = this.state.groupBy !== 'day' && top.length
      ? rankingConfig(top.map(row => row.label), top.map(row => row.humans || 0), 'People')
      : null;

    this.columnDefs = this.buildColumns();
    if (this.gridApi) { this.gridApi.setColumnDefs(this.columnDefs); }
  }

  private buildColumns(): any[] {
    const linkGrouping = this.state.groupBy === 'link';
    const columns: any[] = [
      { colId: 'label', field: 'label', headerName: this.groupLabel, flex: 2, minWidth: 200 },
    ];
    if (linkGrouping) {
      columns.push({ colId: 'hostname', field: 'hostname', headerName: 'Destination', flex: 1, minWidth: 150 });
      columns.push({ colId: 'code', field: 'code', headerName: 'Short code', width: 130 });
    }
    return columns.concat([
      { colId: 'humans', field: 'humans', headerName: 'People', width: 110, type: 'numericColumn', filter: 'agNumberColumnFilter', sort: this.state.groupBy === 'day' ? null : 'desc' },
      { colId: 'unique', field: 'unique', headerName: 'Visitors', width: 110, type: 'numericColumn', filter: 'agNumberColumnFilter', headerTooltip: 'Distinct visitors, counted once each' },
      { colId: 'total', field: 'total', headerName: 'Clicks', width: 110, type: 'numericColumn', filter: 'agNumberColumnFilter' },
      { colId: 'bots', field: 'bots', headerName: 'Bots', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter' },
      { colId: 'mobile', field: 'mobile', headerName: 'Mobile', width: 105, type: 'numericColumn', filter: 'agNumberColumnFilter' },
      { colId: 'desktop', field: 'desktop', headerName: 'Desktop', width: 110, type: 'numericColumn', filter: 'agNumberColumnFilter' },
      {
        colId: 'share', field: 'share', headerName: 'Share', width: 100, type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params: any) => `${params.value || 0}%`,
      },
    ]);
  }

  // ----------------------------------------------------------- the controls

  get groupLabel(): string {
    const found = GROUPS.filter(group => group.key === this.state.groupBy)[0];
    return found ? found.label : 'Group';
  }

  /* One list per field, built here rather than in two passes in the template.
   * A value that is set but no longer in the facet list still has to appear, or
   * changing the window would silently drop the filter it was applied to — but
   * it has to appear in the SAME option the facets will later supply. Rendering
   * it separately means the option is destroyed and rebuilt the moment the
   * facets land, and the browser clears the selection in the gap between the
   * two, which is how a shared report link arrived with its filters empty. */
  optionsFor(key: string): IReportFacet[] {
    const facets = this.facets[key] || [];
    const value = this.state[key];
    if (!value || facets.some(facet => facet.value === value)) { return facets; }
    return [{ value, label: value, total: 0 }].concat(facets);
  }

  /* Keyed by value so the option holding the selection survives the swap. */
  optionKey(index: number, facet: IReportFacet): string {
    return facet.value;
  }

  patch(changes: any): void {
    const queryParams: any = {};
    Object.keys(changes).forEach(key => (queryParams[key] = changes[key] || null));
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  patchField(key: string, value: string): void {
    const changes: any = {};
    changes[key] = value;
    this.patch(changes);
  }

  setWindow(days: number): void {
    this.patch({ days, from: null, to: null });
  }

  setRange(from: string, to: string): void {
    if (!from || !to) { return; }
    this.patch({ from, to, days: null });
  }

  /* The filters restated as a sentence. A report you can read out loud is one
   * you can check, and it is what gets pasted into the message that shares it. */
  get question(): string {
    const audience = this.state.audience === 'bots' ? 'Bot clicks' :
      this.state.audience === 'all' ? 'All clicks' : 'Clicks by people';
    const where = this.activeFilters
      .map(field => `${field.label} is ${this.state[field.key]}`)
      .join(', and ');
    const when = this.customRange
      ? `between ${this.state.from} and ${this.state.to}`
      : `over the last ${this.state.days} days`;
    return `${audience}${where ? ' where ' + where : ''}, grouped by ${this.groupLabel.toLowerCase()}, ${when}.`;
  }

  get activeFilters(): Field[] {
    return FILTERS.filter(field => !!this.state[field.key]);
  }

  get customRange(): boolean {
    return !!(this.state.from && this.state.to);
  }

  reset(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  // ------------------------------------------------------------------ grid

  onGridReady(event: any): void {
    this.gridApi = event.api;
    event.api.sizeColumnsToFit();
  }

  exportCsv(): void {
    if (!this.gridApi) { return; }
    this.gridApi.exportDataAsCsv({ fileName: this.fileName() });
  }

  private fileName(): string {
    const parts = ['clicks', 'by-' + this.state.groupBy];
    this.activeFilters.forEach(field => parts.push(`${field.key}-${this.state[field.key]}`));
    parts.push(this.report ? this.report.range.from : '');
    return parts.filter(Boolean).join('_').replace(/[^a-zA-Z0-9._-]/g, '-') + '.csv';
  }

  share(): void {
    if (!this.isBrowser) { return; }
    this.store.copy(window.location.href);
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDay = (day: string): string => {
  const parts = String(day || '').split('-');
  if (parts.length !== 3) { return day; }
  return `${MONTHS[parseInt(parts[1], 10) - 1] || parts[1]} ${parseInt(parts[2], 10)}`;
};
