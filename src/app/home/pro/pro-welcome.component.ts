import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ProService } from 'src/app/shared/services/pro.service';
import { WELCOME } from './pro-copy';
import { signedIn } from './pro-member';

/*
 * Where Stripe sends a member after paying (12.2). It also asks the API to
 * confirm the checkout, so the library opens at once rather than when the
 * webhook arrives; the welcome email and the rest still happen exactly once,
 * whichever of the two gets there first (ph-backend services/pro.js).
 */
@Component({
  selector: 'app-pro-welcome',
  template: `
    <section class="bg-lightyellow py-80p py-md-100p">
      <div class="container text-center">
        <h1 class="h3 h2-md text-primary-dark mb-20p">{{ copy.heading }}</h1>
        <p class="subtitle1 text-label mx-auto mb-30p" style="max-width: 640px">{{ copy.text }}</p>
        <a routerLink="/pro/library" class="btn btn-primary">{{ copy.button }}</a>
      </div>
    </section>
  `,
})
export class ProWelcomeComponent implements OnInit {
  public readonly copy = WELCOME;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _pro: ProService,
  ) {}

  ngOnInit(): void {
    this._uService.setMeta('/pro/welcome', {
      title: 'Welcome to PromptHealth Pro',
      description: 'Your PromptHealth Pro membership.',
      robots: 'noindex, nofollow',
    });
    if (this._uService.isServer) { return; }
    const sessionId = this._route.snapshot.queryParamMap.get('session_id') || '';
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) { return; }
    signedIn(this._profileService).subscribe(isIn => {
      if (!isIn) { return; }
      this._pro.confirm(sessionId).subscribe(() => {}, () => {});
      /* The session id has done its job; keep it out of history and shares. */
      this._router.navigate([], { relativeTo: this._route, queryParams: {}, replaceUrl: true });
    });
  }
}
