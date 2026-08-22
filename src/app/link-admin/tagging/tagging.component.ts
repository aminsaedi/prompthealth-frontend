import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ILinkPolicyRecord } from 'src/app/shared/services/link-manager.service';
import { LinkAdminStore } from '../link-admin.store';

/* One switch decides what every outbound link on the site is tagged with, so
 * it gets a page of its own rather than a panel someone has to scroll past. */
@Component({
  selector: 'app-link-tagging',
  templateUrl: './tagging.component.html',
})
export class TaggingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  policy: ILinkPolicyRecord = null;
  loading = false;
  saving = false;

  constructor(public store: LinkAdminStore) {}

  ngOnInit(): void {
    this.store.policy$.pipe(takeUntil(this.destroy$)).subscribe(policy => (this.policy = policy));
    this.store.policyLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => (this.loading = loading));
    this.store.loadPolicy();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(payload: ILinkPolicyRecord): void {
    this.saving = true;
    this.store.savePolicy(payload, () => (this.saving = false));
  }
}
