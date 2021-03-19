import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorService } from '../../shared/services/behavior.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  private profileDetail: any;

  constructor( 
    private http: HttpClient,
    private _bs: BehaviorService,
  ) {}

  destroyProfileDetail(){ this.profileDetail = null; }

  /** this is called by header at first access and set the userdata from server in this service. and then someplace will use the data which is stored here */
  getProfileDetail(user: {_id: string, roles: string}): Promise<any>{
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
          else{ reject('cannot find user data'); }
        },
        err => { 
          console.log(err);
          reject('cannot connect to server'); 
        });
      }
    });
  }
}
