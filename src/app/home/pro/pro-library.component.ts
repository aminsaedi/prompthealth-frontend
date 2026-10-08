import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IProLibrary, PRO_KIND_LABELS, ProService } from 'src/app/shared/services/pro.service';
import { signedIn } from './pro-member';

/*
 * The members' library (Hedieh's brief, 2026-10-07).
 *
 * Weeks: the evergreen sequence. Every member starts at Week 1 the day they
 * join and unlocks a new week every 7 days, so the library shows each member
 * only the weeks they have reached, by number, never the back catalogue at
 * once. "Live & Updates": trend alerts, the monthly update and live session
 * recordings, which every member gets, plus the next live training and its
 * link. Everyone else sees the locked list of weeks; the API never sends
 * them the content.
 */
@Component({
  selector: 'app-pro-library',
  templateUrl: './pro-library.component.html',
  styleUrls: ['./pro-library.component.scss'],
})
export class ProLibraryComponent implements OnInit, OnDestroy {

  /* Angular 9's date pipe takes only an offset such as -0800 and silently
   * ignores a zone name, which printed the reader's own clock with "Pacific"
   * after it. Intl knows the zone, daylight time included. */
  get liveSessionLabel(): string {
    const at = this.library && this.library.liveSession && this.library.liveSession.at;
    if (!at) { return ''; }
    const when = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Vancouver', weekday: 'long', month: 'long', day: 'numeric',
      year: 'numeric', hour: 'numeric', minute: '2-digit',
    }).format(new Date(at));
    return when.replace(' at ', ', ') + ' Pacific';
  }
  private destroy$ = new Subject<void>();

  public library: IProLibrary = null;
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
      description: 'Your PromptHealth Pro weeks, trend alerts, monthly updates and live training, for members.',
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
      this.library = res || { isMember: false, weeksAvailable: 0, weeks: [], updates: [] };
    }, () => this.loadFailed = true);
  }
}
