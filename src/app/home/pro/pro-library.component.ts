import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IProLibraryItem, PRO_KIND_LABELS, ProService } from 'src/app/shared/services/pro.service';
import { signedIn } from './pro-member';

/*
 * The members' library: every drop Hedieh has published, newest first, so a
 * member who joins in month three has months one and two as well.
 *
 * Everyone else sees the locked list (Amin, 2026-10-05): the date, the kind
 * and the title of each drop, and the way in. The API never sends anyone but
 * a member the summary, the video or the body.
 */
@Component({
  selector: 'app-pro-library',
  templateUrl: './pro-library.component.html',
  styleUrls: ['./pro-library.component.scss'],
})
export class ProLibraryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public items: IProLibraryItem[] = null;
  public isMember = false;
  public isSignedIn = false;
  public loadFailed = false;
  public readonly kinds = PRO_KIND_LABELS;

  constructor(
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _pro: ProService,
  ) {}

  ngOnInit(): void {
    this._uService.setMeta('/pro/library', {
      title: "Members' Library | PromptHealth Pro",
      description: 'Every PromptHealth Pro video idea, post idea, trend alert and live session, for members.',
      robots: 'noindex, follow',
    });
    if (this._uService.isServer) { return; }
    signedIn(this._profileService).pipe(takeUntil(this.destroy$)).subscribe(isIn => {
      this.isSignedIn = isIn;
      this.fetch();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retry(): void {
    this.loadFailed = false;
    this.fetch();
  }

  private fetch(): void {
    this._pro.library().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.isMember = !!(res && res.isMember);
      this.items = res && Array.isArray(res.items) ? res.items : [];
    }, () => this.loadFailed = true);
  }
}
