import { Injectable, Optional, RendererFactory2, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { PreviousRouteService } from './previousUrl.service';
import { BehaviorService } from './behavior.service';


// import { SocialAuthService } from 'angularx-social-login';

import { BehaviorSubject, throwError } from 'rxjs';

// import 'rxjs/add/operator/toPromise';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';

import { DOCUMENT } from '@angular/common';
import { UniversalService } from './universal.service';
import { IUserDetail } from 'src/app/models/user-detail';
import { IResponseData } from 'src/app/models/response-data';
import { ToastrService } from 'ngx-toastr';
import { Professional } from 'src/app/models/professional';
import { SocialService } from 'src/app/social/social.service';
import { AngularFireMessaging } from '@angular/fire/messaging';

export class User {
  constructor(
    public email: string,
    public password: string) { }
}

@Injectable()
export class SharedService {
  constructor(
    private _router: Router,
    private spinner: NgxSpinnerService,
    private previousRouteService: PreviousRouteService,
    private _bs: BehaviorService,
    private _uService: UniversalService,
    private _profileManager: ProfileManagementService,
    private _socialManager: SocialService,
    private _toastr: ToastrService,
    @Optional() private angularFireMessaging: AngularFireMessaging,

    @Inject(DOCUMENT) private document,
    private http: HttpClient) {
    if (this.angularFireMessaging) { this.receiveMessage(); }
    // console.log('fcm loaded');
    // this.type = this._uService.localStorage.getItem('roles');
  }
  currentMessage = new BehaviorSubject(null);

  rootUrl: string = environment.config.API_URL;
  // baseUrl: string = environment.config.API_URL;
  // type: any;
  personalMatch;
  private compareList: Professional[] = [];

  requestPermission(user: IUserDetail) {
    if (!this.angularFireMessaging) { return; }
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        // console.log(token);
        this.post({ token, deviceType: 'web' }, 'notification/save-token').toPromise().then(res => {
          // console.log('token saved to db', res);
        });
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }
  receiveMessage() {
    if (!this.angularFireMessaging) { return; }
    this.angularFireMessaging.messages.subscribe(
      (payload: { notification: { title: string; body: string; image: string } }) => {
        this.currentMessage.next(payload);
        // const notification: { title: string, body: string, image: string } = payload.notification;
        // const noti = new Notification(notification.title, {
        //   body: notification.body,
        //   image: notification.image
        // });
      });
  }

  async logout(navigate: boolean = true) {
    if (!this.angularFireMessaging) {
      this._socialManager.dispose();
      this._profileManager.dispose();
      this._uService.localStorage.clear();
      if (navigate) { this._router.navigate(['/']); }
      return;
    }
    await this.angularFireMessaging.getToken.toPromise().then(token => {
      if (token) {
        this.post({ token, deviceType: 'web' }, 'notification/remove-token').toPromise().then(res => {
        });
      }
    }).catch(error => {
      console.error(error);
    });

    this._socialManager.dispose();
    this._profileManager.dispose();

    const ls = this._uService.localStorage;

    ls.removeItem('token');
    ls.removeItem('loginID');
    ls.removeItem('user');
    ls.removeItem('roles');
    ls.removeItem('isVipAffiliateUser');

    this._bs.setUserData(null);
    // this._toastr.success('Logged out successfully');
    ls.setItem('userType', 'U');
    if (navigate) {
      this._router.navigate(['/']);
    }
  }

  get(path, setParams = {}) {
    const token = this._uService.localStorage.getItem('token');
    if (!token) {
      const url = this.rootUrl + path;
      return this.http.get(url);
    } else {
      const headers = this.getAuthorizationHeader();
      const url = this.rootUrl + path;
      return this.http.get(url, { headers });
    }

  }
  getNoAuth(path: string, params = {}) {
    const url = this.rootUrl + path;
    return this.http.get(url, { params });
  }
  b64ToBlob(data: string) {
    const regExContentType = /data:(image\/.+);base64/;
    const contentType = data.match(regExContentType)[1];

    const byteString = atob(data.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: contentType });
  }

  fetchFile(path: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      return this.http.post(
        this.rootUrl + 'common/file-download',
        { fileKey: path },
        { responseType: 'blob' },
      ).subscribe((res: Blob) => {
        resolve(res);
      }, error => {
        reject();
      });
    });
  }

  downloadFile(filepath: string, filename: string = null): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const headers = this.getAuthorizationHeader();
      return this.http.post(this.rootUrl + '/common/file-download', { fileKey: filepath }, { headers, responseType: 'blob' }).subscribe((res: Blob) => {

        if (!filename) {
          const array = filepath.split('/');
          filename = array[array.length - 1];
        }

        const a = document.createElement('a');
        const url = URL.createObjectURL(res);
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        resolve(true);
      }, error => {
        reject(error);
      });
    });
  }

  post(body: object, path: string) {
    const headers = this.getAuthorizationHeader();
    return this.http.post(this.rootUrl + path, body, { headers }).pipe(
      map((response: IResponseData) => {
        return response;
      }),
      catchError(this.handleError)
    );
    // return this.http.post(this.rootUrl + path, body, { headers });
  }
  postNoAuth(body: object, path: string) {
    return this.http.post(this.rootUrl + path, body).pipe(
      map((response: IResponseData) => {
        return response;
      }),
      catchError(this.handleError)
    );
    // return this.http.post(this.rootUrl + path, body),catchError(this.handleError);
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  async shrinkImage(file: File, maxFileSize: number = 10 * 1000 * 1000, ratioSize: number = 0.8, ratioQuality: number = 0.8): Promise<{ file: Blob, filename: string }> {
    return new Promise((resolve, reject) => {
      if (file.size > maxFileSize) {
        const img = new Image();
        img.onload = () => {
          const t = img;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(t.width * ratioSize);
          canvas.height = Math.round(t.height * ratioSize);
          const ctx = canvas.getContext('2d');

          ctx.drawImage(t, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((b: Blob) => {
            if (b.size >= maxFileSize) { reject('size is too big'); } else {
              const filename = Date.now().toString() + '.' + b.type.replace('image/', '');
              resolve({ file: b, filename });
            }
          }, file.type, ratioQuality);
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve({ file, filename: file.name });
      }
    });
  }

  async shrinkImageByFixedWidth(file: File | Blob, width: number = 1500): Promise<{ file: Blob, filename: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = (e: Event) => {
        const t = e.target;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = img.height * width / img.width;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b: Blob) => {
          const filename = Date.now().toString() + '.' + b.type.replace('image/', '');
          resolve({ file: b, filename });
        }, file.type);
      };
      img.src = URL.createObjectURL(file);
    });
  }


  async shrinkImageByFixedHeight(file: File, height: number = 100): Promise<{ file: Blob, filename: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = (e: Event) => {
        const t = e.target;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * height / img.height;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b: Blob) => {
          const filename = Date.now().toString() + '.' + b.type.replace('image/', '');
          resolve({ file: b, filename });
        }, file.type);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  imgUpload(body: FormData, path: string) {
    let headers = this.getAuthorizationHeader();
    headers = headers.delete('Content-Type');
    return this.http.post(this.rootUrl + path, body, { headers });
  }

  uploadMultipleImages(images: { file: File | Blob, filename: string }[], userId: string, imageLocation: string) {
    const data = new FormData();
    data.append('imgLocation', imageLocation);
    data.append('_id', userId);
    images.forEach(image => {
      data.append('images', image.file, image.filename);
    });

    const path = (images.length == 1) ? 'common/imgUpload' : 'common/imgMultipleUpload';
    return this.imgUpload(data, path);
  }

  imgUploadPut(body: FormData, path: string) {
    let headers = this.getAuthorizationHeader();
    headers = headers.delete('Content-Type');
    return this.http.put(this.rootUrl + path, body, { headers });
  }

  put(body: object, path: string) {
    const headers = this.getAuthorizationHeader();
    return this.http.put(this.rootUrl + path, body, { headers });
  }
  login(body: object) {
    const headers = this.getDefaultHeader();
    // return this.http.post(this.rootUrl + 'user/signinUser', body, { headers });
    return this.http.post(this.rootUrl + 'oauth/withpassword', body, { headers }).pipe(
      map((response: IResponseData) => {
        return response;
      }),
      catchError(this.handleError)
    );
  }
  register(body: object) {
    const headers = this.getDefaultHeader();
    // return this.http.post(this.rootUrl + 'user/register', body, { headers });
    return this.http.post(this.rootUrl + 'user/register', body, { headers }).pipe(
      map((response: IResponseData) => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  unsubscribe(email: string) {
    // let headers = this.getDefaultHeader();
    return this.http.delete(this.rootUrl + 'user/unsubscribe/' + email).pipe(
      map((response: IResponseData) => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  socialRegister(body: object) {

    const headers = this.getDefaultHeader();
    return this.http.post(this.rootUrl + 'user/social-login-2', body, { headers });
  }
  socialSignin(body: { authToken: string; roles: string }, type: string) {
    const headers = this.getDefaultHeader();
    // console.log(headers);

    switch (type) {
      case 'google':
        return this.http.get(this.rootUrl + 'oauth/googlesignin?access_token=' + body.authToken
          + '&role=' + body.roles, {
          headers
        });
      case 'facebook':
        return this.http.get(this.rootUrl + 'oauth/facebooksignin?access_token=' + body.authToken
          + '&role=' + body.roles, {
          headers
        });
      default:
        break;
    }
  }
  logingOut() {
    const headers = this.getAuthorizationHeader();
    return this.http.delete(this.rootUrl + 'oauth/logout', { headers });
  }
  getSubscriptionPlan() {
    const date = new Date().getTime().toString();
    const url = this.rootUrl + 'subscribepackage';

    const headers = this.getAuthorizationHeader();
    return this.http.get(url, { headers });
  }
  getUserDetails() {
    const date = new Date().getTime().toString();
    const url = this.rootUrl + 'getuserdetail';

    const headers = this.getAuthorizationHeader();
    return this.http.get(url, { headers });
  }
  token(body: object) {
    const headers = this.getAuthorizationHeader();
    return this.http.post(this.rootUrl + 'createcustomer', body, { headers });
  }
  deleteContent(path: string) {
    const headers = this.getAuthorizationHeader();
    return this.http.delete(this.rootUrl + path, { headers });

  }

  removeProfile(formData: object) {
    const headers = this.getAuthorizationHeader();
    return this.http.put(this.rootUrl + 'user/updateStatus', formData, { headers });
  }

  delete(id: string, model: string) {

    const headers = this.getAuthorizationHeader();
    const url = this.rootUrl + 'delete?id=' + id + '&model=' + model;
    return this.http.delete(url, { headers });
  }
  removeFav(id: string) {
    const headers = this.getAuthorizationHeader();
    const url = this.rootUrl + `user/remove-favorite/${id}`;
    return this.http.delete(url, { headers });
  }
  uploadImage(object: FormData) {
    const headers = this.getAuthorizationHeader();
    return this.http.post(this.rootUrl + 'upload', object, { headers });
  }
  uploadImage1(object: FormData) {
    const headers = this.getAuthorizationHeader();
    return this.http.post(this.rootUrl + 'upload', object, { headers });
  }
  sendTop() {
    window.scrollTo(500, 0);
  }
  /*This function is use to remove user session if Access token expired. */
  checkAccessToken(err: { code: number; message: string }): void {
    const code = err.code;
    const message = err.message;

    if (code === 401 && message === 'authorization') {
      this._uService.localStorage.removeItem('token');
      // this.showAlert('Session Expired.', 'alert-danger')
      // this._router.navigate(['/auth/business']);
    } else {

    }
  }

  setPersonalMatch(personalMatch: object) {
    this.personalMatch = personalMatch;
  }
  getPersonalMatch() {
    return this.personalMatch;
  }
  clearPersonalMatch() { this.personalMatch = null; }
  setCompareList(compareList: Professional[] = []) {
    this.compareList = compareList;
  }
  getCompareList() {
    return this.compareList;
  }

  /*This function is use to get access token from cookie. */
  getAccessToken(): string {
    const token = this._uService.localStorage.getItem('token');
    return token;
  }

  /*This function is use to get header with Authorization or without Authorization. */
  getAuthorizationHeader(access = true): HttpHeaders {
    const token = this.getAccessToken();
    let headers: HttpHeaders = null;

    if (access) {
      headers = new HttpHeaders()
        .set('Authorization', token)
        .set('Content-Type', 'application/json');
    }


    return headers;
  }
  getDefaultHeader() {

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return headers;
  }
  addCookie(key: string, value: string) {
    this._uService.localStorage.setItem(key, value);
  }

  getCookie(key: string) {
    const item = this._uService.localStorage.getItem(key);
    return item;
  }
  addCookieObject(key: string, obj: object) {
    this._uService.localStorage.setItem(key, JSON.stringify(obj));
  }

  getCookieObject(key: string) {
    return JSON.parse(this._uService.localStorage.getItem(key));
  }

  loginID() {
    return this._uService.localStorage.getItem('loginID');
  }

  loader(key: string) {
    if (key == 'show') { this.spinner.show(); }
    if (key == 'hide') { this.spinner.hide(); }
  }

  showAlert(message: string, alertClass: string) {
    // window.scrollTo(0, 0);
    const obj = {
      classes: ['alert', alertClass],
      timeout: 1800
    };
    // this._flashMessagesService.show(message, obj);
  }


  loginUser(res: IResponseData, type: string) {
    let route;
    if (res.data.roles === 'U') {
      // this._router.navigate(['/']);
      route = res.data.roles === 'U' ? '/' : '';
    } else {
      if (type === 'reg') {
        switch (res.data.roles.toLowerCase()) {
          case 'u': route = '/dashboard/questions/User'; break;
          case 'p': route = '/dashboard/register-product'; break;
          case 'sp':
          case 'c':
            route = '/dashboard/professional-info';
            break;
        }
      } else {
        if (this.previousRouteService.getPreviousUrl() === '') {

        } else {
          route = res.data.roles === 'U' ? '/' : '/dashboard/profilemanagement/';
        }
      }
    }


    this.showAlert(res.message, 'alert-success');
    this.addCookie('token', res.data.loginToken);
    this.addCookie('roles', res.data.roles);
    this.addCookie('loginID', res.data._id);
    this.addCookie('isVipAffiliateUser', res.data.isVipAffiliateUser);
    this.addCookieObject('user', res.data);
    this._router.navigate([route]);
  }

  removeDuplicates(originalArray: object[], prop: string) {
    const newArray = [];
    const lookupObject = {};

    for (const i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (const i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {
        resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      },
        err => {
          reject(err);
        });
    });
  }

  getReferrer() {
    const ref = document.referrer;
    let res: string;
    if (!ref || ref.length == 0) {
      res = 'direct';
    } else {
      res = ref.replace(/http(s)?:\/\//, '').replace(/\/.*$/, '');
    }
    return res;
  }
}

export declare type LinkDefinition = {
  charset?: string;
  crossorigin?: string;
  href?: string;
  hreflang?: string;
  media?: string;
  rel?: string;
  rev?: string;
  sizes?: string;
  target?: string;
  type?: string;
} & {
  [prop: string]: string;
};
