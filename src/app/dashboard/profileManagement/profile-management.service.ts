import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  getProfileDetail(id: string): Promise<any>{
    return new Promise((resolve, reject) => {
      if(this.profileDetail && this.profileDetail._id == id){ 
        resolve(this.profileDetail); 
      }else{
        const rootUrl: string = environment.config.API_URL; 
        this.http.get(rootUrl + 'user/get-profile/' + id).subscribe((res: any)=>{
          if(res.statusCode === 200){
            this.profileDetail = res.data[0];
            this._bs.setUserVerifiedStatus(this.profileDetail.verifiedBadge);
            resolve(this.profileDetail);
          }
          else{ reject('cannot find user data'); }
        },
        err => { reject('cannot connect to server'); });
      }
    });
  }
}
