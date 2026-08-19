import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { TrackedLinkAdminService, ILinkRecord } from 'src/app/shared/services/tracked-link-admin.service';

@Component({
  selector: 'app-link-manager',
  templateUrl: './link-manager.component.html',
  styleUrls: ['./link-manager.component.scss']
})
export class LinkManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  list: ILinkRecord[] = [];
  total = 0;
  page = 1;
  count = 10;
  loading = false;

  // Analytics
  activeLink: ILinkRecord | null = null;
  analyticsData: any = null;
  analyticsLoading = false;

  // Create/Edit
  showForm = false;
  editing: ILinkRecord | null = null;
  form: any = {
    title: '',
    description: '',
    destinationUrl: '',
    utmSource: 'prompthealth',
    utmMedium: 'social',
    utmCampaign: '',
    utmContent: '',
    slugType: 'CUSTOM',
    code: '',
  };
  saving = false;

  readonly SLUG_TYPES = ['SOCIAL', 'PROFILE_WEBSITE', 'BOOKING', 'ARTICLE', 'EVENT', 'CUSTOM'];
  readonly PLATFORMS = ['instagram', 'youtube', 'tiktok', 'facebook', 'linkedin', 'x', 'bio', 'prompthealth'];

  get totalPages(): number {
    return this.total > 0 ? Math.ceil(this.total / this.count) : 1;
  }

  constructor(
    private service: TrackedLinkAdminService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll({ page: this.page, count: this.count })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loading = false)))
      .subscribe((res: any) => {
        if (res && res.data) {
          this.list = res.data.data || [];
          this.total = res.data.total || 0;
        }
      }, (err) => {
        this.toastr.error('Failed to load links');
      });
  }

  openCreate(): void {
    this.editing = null;
    this.form = { title: '', description: '', destinationUrl: '', utmSource: 'prompthealth', utmMedium: 'social', utmCampaign: '', utmContent: '', slugType: 'CUSTOM', code: '' };
    this.showForm = true;
  }

  openEdit(link: ILinkRecord): void {
    this.editing = link;
    this.form = {
      title: link.title || '',
      description: link.description || '',
      destinationUrl: link.destinationUrl || '',
      utmSource: link.utmSource || 'prompthealth',
      utmMedium: link.utmMedium || 'social',
      utmCampaign: link.utmCampaign || '',
      utmContent: link.utmContent || '',
      slugType: link.slugType || 'CUSTOM',
      code: link.code || '',
    };
    this.showForm = true;
  }

  setPlatform(p: string): void {
    this.form.utmSource = p;
  }

  save(): void {
    if (!this.form.destinationUrl) {
      this.toastr.error('Destination URL is required');
      return;
    }
    this.saving = true;
    let req;
    if (this.editing && this.editing._id) {
      req = this.service.update(this.editing._id, this.form);
    } else {
      req = this.service.create(this.form);
    }
    req.pipe(takeUntil(this.destroy$), finalize(() => (this.saving = false)))
      .subscribe((res: any) => {
        this.toastr.success(this.editing ? 'Link updated' : 'Link created');
        this.showForm = false;
        this.load();
      }, (err) => {
        this.toastr.error(err && err.error && err.error.message ? err.error.message : 'Save failed');
      });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editing = null;
  }

  remove(link: ILinkRecord): void {
    if (!confirm(`Delete link ${link.code}?`)) return;
    this.service.remove(link._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toastr.success('Link deleted');
        this.load();
      }, (err) => {
        this.toastr.error('Delete failed');
      });
  }

  showAnalytics(link: ILinkRecord): void {
    this.activeLink = link;
    this.analyticsLoading = true;
    this.analyticsData = null;
    this.service.analytics(link._id)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.analyticsLoading = false)))
      .subscribe((res: any) => {
        this.analyticsData = (res && res.data) || null;
      }, (err) => {
        this.toastr.error('Failed to load analytics');
      });
  }

  copyLink(link: ILinkRecord): void {
    const url = `https://www.prompthealth.ca/out/${link.code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => this.toastr.success('Copied ' + url));
    } else {
      this.toastr.info(url);
    }
  }

  pageChanged(p: number): void {
    this.page = p;
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
