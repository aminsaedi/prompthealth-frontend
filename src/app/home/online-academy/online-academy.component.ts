import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { IResponseData } from "src/app/models/response-data";
import { SharedService } from "src/app/shared/services/shared.service";
import { UniversalService } from "src/app/shared/services/universal.service";
import { LoginStatusType, ProfileManagementService } from "src/app/shared/services/profile-management.service";

/*
 * The PromptHealth Academy: short video guides, free to anyone with a
 * practitioner, clinic or partner profile (Hedieh, 2026-09-26). The videos are
 * unlisted on YouTube, and the API hands them only to a signed-in member
 * (ph-backend services/content-access.js), so this page asks for them only
 * once it knows the reader is one.
 *
 * 'checking' while the browser finds out who is signed in. The server always
 * renders 'guest', which is also what a crawler should see: the invitation,
 * not the videos.
 */
type AcademyView = "checking" | "guest" | "patient" | "member";

export interface IAcademyVideo {
  id: string;
  videoId: string;
  title: string;
}

/* An academy item's body is the editor's YouTube embed. */
const EMBED = /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,20})/;

@Component({
  selector: "app-online-academy",
  templateUrl: "./online-academy.component.html",
  styleUrls: ["./online-academy.component.scss"],
})
export class OnlineAcademyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public view: AcademyView = "checking";
  public videos: IAcademyVideo[] = null;
  public loadFailed = false;
  private loading = false;

  /* Back here after signing in. */
  public readonly loginQuery = { next: "/online-academy" };

  constructor(
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta("/online-academy", {
      title: "PromptHealth Academy | Free Video Guides for Practitioners",
      description: "Short video guides from PromptHealth on social media, content, Google Business Profile and SEO, free for practitioners with a PromptHealth profile.",
      robots: "index, follow",
    });

    if (this._uService.isServer) {
      this.view = "guest";
      return;
    }
    this.onLoginStatus(this._profileService.loginStatus);
    this._profileService.loginStatusChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => this.onLoginStatus(status));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retry(): void {
    this.loadFailed = false;
    this.fetch();
  }

  private onLoginStatus(status: LoginStatusType): void {
    if (status === "notChecked" || status === "loggingIn") {
      this.view = "checking";
      return;
    }
    const user = this._profileService.profile;
    if (status !== "loggedIn" || !user) {
      this.view = "guest";
      this.videos = null;
      return;
    }
    if (user.isU) {
      this.view = "patient";
      this.videos = null;
      return;
    }
    this.view = "member";
    if (!this.videos) { this.fetch(); }
  }

  /* Oldest first: the order they were published in is the order Hedieh gave
   * them, a course rather than a news feed. */
  private fetch(): void {
    if (this.loading) { return; }
    this.loading = true;
    this._sharedService.get("note/get-academy?count=100&order=1")
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: IResponseData) => {
        this.loading = false;
        const items: any[] = res && res.statusCode === 200 && res.data && Array.isArray(res.data.data) ? res.data.data : null;
        if (!items) {
          this.loadFailed = true;
          return;
        }
        this.videos = items
          .map(item => {
            const match = EMBED.exec(String(item.description || ""));
            return match ? { id: String(item._id), videoId: match[1], title: String(item.title || "") } : null;
          })
          .filter(Boolean);
      }, () => {
        this.loading = false;
        this.loadFailed = true;
      });
  }
}
