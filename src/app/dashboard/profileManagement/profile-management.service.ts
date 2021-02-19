import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  private profileDetail: any;

  constructor( private http: HttpClient ) {}

  destroyProfileDetail(){ this.profileDetail = null; }

  getProfileDetail(id: string): Promise<any>{
    return new Promise((resolve, reject) => {
      if(this.profileDetail && this.profileDetail._id == id){ 
        resolve(this.profileDetail); 
      }else{
        const rootUrl: string = environment.config.API_URL; 
        this.http.get(rootUrl + 'user/get-profile/' + id).subscribe((res: any)=>{
          if(res.statusCode === 200){
            this.profileDetail = res.data[0];
            resolve(this.profileDetail);
          }
          else{ reject('cannot find user data'); }
        },
        err => { reject('cannot connect to server'); });
      }
    });
  }
}
