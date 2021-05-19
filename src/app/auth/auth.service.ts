import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UniversalService } from '../shared/services/universal.service';

@Injectable()

export class AuthService {

  public jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(
    private _uService: UniversalService,
  ) {}
  // ...
  public isAuthenticated(): boolean {
    if(this._uService.isServer) { 
      return false; 
    } else {
      const token = this._uService.localStorage.getItem('token');
      return token ?  true : false;  
    }
    // Check whether the token is expired and return
    // true or false
    // return !this.jwtHelper.isTokenExpired(token);
  }
}