import { Component, OnInit , OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription , Subject } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get userId() { return this.user ? this.user._id : ''; }
  get userRole() { return this.user ? this.user.role : 'U'; }
  get userName() { return this.user ? this.user.nickname : ''; }
  get user() { return this._profileService.profile; }
  get isRoot() { return this._route.children.length == 0; }
  get sizeS() { return window?.innerWidth < 768; }

  private subscriptionLoginStatus: Subscription;

  constructor(
    private _profileService: ProfileManagementService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptionLoginStatus?.unsubscribe();
  }
  ngOnInit(): void {
    if(this._route.children.length == 0 && !this.sizeS) {
      this._router.navigate(['./profile'], {replaceUrl: true, relativeTo: this._route});
    }

    this.subscriptionLoginStatus = this._profileService.loginStatusChanged().pipe(takeUntil(this.destroy$)).subscribe(status => {
      if(status == 'notLoggedIn') {
        this._router.navigate(['/community']);
      }
    });

    this._uService.setMeta(this._router.url, {
      title: 'My profile | PromptHealth',
    });
  }
}
