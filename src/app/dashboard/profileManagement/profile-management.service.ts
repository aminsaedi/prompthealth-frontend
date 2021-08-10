import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// import { BehaviorService } from '../../shared/services/behavior.service';
import { IUserDetail } from '../../models/user-detail';
import { Profile } from 'src/app/models/profile';
import { Observable, Subject } from 'rxjs';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  private _user: IUserDetail = null;
  private _profile: Profile = null;

  get profile(): Profile { return this._profile || null; }
  get user(): IUserDetail { return this._user || null; }

  private _loginStatusChanged = new Subject<LoginStatusType>();
  private _loginStatus: LoginStatusType;

  get loginStatus() { return this._loginStatus; }

  loginStatusChanged(): Observable<LoginStatusType> {
    return this._loginStatusChanged.asObservable();
  }

  constructor( 
    private http: HttpClient,
    private _uService: UniversalService,
    // private _bs: BehaviorService,
  ) {
    if(this._uService.isServer) {
      this._loginStatus = 'notLoggedIn';
    } else {
      this._loginStatus = 'notChecked';
      this.init();
    }
  }

  dispose(){ 
    this._user = null; 
    this._profile = null;
    if(!this._uService.isServer) {
      const ls = this._uService.localStorage;
      ls.removeItem('token');
      ls.removeItem('loginID');
      ls.removeItem('user');
      ls.removeItem('roles');
      ls.removeItem('isVipAffiliateUser');
    }
    this.changeLoginStatus('notLoggedIn');
  }

  setData(u: IUserDetail) {
    this._user = u;
    this._profile = new Profile(u);
    this.changeLoginStatus('loggedIn');
  }

  init() {
    const userStr = this._uService.localStorage.getItem('user');
    if(!userStr) {
      console.log('userStr not existed')
      this.dispose();
    } else {
      this.changeLoginStatus('loggingIn');
      this.getProfileDetail(JSON.parse(userStr)).then(u => {
        this.setData(u);
      }, () =>{
        this.dispose();
      })
    }
  }

  changeLoginStatus(status: LoginStatusType) {
    this._loginStatus = status;
    this._loginStatusChanged.next(status);
  }


  /** this is called by header at first access and set the userdata from server in this service. and then someplace will use the data which is stored here */
  getProfileDetail(user: IUserDetail): Promise<IUserDetail>{
    const id = user._id;
    const role = user.roles.toLowerCase();

    return new Promise((resolve, reject) => {
      if(this._user && this._user._id == id){ 
        this.setData(this._user);
        resolve(this._user);
      }else{
        const path = environment.config.API_URL + ((role == 'p') ? 'partner/get/' : 'user/get-profile/') + id;
        const headers = new HttpHeaders()
          .set('Authorization', localStorage.getItem('token'))
          .set('Content-Type', 'application/json');

        this.http.get( path, {headers} ).subscribe((res: any)=>{
          if(res.statusCode === 200 && res.data.length > 0){
            this.setData(res.data[0]);
            resolve(this._user);
          }
          else{ 
            checkAccessToken(res);
            this.dispose();
            reject('cannot find user data');             
          }
        },
        err => { 
          console.log(err);
          checkAccessToken(err);
          this.dispose();
          reject('cannot connect to server'); 
        });
      }
    });
  }
}

/** remove token if it's expired (same as SharedService.checkAccessToken) */    
function checkAccessToken(err: any){
  if(typeof err == 'object'){
    if ((err.code == 401 && err.message == 'authorization')) {
      localStorage.removeItem('token');
    }  
  }
}

export type LoginStatusType = 'loggingIn' | 'loggedIn' | 'notLoggedIn' | 'notChecked';