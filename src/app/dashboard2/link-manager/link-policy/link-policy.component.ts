import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ILinkPolicyRecord } from 'src/app/shared/services/link-manager.service';

@Component({
  selector: 'app-link-policy',
  templateUrl: './link-policy.component.html',
})
export class LinkPolicyComponent implements OnChanges {
  @Input() policy: ILinkPolicyRecord = null;
  @Input() loading = false;
  @Input() saving = false;

  @Output() save = new EventEmitter<ILinkPolicyRecord>();

  /* Edited locally so a half-typed rule never becomes the live policy, and so
   * cancelling is just navigating away. */
  draft: ILinkPolicyRecord = null;
  internalHostsText = '';
  excludeHostsText = '';
  patternError = '';

  ngOnChanges(): void {
    this.patternError = '';
    if (!this.policy) { this.draft = null; return; }

    this.draft = {
      ...this.policy,
      routeRules: (this.policy.routeRules || []).map(rule => ({ ...rule })),
    };
    this.internalHostsText = (this.policy.internalHosts || []).join('\n');
    this.excludeHostsText = (this.policy.excludeHosts || []).join('\n');
  }

  addRule(): void {
    if (!this.draft) { return; }
    this.draft.routeRules = [...(this.draft.routeRules || []), { pattern: '', campaign: '', label: '' }];
  }

  removeRule(index: number): void {
    this.draft.routeRules = this.draft.routeRules.filter((_, i) => i !== index);
    this.patternError = '';
  }

  submit(): void {
    if (!this.draft) { return; }

    /* A rule needs both halves to do anything, so half-filled rows are dropped
     * rather than saved and silently ignored by the tagger. */
    const rules = (this.draft.routeRules || []).filter(rule => rule.pattern && rule.campaign);
    const invalid = rules.find(rule => !this.isValidPattern(rule.pattern));
    if (invalid) {
      this.patternError = `"${invalid.pattern}" is not a valid pattern. Check the brackets and slashes.`;
      return;
    }
    this.patternError = '';

    this.save.emit({
      ...this.draft,
      routeRules: rules,
      internalHosts: this.splitLines(this.internalHostsText),
      excludeHosts: this.splitLines(this.excludeHostsText),
    });
  }

  isValidPattern(pattern: string): boolean {
    if (!pattern) { return true; }
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

  trackByIndex(index: number): number {
    return index;
  }
}
