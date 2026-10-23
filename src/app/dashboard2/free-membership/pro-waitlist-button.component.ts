import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IProError, ProService } from 'src/app/shared/services/pro.service';
import { PRO_WAITLIST } from 'src/app/shared/free-membership-copy';

/*
 * Join the Pro waitlist, for a signed-in practitioner or clinic that is not a
 * dentist (Hedieh's brief of 2026-10-22, step 3). The server adds the
 * existing Mailchimp tag "Pro waitlist". Once joined, the button gives way to
 * her sentence, here and in every other waitlist button on the page.
 */
@Component({
  selector: 'pro-waitlist-button',
  template: `
    <p *ngIf="joined" class="pro-waitlist__joined mb-0" role="status">{{ copy.joined }}</p>
    <ng-container *ngIf="!joined">
      <button type="button" [class]="buttonClass" [disabled]="isSending" (click)="join()">{{ copy.button }}</button>
      <p *ngIf="errorMessage" class="pro-waitlist__error mt-10p mb-0" role="alert">{{ errorMessage }}</p>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }
    .pro-waitlist__joined { font-size: 15px; line-height: 22px; font-weight: 600; color: #12339E; }
    .pro-waitlist__error { font-size: 14px; line-height: 20px; color: #BB1313; }
  `],
})
export class ProWaitlistButtonComponent implements OnDestroy {
  @Input() buttonClass = 'btn btn-primary';

  public readonly copy = PRO_WAITLIST;
  public isSending = false;
  public errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private _pro: ProService) {}

  get joined(): boolean { return this._pro.waitlistJoined; }

  join(): void {
    if (this.isSending) { return; }
    this.isSending = true;
    this.errorMessage = '';
    this._pro.joinWaitlist().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.isSending = false;
      if (!res || !res.joined) { this.errorMessage = this.copy.error; }
    }, (error: IProError) => {
      this.isSending = false;
      this.errorMessage = (error && error.message) || this.copy.error;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
