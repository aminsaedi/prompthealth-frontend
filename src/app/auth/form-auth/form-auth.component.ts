import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';

import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';

@Component({
  selector: 'form-auth',
  templateUrl: './form-auth.component.html',
  styleUrls: ['./form-auth.component.scss']
})
export class FormAuthComponent implements OnInit {

  @Input() userRole: string = 'U'; /** U | SP | C | P */
  @Input() authType: string = 'signin'; /** signin | signup */
  @Input() staySamePage: boolean = false;
  @Output() changeState = new EventEmitter<string>();

  get f(){ return this.form.controls}
  public form: FormGroup;
  public isSubmitted = false;

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _authService: SocialAuthService,
    private _sharedService: SharedService,
    private _bs: BehaviorService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', [Validators.required, Validators.minLength(8)])
    });
    if(this.authType == 'signup'){
      this.form.addControl('password2', new FormControl('', [Validators.required, Validators.minLength(8)]));
      this.form.addControl('hear_from', new FormControl('', [Validators.required]));
      this.form.addControl('t_c', new FormControl('', [Validators.required]));
    }
  }

  signinWith(type: string) {
    const providerId = {
      facebook: FacebookLoginProvider.PROVIDER_ID,
      google: GoogleLoginProvider.PROVIDER_ID,
    }

    this._authService.signIn(providerId[type]).then(x => {
      console.log(x);
      const data: SocialRegisterData = {
        socialToken: x.idToken,
        social_id: x.id,
        roles: this.userRole,
        profileImage: x.photoUrl,
        firstName: x.firstName,
        lastName: x.lastName,
        email: x.email,
        termsCondition: true,
        loginType: x.provider.toLowerCase(),
      }

      this._sharedService.loader('show');
      this.changeState.emit('start');

      this._sharedService.socialRegister(data).subscribe((res: any) => {
        this._sharedService.loader('hide');

        if(res.statusCode === 200) {
          this.afterLogin(res.data);
        }else{
          this._toastr.error(res.message);
        }
      }, error => {
        console.log(error);
        this._toastr.error(error);
        this._sharedService.loader('hide');  
      });
    });
  }

  signinEmail(){
    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There are some items that require your attention.');
      return;
    }

    const data: {[k: string]: (string | boolean)} = {
      email: this.f.email.value,
      password: this.f.password.value,
    }

    if(this.authType == 'signin') {
      data.loginType = 'email';
    } else {
      data.hear_from = this.f.hear_from.value;
      data.t_c = true;
      data.roles = this.userRole;
    }

    this._sharedService.loader('show');
    this.changeState.emit('start');

    this._sharedService.login(data).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if(res.statusCode == 200){
        this.afterLogin(res.data);
      }else{
        this._toastr.error(res.message);
      }
    }, error => {
      console.log(error);
      this._toastr.error(error);
      this._sharedService.loader('hide');
    });

  }

  afterLogin(userinfo: any){
    this.isSubmitted = false;
    this._toastr.success('Welcome');

    this._sharedService.addCookie('token', userinfo.loginToken);
    this._sharedService.addCookie('roles', userinfo.roles);
    this._sharedService.addCookie('loginID', userinfo._id);
    this._sharedService.addCookie('isVipAffiliateUser', userinfo.isVipAffiliateUser);
    this._sharedService.addCookieObject('user', userinfo);

    this._bs.setUserData(userinfo);

    if(!this.staySamePage){
      let next: string;
      switch(this.userRole.toLowerCase()){
        case 'u': 
          next = '/'; 
          break;
        case 'sp':
        case 'c':
          next = (this.authType == 'signin') ? '/dashboard/profilemanagement' : '/dashboard/professional-info';
          break;
        case 'p':
          next = (this.authType == 'signin') ? '/dashboard/profilemanagement' : '/dashboard/register-partner';
          break;
      }
      this._router.navigate([next]);
    }

    this.changeState.emit('done');
  }
}

interface SocialRegisterData {
  socialToken: string;
  email: string;
  loginType: string;
  termsCondition: boolean;
  social_id: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  roles: string; /** for signup. */
}