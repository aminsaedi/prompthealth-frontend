import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { AccountTypeService } from 'src/app/shared/services/account-type.service';
import { BehaviorService } from 'src/app/shared/services/behavior.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SWITCH_ACCOUNT } from 'src/app/shared/free-membership-copy';

/*
 * Switch to a practitioner account (Hedieh's brief of 2026-10-22, step 6),
 * for a practitioner or clinic who signed up as a patient. Signing up again
 * fails, because the address is already registered, and a patient account is
 * never listed. One choice, practitioner or clinic, and one confirmation;
 * the server sets the account up as a new provider would be (Basic plan,
 * awaiting approval), and the visitor goes on to the profile setup a new
 * provider lands on after signing up.
 */
@Component({
  selector: 'app-switch-account',
  templateUrl: './switch-account.component.html',
  styleUrls: ['./switch-account.component.scss'],
})
export class SwitchAccountComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public readonly copy = SWITCH_ACCOUNT;
  public role: 'SP' | 'C' = null;
  public isSending = false;
  public errorMessage = '';

  constructor(
    private _profileService: ProfileManagementService,
    private _accountType: AccountTypeService,
    private _bs: BehaviorService,
    private _uService: UniversalService,
    private _router: Router,
  ) {}

  get user() { return this._profileService.profile; }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Switch to a practitioner account | PromptHealth',
    });
    /* For patient accounts only; anyone else has nothing to switch. */
    if (this.user && !this.user.isU) {
      this._router.navigate(['/dashboard/profile'], { replaceUrl: true });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  choose(role: 'SP' | 'C'): void {
    this.role = role;
    this.errorMessage = '';
  }

  cancel(): void {
    this._router.navigate(['/dashboard/profile']);
  }

  confirm(): void {
    if (!this.role || this.isSending) { return; }
    this.isSending = true;
    this.errorMessage = '';
    this._accountType.switchToProvider(this.role).pipe(takeUntil(this.destroy$)).subscribe(async res => {
      const roles = res.roles || this.role;
      this.storeRole(roles);
      this._profileService.update({ roles } as any);
      await this._profileService.reload();
      this.isSending = false;
      /* Where a new provider lands after signing up (form-auth). */
      this._router.navigateByUrl('/dashboard/register-practitioner');
    }, (error: { message: string }) => {
      this.isSending = false;
      this.errorMessage = (error && error.message) || this.copy.error;
    });
  }

  /* The stored login names the role too, and the profile setup's guard reads
   * it from there. */
  private storeRole(roles: string): void {
    if (!this._uService.isBrowser) { return; }
    const ls = this._uService.localStorage;
    ls.setItem('roles', roles);
    try {
      const user = JSON.parse(ls.getItem('user') || 'null');
      if (user) {
        user.roles = roles;
        ls.setItem('user', JSON.stringify(user));
        this._bs.setUserData(user);
      }
    } catch (e) {
      /* An unreadable stored login is replaced at the next sign-in. */
    }
  }
}
