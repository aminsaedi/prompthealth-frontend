import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';

import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';
import { MustMatch } from '../../_helpers/must-match.validator';
import { validators } from 'src/app/_helpers/form-settings';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';

@Component({
  selector: 'form-auth',
  templateUrl: './form-auth.component.html',
  styleUrls: ['./form-auth.component.scss']
})
export class FormAuthComponent implements OnInit {

  @Input() userRole = 'U'; /** U | SP | C | P */
  @Input() authType = 'signin'; /** signin | signup */
  @Input() staySamePage = false;
  @Input() nextPage: string = null;
  @Input() nextPageKeyword: string = null;
  @Output() changeState = new EventEmitter<'start'|'done'>();

  get f() { return this.form.controls; }
  public form: FormGroup;
  public isSubmitted = false;
  public isLoading = false;

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _authService: SocialAuthService,
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _bs: BehaviorService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = (this.authType === 'signin') ? this._fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    }) : this._fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', validators.password),
      confirm_password: new FormControl('', []),
      hear_from: new FormControl('', []),
      t_c: new FormControl('', [Validators.requiredTrue]),
    }, { validator: MustMatch('password', 'confirm_password') });
  }

  signinWith(type: string) {
    const providerId = {
      facebook: FacebookLoginProvider.PROVIDER_ID,
      google: GoogleLoginProvider.PROVIDER_ID,
    };

    this._authService.signIn(providerId[type]).then(x => {
      console.log(x);
      let socialToken: string;
      switch (type) {
        case 'google': socialToken = x.idToken; break;
        case 'facebook': socialToken = x.id;
      }

      const data: SocialRegisterData = {
        socialToken,
        authToken: x.authToken,
        social_id: x.id,
        roles: this.userRole || 'U',
        profileImage: x.photoUrl,
        firstName: x.firstName,
        lastName: x.lastName,
        email: x.email,
        termsCondition: true,
        loginType: x.provider.toLowerCase(),
      };

      this._sharedService.loader('show');
      this.isLoading = true;
      this.changeState.emit('start');

      this._sharedService.socialSignin(data, type).subscribe((res: any) => {
        this._sharedService.loader('hide');
        this.isLoading = false;

        if (res.statusCode === 200) {
          this.afterLogin(res.data);
        } else {
          this._toastr.error(res.message);
        }
      }, error => {
        console.log(error);
        this._toastr.error(error);
        this._sharedService.loader('hide');  
        this.isLoading = false;
      });
    });
  }

  signinEmail() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      this._toastr.error('There are some items that require your attention.');
      return;
    }

    const data: { [k: string]: (string | boolean) } = {
      email: this.f.email.value,
      password: this.f.password.value,
    };

    if (this.authType === 'signin') {
      data.loginType = 'email';
    } else {
      data.hear_from = this.f.hear_from.value;
      data.t_c = true;
      data.roles = this.userRole || 'U';
    }

    this._sharedService.loader('show');
    this.isLoading = true;

    this.changeState.emit('start');

    console.log(data);
    const subscription = (this.authType === 'signin') ? this._sharedService.login(data) : this._sharedService.register(data);
    subscription.subscribe((res: any) => {
      this._sharedService.loader('hide');
      this.isLoading = false;

      if(res.statusCode == 200){
        this.afterLogin(res.data);
      } else {
        this._toastr.error(res.message);
      }
    }, error => {
      console.log(error);
      this._toastr.error(error);
      this._sharedService.loader('hide');
      this.isLoading = false;
    });

  }

  afterLogin(userinfo: any) {
    this.isSubmitted = false;
    const role = userinfo.roles;

    this._sharedService.addCookie('token', userinfo.loginToken);
    this._sharedService.addCookie('roles', role);
    this._sharedService.addCookie('loginID', userinfo._id);
    this._sharedService.addCookie('isVipAffiliateUser', userinfo.isVipAffiliateUser);
    this._sharedService.addCookieObject('user', userinfo);
    
    this._profileService.getProfileDetail(userinfo);

    this._bs.setUserData(userinfo);

    let toastrMessage = 'Welcome!';

    if (!this.staySamePage) {
      let next: string;
      if (this.nextPage) {
        next = this.nextPage;
      } else if (this.nextPageKeyword) {
        if (this.nextPageKeyword == 'buyplan') {
          switch (role.toLowerCase()) {
            case 'u':
              next = '/';
              toastrMessage = 'We don\'t have a subscription plan for your account type.';
              break;
            case 'sp':
            case 'c':
              next = '/plans';
              break;
            case 'p':
              next = '/plans/product';
              break;
          }
        }
      } else {
        switch (role.toLowerCase()) {
          case 'u':
            next = '/';
            break;
          case 'sp':
          case 'c':
            next = (this.authType == 'signin') ? '/dashboard/profilemanagement' : '/dashboard/register-practitioner';
            break;
          case 'p':
            next = (this.authType == 'signin') ? '/dashboard/profilemanagement' : '/dashboard/register-product';
            break;
        }
      }
      this._router.navigate([next]);
    }

    this.changeState.emit('done');
    this._toastr.success(toastrMessage);
  }
}

interface SocialRegisterData {
  socialToken: string;
  authToken: string;
  email: string;
  loginType: string;
  termsCondition: boolean;
  social_id: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  roles: string; /** for signup. */
}
