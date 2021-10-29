import { Injectable } from '@angular/core';
import { IAuthResult } from '../models/response-data';
import { UniversalService } from '../shared/services/universal.service';

@Injectable({
  providedIn: 'root'
})
export class Auth2Service {

  constructor(
    private _uService: UniversalService,
  ) { }

  storeCredential(auth: IAuthResult['data']) {
    const ls = this._uService.localStorage;
    
    ls.setItem('token', auth.loginToken);
    ls.setItem('roles', auth.roles);
    ls.setItem('loginID', auth._id);
    ls.setItem('isVipAffiliateUser', auth.isVipAffiliateUser.toString());
    ls.setItem('user', JSON.stringify(auth));
  }
}
