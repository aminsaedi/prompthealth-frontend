import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocialNotification } from 'src/app/models/notification';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SocialService } from '../../social/social.service';

@Component({
  selector: 'card-notification',
  templateUrl: './card-notification.component.html',
  styleUrls: ['./card-notification.component.scss']
})
export class CardNotificationComponent implements OnInit {

  @Input() option: INotificationsOption = {};

  get doneInitNotification() {
    return this._socialService.doneInitNotification;
  }
  get notifications(): SocialNotification[] {
    return this._socialService.doneInitNotification ? 
      this._option.showOnly > 0 ? 
        this._socialService.notifications.slice(0, this._option.showOnly) :
        this._socialService.notifications :
      [];
  }
  get numUnreadNotifications() : number{
    let num = 0;
    if(this._socialService.notifications) {
      this._socialService.notifications.forEach(n => {
        if(!n.isRead) {
          num++;
        }
      });
    }
    return num;
  }

  public isUploading = false;
  
  private _option: NotificationsOption;

  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._option = new NotificationsOption(this.option);

  }

  markAllAsRead() {
    this.isUploading = true;
    this._sharedService.post(null, 'notification/read-all').subscribe((res: IResponseData) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this._socialService.notifications.forEach(n => {
          n.markAsRead();
        });
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again');
      } 
    }, error => {
      console.log(error);
      this.isUploading = false;
      this._toastr.error('Something went wrong. Please try again');
    });
  }

  onClickNotificationItem(notification: SocialNotification) {
    if(notification.isRead) {
      console.log('already marked as read');
    } else {
      notification.markAsRead();
      this._sharedService.post(null, 'notification/' + notification._id).subscribe((res: IResponseData) => {
        if(res.statusCode !== 200) {
          console.log(res.message);
          notification.markAsUnread();
        }
      }, error => {
        console.log(error);
        notification.markAsUnread();
      });  
    }
    if(notification.linkToTarget) {
      this._router.navigate([notification.linkToTarget]);
    }
  }
}

interface INotificationsOption {
  showOnly?: number;
}

class NotificationsOption implements INotificationsOption{

  get showOnly() { return this.data.showOnly || null; }
  constructor(private data: INotificationsOption) {}
}