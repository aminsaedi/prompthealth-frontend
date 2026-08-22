import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ILinkRecord, LinkManagerService } from 'src/app/shared/services/link-manager.service';
import { environment } from 'src/environments/environment';
import { trendConfig } from '../chart/chart-theme';
import { HEALTH_META, healthMeta } from '../link-health';
import { LinkAdminStore, messageOf } from '../link-admin.store';

/* A flat row per link. The grid sorts, filters and exports whatever it is
 * handed, so everything it needs to compare is spelled out here as a plain
 * value rather than reached for through the record at render time. */
interface Row {
  id: string;
  title: string;
  destinationUrl: string;
  hostname: string;
  path: string;
  source: string;
  slugType: string;
  campaign: string;
  content: string;
  code: string;
  shortUrl: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  statusCode: number;
  clicks: number;
  humans: number;
  bots: number;
  lastClickAt: string;
  foundOn: string;
  managed: string;
  active: string;
  createdAt: string;
  record: ILinkRecord;
}

@Component({
  selector: 'app-link-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  /* The grid builds its cells with innerHTML, which never carries a
   * component's scoping attribute, so these styles are global and namespaced
   * by the section's root class instead. */
  encapsulation: ViewEncapsulation.None,
})
export class ExplorerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly SITE = environment.config.FRONTEND_BASE;
  readonly HEALTH_OPTIONS = HEALTH_META;
  readonly isBrowser: boolean;

  rows: Row[] = [];
  loading = false;
  total = 0;
  search = '';

  private gridApi: any = null;
  private allRows: Row[] = [];

  /* Editor and analytics are both slide-overs rather than pages, so the row a
   * decision is about stays visible behind them. */
  editing: ILinkRecord = null;
  editorOpen = false;
  saving = false;

  active: ILinkRecord = null;
  analytics: any = null;
  analyticsLoading = false;
  analyticsChart: ChartConfiguration = null;

  gridOptions: any;
  columnDefs: any[];
  defaultColDef: any = {
    filter: true,
    floatingFilter: true,
    resizable: true,
    sortable: true,
    tooltipValueGetter: (params: any) => params.value,
  };

  constructor(
    public store: LinkAdminStore,
    private service: LinkManagerService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.columnDefs = this.buildColumns();
    this.gridOptions = {
      animateRows: false,
      pagination: true,
      paginationPageSize: 25,
      rowHeight: 44,
      headerHeight: 40,
      floatingFiltersHeight: 38,
      suppressCellSelection: true,
      overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">No links match these filters.</span>',
      /* Without this the grid says "no links match" while it is still waiting
       * for the first page, which is an answer rather than a wait. */
      overlayLoadingTemplate:
        '<span class="ag-overlay-loading-center la-overlay">' +
        '<span class="la-spinner"></span><span>Loading links…</span></span>',
    };
  }

  ngOnInit(): void {
    this.store.linksLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.loading = loading;
      this.syncOverlay();
    });
    this.store.linksTotal$.pipe(takeUntil(this.destroy$)).subscribe(total => (this.total = total));
    this.store.links$.pipe(takeUntil(this.destroy$)).subscribe(links => {
      this.allRows = (links || []).map(link => toRow(link, this.SITE));
      this.rows = this.allRows;
      this.applyQuery(this.route.snapshot.queryParams);
      this.syncOverlay();
    });
    this.store.loadLinks();

    /* Both the health tiles on the overview and the New link button in the
     * header arrive here as a query, so those controls cannot depend on the
     * state of a panel that may not be mounted. */
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => this.applyQuery(params));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyQuery(params: any): void {
    const health = params && params.health;
    this.rows = health ? this.allRows.filter(row => row.status === String(health).toUpperCase()) : this.allRows;

    const edit = params && params.edit;
    if (edit === 'new' && !this.editorOpen) {
      this.openCreate();
    } else if (edit && edit !== 'new' && (!this.editing || this.editing._id !== edit)) {
      const found = this.allRows.filter(row => row.id === edit)[0];
      if (found) { this.openEdit(found.record); }
    }
  }

  get healthFilter(): string {
    return this.route.snapshot.queryParams.health || '';
  }

  setHealthFilter(status: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { health: status || null },
      queryParamsHandling: 'merge',
    });
  }

  // ------------------------------------------------------------------ grid

  onGridReady(event: any): void {
    this.gridApi = event.api;
    event.api.sizeColumnsToFit();
    this.syncOverlay();
  }

  /* The grid owns the space where its own answer goes, so it is the grid that
   * has to say which of the three states it is in. */
  private syncOverlay(): void {
    if (!this.gridApi) { return; }
    if (this.loading) { this.gridApi.showLoadingOverlay(); }
    else if (!this.rows.length) { this.gridApi.showNoRowsOverlay(); }
    else { this.gridApi.hideOverlay(); }
  }

  /* Tall enough for the page it is showing and no taller. A fixed height left
   * four hundred pixels of empty grid under a catalog of five links. */
  get gridHeight(): number {
    const shown = Math.min(this.rows.length || 0, this.gridOptions.paginationPageSize);
    const rows = Math.max(shown, 4);
    return Math.min(620, HEADER + FLOATING_FILTERS + rows * ROW + PAGING + SCROLLBAR);
  }

  onSearch(term: string): void {
    this.search = term;
    if (this.gridApi) { this.gridApi.setQuickFilter(term); }
  }

  clearFilters(): void {
    this.search = '';
    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      this.gridApi.setQuickFilter('');
    }
    this.setHealthFilter('');
  }

  /* Exports what is on screen, filters and sort included — a report someone
   * built by narrowing the grid is the thing they want to take away. */
  exportCsv(): void {
    if (!this.gridApi) { return; }
    this.gridApi.exportDataAsCsv({
      fileName: `links-${new Date().toISOString().slice(0, 10)}.csv`,
      columnKeys: EXPORT_COLUMNS,
    });
  }

  onCellClicked(event: any): void {
    if (event.colDef.colId !== 'actions') { return; }
    const target = event.event && (event.event.target as HTMLElement);
    const action = target && target.closest('[data-action]');
    if (!action) { return; }

    const link: ILinkRecord = event.data.record;
    switch (action.getAttribute('data-action')) {
      case 'stats': this.openAnalytics(link); break;
      case 'edit': this.openEdit(link); break;
      case 'copy': this.store.copy(event.data.shortUrl); break;
      case 'delete': this.remove(link); break;
    }
  }

  private buildColumns(): any[] {
    return [
      { colId: 'title', field: 'title', headerName: 'Link', flex: 2, minWidth: 200, cellRenderer: titleCell },
      { colId: 'hostname', field: 'hostname', headerName: 'Destination', flex: 1, minWidth: 150 },
      { colId: 'path', field: 'path', headerName: 'Path', flex: 1, minWidth: 140, hide: true },
      { colId: 'source', field: 'source', headerName: 'Source', width: 130, minWidth: 130 },
      { colId: 'slugType', field: 'slugType', headerName: 'Type', width: 140, minWidth: 140 },
      { colId: 'campaign', field: 'campaign', headerName: 'Campaign', width: 160, minWidth: 160 },
      { colId: 'content', field: 'content', headerName: 'Content', width: 140, minWidth: 140, hide: true },
      { colId: 'code', field: 'code', headerName: 'Short code', width: 150, minWidth: 150 },
      {
        colId: 'statusLabel', field: 'statusLabel', headerName: 'Health', width: 170, minWidth: 170,
        cellRenderer: (params: any) =>
          `<span class="pill tone-${params.data.statusTone}">${escapeHtml(params.value)}` +
          `${params.data.statusCode ? ' · ' + params.data.statusCode : ''}</span>`,
      },
      { colId: 'clicks', field: 'clicks', headerName: 'Clicks', width: 125, minWidth: 125, type: 'numericColumn', filter: 'agNumberColumnFilter' },
      { colId: 'humans', field: 'humans', headerName: 'People', width: 130, minWidth: 130, type: 'numericColumn', filter: 'agNumberColumnFilter' },
      { colId: 'bots', field: 'bots', headerName: 'Bots', width: 115, minWidth: 115, type: 'numericColumn', filter: 'agNumberColumnFilter', hide: true },
      { colId: 'lastClickAt', field: 'lastClickAt', headerName: 'Last click', width: 155, minWidth: 155, valueFormatter: dateCell },
      { colId: 'createdAt', field: 'createdAt', headerName: 'Added', width: 140, minWidth: 140, valueFormatter: dateCell, hide: true },
      { colId: 'foundOn', field: 'foundOn', headerName: 'Found on', flex: 1, minWidth: 150, hide: true },
      { colId: 'active', field: 'active', headerName: 'Active', width: 120, minWidth: 120, hide: true },
      {
        colId: 'actions', headerName: '', width: 160, minWidth: 160, maxWidth: 160, pinned: 'right',
        sortable: false, filter: false, floatingFilter: false, resizable: false, suppressMenu: true,
        cellRenderer: actionsCell,
      },
    ];
  }

  // ---------------------------------------------------------------- editor

  openCreate(): void {
    this.editing = null;
    this.editorOpen = true;
  }

  openEdit(link: ILinkRecord): void {
    this.editing = link;
    this.editorOpen = true;
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.editing = null;
    if (this.route.snapshot.queryParams.edit) {
      this.router.navigate([], { relativeTo: this.route, queryParams: { edit: null }, queryParamsHandling: 'merge' });
    }
  }

  save(payload: any): void {
    this.saving = true;
    const editingId = this.editing && this.editing._id;
    this.store.saveLink(editingId, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.saving = false)))
      .subscribe(
        () => {
          this.store.success(editingId ? 'Link updated' : 'Link created');
          this.closeEditor();
          this.store.loadLinks(true);
          this.store.loadDashboard();
        },
        (err: any) => this.store.failure(err, messageOf(err, 'Could not save the link')),
      );
  }

  remove(link: ILinkRecord): void {
    if (!confirm(`Delete ${link.code || link.hostname}? Any /out/${link.code} link stops working.`)) { return; }
    this.store.removeLink(link);
  }

  // ------------------------------------------------------------- analytics

  openAnalytics(link: ILinkRecord): void {
    this.active = link;
    this.analytics = null;
    this.analyticsChart = null;
    this.analyticsLoading = true;
    this.service.analytics(link._id, { days: this.store.days })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.analyticsLoading = false)))
      .subscribe(
        (res: any) => {
          this.analytics = (res && res.data) || null;
          const byDay = (this.analytics && this.analytics.byDay) || [];
          this.analyticsChart = byDay.length
            ? trendConfig(
                byDay.map((row: any) => row.day),
                byDay.map((row: any) => row.humans || 0),
                byDay.map((row: any) => row.bots || 0),
              )
            : null;
        },
        () => this.store.failure(null, 'Could not load analytics'),
      );
  }

  closeAnalytics(): void {
    this.active = null;
    this.analytics = null;
    this.analyticsChart = null;
  }

  label(link: ILinkRecord): string {
    return (link && (link.title || link.hostname || link.destinationUrl)) || '';
  }

  reportOn(link: ILinkRecord): void {
    this.router.navigate(['/link-admin/reports'], { queryParams: { linkId: link._id, groupBy: 'day' } });
  }
}

/* The grid's own furniture, in the sizes it was configured with above. */
const HEADER = 40;
const FLOATING_FILTERS = 38;
const ROW = 44;
const PAGING = 50;
/* The columns are wider than most windows, so the grid scrolls sideways and
 * that bar needs a line of its own or it sits on top of the last row. */
const SCROLLBAR = 15;

const EXPORT_COLUMNS = [
  'title', 'hostname', 'path', 'source', 'slugType', 'campaign', 'content',
  'code', 'statusLabel', 'clicks', 'humans', 'bots', 'lastClickAt', 'createdAt', 'foundOn', 'active',
];

const escapeHtml = (value: string): string =>
  String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const titleCell = (params: any): string =>
  `<span class="lx-title">${escapeHtml(params.value || params.data.hostname)}</span>` +
  `<span class="lx-url">${escapeHtml(params.data.destinationUrl)}</span>`;

/* The grid writes its cells as HTML, so the duotone icon spans the iconPh
 * directive would normally add have to be written out here by hand. */
const ICON = (name: string): string =>
  `<i class="icon-${name}" aria-hidden="true"><span class="path1"></span><span class="path2"></span></i>`;

const ACTIONS: { action: string; icon: string; label: string }[] = [
  { action: 'stats', icon: 'chart-line', label: 'Traffic for this link' },
  { action: 'copy', icon: 'copy', label: 'Copy the short link' },
  { action: 'edit', icon: 'edit', label: 'Edit this link' },
  { action: 'delete', icon: 'trash', label: 'Delete this link' },
];

const actionsCell = (): string =>
  '<span class="lx-actions">' +
  ACTIONS.map(item =>
    `<button type="button" class="btn-icon" data-action="${item.action}" ` +
    `title="${item.label}" aria-label="${item.label}">${ICON(item.icon)}</button>`).join('') +
  '</span>';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateCell = (params: any): string => {
  const raw = params.value;
  if (!raw) { return '—'; }
  const parts = String(raw).slice(0, 10).split('-');
  if (parts.length !== 3) { return String(raw); }
  return `${MONTHS[parseInt(parts[1], 10) - 1] || parts[1]} ${parseInt(parts[2], 10)}, ${parts[0]}`;
};

const pathOf = (url: string): string => {
  const match = /^https?:\/\/[^/]+(\/[^?#]*)?/.exec(url || '');
  return (match && match[1]) || '/';
};

const toRow = (link: ILinkRecord, site: string): Row => {
  const meta = healthMeta(link.health && link.health.status);
  const stats = link.stats || {};
  return {
    id: link._id,
    title: link.title || link.hostname || link.destinationUrl || '',
    destinationUrl: link.destinationUrl || '',
    hostname: link.hostname || '',
    path: pathOf(link.destinationUrl),
    source: titleCase(link.source),
    slugType: titleCase(link.slugType),
    campaign: link.utmCampaign || '',
    content: link.utmContent || '',
    code: link.code || '',
    shortUrl: link.code ? `${site}/out/${link.code}` : link.destinationUrl,
    status: (link.health && link.health.status) || 'UNKNOWN',
    statusLabel: meta.label,
    statusTone: meta.tone,
    statusCode: (link.health && link.health.statusCode) || 0,
    clicks: stats.clicks || 0,
    humans: stats.humanClicks || 0,
    bots: stats.botClicks || 0,
    lastClickAt: stats.lastClickAt || '',
    foundOn: link.foundOn || '',
    managed: link.managed ? 'Managed' : 'Plain',
    active: link.isActive === false ? 'Paused' : 'Active',
    createdAt: link.createdAt || '',
    record: link,
  };
};

const titleCase = (value: string): string =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ') : '';
