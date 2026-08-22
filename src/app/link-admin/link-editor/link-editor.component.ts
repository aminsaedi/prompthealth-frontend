import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ILinkRecord } from 'src/app/shared/services/link-manager.service';
import { utmSafe } from 'src/app/shared/services/outbound-link.service';

export type UtmField = 'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmContent';

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
  selector: 'app-link-editor',
  templateUrl: './link-editor.component.html',
})
export class LinkEditorComponent implements OnChanges {
  readonly SLUG_TYPES = ['SOCIAL', 'PROFILE_WEBSITE', 'BOOKING', 'ARTICLE', 'EVENT', 'CUSTOM'];

  /* null means a new link; a record means editing that one. */
  @Input() link: ILinkRecord = null;
  @Input() saving = false;
  @Input() site = '';

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: Partial<ILinkRecord> = EMPTY_FORM();
  destinationError = '';

  ngOnChanges(): void {
    this.destinationError = '';
    this.form = this.link ? this.formOf(this.link) : EMPTY_FORM();
  }

  get editing(): boolean {
    return !!(this.link && this.link._id);
  }

  private formOf(link: ILinkRecord): Partial<ILinkRecord> {
    return {
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
    };
  }

  submit(): void {
    if (!this.form.destinationUrl) {
      this.destinationError = 'Enter the address this link should send people to.';
      return;
    }
    this.destinationError = '';
    this.save.emit(this.strip(this.form));
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

  /* What the server will actually store and send, shown next to the field so a
   * value that gets rewritten is visible before it is saved rather than after. */
  utmPreview(field: UtmField): string {
    const raw = (this.form as any)[field] || '';
    const safe = utmSafe(raw, field === 'utmSource' || field === 'utmMedium' ? 50 : 100);
    if (!raw || safe === raw) { return ''; }
    return safe ? `will be sent as ${safe}` : 'unusable, will be omitted';
  }

  utmDropped(field: UtmField): boolean {
    const raw = (this.form as any)[field] || '';
    return !!raw && !utmSafe(raw, field === 'utmSource' || field === 'utmMedium' ? 50 : 100);
  }

  get shortUrl(): string {
    return this.form.code ? `${this.site}/out/${this.form.code}` : '';
  }
}
