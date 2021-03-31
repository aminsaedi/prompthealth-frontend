import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorService } from '../../shared/services/behavior.service';
import { IUserDetail } from '../../models/user-detail';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  private profileDetail: IUserDetail;

  constructor( 
    private http: HttpClient,
    private _bs: BehaviorService,
  ) {}

  destroyProfileDetail(){ this.profileDetail = null; }

  /** this is called by header at first access and set the userdata from server in this service. and then someplace will use the data which is stored here */
  getProfileDetail(user: {_id: string, roles: string}): Promise<IUserDetail>{
    const id = user._id;
    const role = user.roles.toLowerCase();

    return new Promise((resolve, reject) => {
      if(this.profileDetail && this.profileDetail._id == id){ 
        resolve(this.profileDetail); 
      }else{
        const path = environment.config.API_URL + ((role == 'p') ? 'partner/get/' : 'user/get-profile/') + id;
        const headers = new HttpHeaders()
          .set('Authorization', localStorage.getItem('token'))
          .set('Content-Type', 'application/json');

        this.http.get( path, {headers} ).subscribe((res: any)=>{
          if(res.statusCode === 200 && res.data.length > 0){
            this.profileDetail = res.data[0];
            this._bs.setUserVerifiedStatus(this.profileDetail.verifiedBadge);
            resolve(this.profileDetail);
          }
          else{ 
            checkAccessToken(res);
            reject('cannot find user data');             
          }
        },
        err => { 
          console.log(err);
          checkAccessToken(err);
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