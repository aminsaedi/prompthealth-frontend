import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { SocialNotification } from 'src/app/models/notification';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  get doneInitNotification() { return this._socialService.doneInitNotification; }
  get notifications(): SocialNotification[] { return this._socialService.doneInitNotification ? this._socialService.notifications : []; }

  public isUploading = false;
  private subscriptionLoginStatus: Subscription;

  constructor(
    private _router: Router,
    private _location: Location,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnDestroy() {
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
  }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Notifications | PromptHealth Community'
    });

    this._profileService.loginStatusChanged().subscribe(status => {
      if(status == 'notLoggedIn') {
        this._router.navigate(['/community/feed'], {replaceUrl: true});
      }
    });
  }

  goback() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      this._router.navigate(['/community/feed']);
    } else {
      this._location.back();
    }
  }

  archiveAllNotifications() {
    this.isUploading = true;
    this._sharedService.post(null, 'notification/clear-all').subscribe((res: IResponseData) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this._socialService.removeNotificationsAll();
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again');
      }
    }, error => {
      this.isUploading = false;
      console.log(error);
      this._toastr.error('Something went wrong');
    })
  }
}

