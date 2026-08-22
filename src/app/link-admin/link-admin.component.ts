import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { LinkAdminStore } from './link-admin.store';
import { IconName } from 'src/app/models/icon-ph';

interface Section {
  path: string;
  label: string;
  icon: IconName;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-link-admin',
  templateUrl: './link-admin.component.html',
  styleUrls: ['./link-admin.component.scss', './loading/loading.component.scss'],
  /* Encapsulation is off so this one stylesheet can dress the four pages and
   * their presentational children. Every rule is nested under .link-admin, so
   * nothing here reaches another page. */
  encapsulation: ViewEncapsulation.None,
})
export class LinkAdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly WINDOWS = [7, 30, 90, 365];

  readonly SECTIONS: Section[] = [
    { path: 'overview', label: 'Overview', icon: 'dashboard' },
    { path: 'links', label: 'Links', icon: 'external-link' },
    { path: 'reports', label: 'Reports', icon: 'barchart' },
    { path: 'tagging', label: 'Tagging', icon: 'tag', adminOnly: true },
  ];

  days = 30;
  running = '';

  constructor(
    public store: LinkAdminStore,
    private router: Router,
    private universal: UniversalService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  get isAdmin(): boolean { return this.store.isAdmin; }

  /* The window scopes figures, so it belongs on the pages that show figures.
   * The report builder carries its own range alongside its filters, and the
   * policy editor has no figures for it to act on. */
  get showWindow(): boolean {
    const url = this.router.url;
    return url.indexOf('/link-admin/reports') !== 0 && url.indexOf('/link-admin/tagging') !== 0;
  }

  get sections(): Section[] {
    return this.SECTIONS.filter(section => !section.adminOnly || this.isAdmin);
  }

  ngOnInit(): void {
    this.store.days$.pipe(takeUntil(this.destroy$)).subscribe(days => (this.days = days));
    this.store.running$.pipe(takeUntil(this.destroy$)).subscribe(running => (this.running = running));
    this.store.loadDashboard();

    this.universal.setMeta(this.router.url, { title: 'Link manager | PromptHealth' });

    if (isPlatformBrowser(this.platformId)) { this.loadGridStyles(); }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* The grid's own stylesheet is fetched here rather than bundled globally: it
   * is a hundred kilobytes that only this section needs, and every other page
   * on the site would otherwise pay for it. */
  private loadGridStyles(): void {
    ['ag-grid.min.css', 'ag-theme-alpine.min.css'].forEach(file => {
      const href = `/assets/ag-grid/${file}`;
      if (document.querySelector(`link[href="${href}"]`)) { return; }
      const tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = href;
      document.head.appendChild(tag);
    });
  }

  setDays(days: number): void {
    this.store.setDays(days);
  }

  /* Deep-linked rather than a flag on a panel that may not be on screen: the
   * button lands on the catalog with the editor already open, from wherever it
   * was pressed, and the same address can be shared or bookmarked. */
  newLink(): void {
    this.router.navigate(['/link-admin/links'], { queryParams: { edit: 'new' } });
  }

  checkHealth(): void { this.store.checkHealth(); }
  discover(): void { this.store.discover(); }
}
