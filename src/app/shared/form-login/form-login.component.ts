import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';

import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';


@Component({
  selector: 'form-login',
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.scss']
})
export class FormLoginComponent implements OnInit {

  @Input() userRole: string; /** U | SP | C */
  @Input() authType: string = 'login';

  public isSubmitted = true;

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _authService: SocialAuthService,
    private _sharedService: SharedService,
    private _behaviorService: BehaviorService,
    private _toastr: ToastrService,
  ) { }


  private providerId = {
    facebook: FacebookLoginProvider.PROVIDER_ID,
    google: GoogleLoginProvider.PROVIDER_ID,
  }

  ngOnInit(): void {
  }

  signinWith(type: string) {
    this._authService.signIn(this.providerId[type]).then(x => {
      console.log(x);
      const payload: SocialRegisterData = { /** google version */
        socialToken: x.idToken,
        email: x.email,
        loginType: x.provider.toLowerCase(),
        social_id: x.id,
        profileImage: x.photoUrl,
        firstName: x.firstName,
        lastName: x.lastName
      }
      this._sharedService.loader('show');
      this._sharedService.socialRegister(payload).subscribe((res: any) => {
        this._sharedService.loader('hide');

        if(res.statusCode === 200) {
          this.afterLogin(res.data);
        }
      });
    });
  }

  afterLogin(userinfo: any){
    this.isSubmitted = false;
    this._toastr.success('Welcome');

    let next: string;
    switch(this.authType){
      case 'login':  next = (this.userRole.toLowerCase() == 'u') ? '/' : '/dashboard/profilemanagement'; break;
      case 'signin': next = (this.userRole.toLowerCase() == 'u') ? '/' : '/dashboard/professional-info'; break;
    }

    this._sharedService.addCookie('token', userinfo.loginToken);
    this._sharedService.addCookie('roles', userinfo.roles);
    this._sharedService.addCookie('loginID', userinfo._id);
    this._sharedService.addCookie('isVipAffiliateUser', userinfo.isVipAffiliateUser);
    this._sharedService.addCookieObject('user', userinfo);
    this._router.navigate([next]);
  }



  signInWithFB(): void {
    this._authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(x => {
      const payload = {
        // socialToken: x.id,
        // email: x.email,
        // roles: this.userType,
        // loginType: x.provider.toLowerCase(),
        // termsCondition: true,
        // social_id: x.id,
        // profileImage: x.photoUrl,
        // firstName: x.firstName,
        // lastName: x.lastName
      };

      this._sharedService.socialRegister(payload).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {

          // this.toastr.success('Welcome');
          // this.submitted = false;


          this._sharedService.loginUser(res, 'login');
        } else {
          // this.toastr.error(res.message);
        }
      }, (error) => {
        // this.toastr.error(error.message);
        this._sharedService.loader('hide');
      });
    });
  }

}

interface SocialRegisterData {
  socialToken: string;
  email: string;
  loginType: string;
  termsCondition?: boolean; /** for facebook */
  social_id: string;
  profileImage: string;
  firstName: string;
  lastName: string;
}