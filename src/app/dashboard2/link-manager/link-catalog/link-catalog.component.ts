import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ILinkRecord } from 'src/app/shared/services/link-manager.service';
import { HEALTH_META, healthMeta } from '../link-health';

export interface ILinkFilters {
  search: string;
  source: string;
  health: string;
  slugType: string;
  sortBy: string;
}

export const emptyFilters = (): ILinkFilters => ({
  search: '',
  source: '',
  health: '',
  slugType: '',
  sortBy: 'stats.clicks',
});

@Component({
  selector: 'app-link-catalog',
  templateUrl: './link-catalog.component.html',
})
export class LinkCatalogComponent {
  @Input() links: ILinkRecord[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Input() isAdmin = false;
  @Input() site = '';

  /* Held locally so typing in the search box does not re-query on every
   * keystroke; the parent only hears about it on Apply, Enter or a select. */
  @Input() set filters(value: ILinkFilters) {
    this.draft = { ...emptyFilters(), ...(value || {}) };
  }

  @Output() apply = new EventEmitter<ILinkFilters>();
  @Output() paginate = new EventEmitter<number>();
  @Output() edit = new EventEmitter<ILinkRecord>();
  @Output() stats = new EventEmitter<ILinkRecord>();
  @Output() remove = new EventEmitter<ILinkRecord>();
  @Output() copy = new EventEmitter<string>();

  readonly SOURCES = ['MANUAL', 'PROFILE', 'BOOKING', 'DISCOVERED', 'CLICK'];
  readonly HEALTH_OPTIONS = HEALTH_META;
  readonly SORTS = [
    { value: 'stats.clicks', label: 'Most clicked' },
    { value: 'createdAt', label: 'Newest' },
    { value: 'lastSeenAt', label: 'Last seen' },
    { value: 'title', label: 'Title' },
  ];

  draft: ILinkFilters = emptyFilters();

  get hasFilters(): boolean {
    return !!(this.draft.search || this.draft.source || this.draft.health);
  }

  submit(): void {
    this.apply.emit({ ...this.draft });
  }

  reset(): void {
    this.draft = emptyFilters();
    this.submit();
  }

  label(link: ILinkRecord): string {
    return link.title || link.hostname || link.destinationUrl;
  }

  tone(link: ILinkRecord): string {
    return healthMeta(link.health && link.health.status).tone;
  }

  statusLabel(link: ILinkRecord): string {
    return healthMeta(link.health && link.health.status).label;
  }

  shortUrl(link: ILinkRecord): string {
    return `${this.site}/out/${link.code}`;
  }

  /* Shown as one line so a row stays readable; the editor is where the four
   * parameters are pulled apart. */
  tagging(link: ILinkRecord): string {
    return [
      link.utmSource && `source=${link.utmSource}`,
      link.utmMedium && `medium=${link.utmMedium}`,
      link.utmCampaign && `campaign=${link.utmCampaign}`,
      link.utmContent && `content=${link.utmContent}`,
    ].filter(Boolean).join(' · ');
  }

  trackById(_index: number, link: ILinkRecord): string {
    return link._id;
  }
}
