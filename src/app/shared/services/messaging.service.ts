import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user';
import { SharedService } from './shared.service';


@Injectable()
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private _sharedService: SharedService
  ) {
  }
  requestPermission(user: User) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        console.log(token);
        this._sharedService.post({ token }, 'notification/save-token').toPromise().then(res => {
          console.log('token saved to db', res);
        });
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }
  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log('new message received. ', payload);
        this.currentMessage.next(payload);
      });
  }
}
