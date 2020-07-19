import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';


import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { PreviousRouteService } from '../../shared/services/previousUrl.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../../_helpers/must-match.validator';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;
  user: SocialUser;
  submitted = false;
  professionalSignup = false
  userType = 'U';
  returnUrl = '';

  constructor(
    private authService: SocialAuthService,
    private route: ActivatedRoute,
    private previousRouteService: PreviousRouteService,
    private _router: Router,
    public _bs: BehaviorService,
    private _sharedService: SharedService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
  ) { }
  get f() { return this.registerForm.controls; }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
    });
    this.route.queryParamMap
      .subscribe(params => { 
        const routeParams = +params.get('previousPath');
    });
    switch(this._router.url) {
      case "/auth/registration/sp": 
        this.professionalSignup = true;
        this.userType = 'SP'
        break;
      case "/auth/registration/c": ;
        this.userType = 'C'
        break;
      case "/auth/registration/u":
        this.professionalSignup = false;
        this.userType = 'U'
        break;
        case "/auth/registration/SP": 
        this.professionalSignup = true;
        this.userType = 'SP'
        break;
      case "/auth/registration/C": ;
        this.userType = 'C'
        break;
      case "/auth/registration/U":
        this.professionalSignup = false;
        this.userType = 'U'
        break;

      default:
        break;

    }
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      hear_from: ['', [Validators.required]],
      t_c: ['', [Validators.required]],
      roles: this.userType,
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required]
    },
    {
      validator: MustMatch('password', 'confirm_password')
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(x => {
    
      const payload = {
        socialToken: x.idToken,
        email: x.email,
        roles: this.userType,
        loginType: x.provider.toLowerCase(),
        termsCondition: true
  
      }

      this._sharedService.socialRegister(payload).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {

          this.toastr.success('Thanks for the registeration we have sent a welcome email to the address provided');
          this.registerForm.reset();
          this.submitted = false;

          // this.userType === 'U' ? this._router.navigate(['/']) : this._router.navigate(['dashboard/professional-info']);

          this._sharedService.loginUser(res, 'reg');
        } else {
          this.toastr.error(res.message);
        }
      }, (error) => {
        this.toastr.error("There are some error please try after some time.")
        this._sharedService.loader('hide');
      });
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(x => {
      const payload = {
        socialToken: x.idToken,
        email: x.email,
        roles: this.userType,
        loginType: x.provider.toLowerCase(),
        termsCondition: true
  
      }

      this._sharedService.socialRegister(payload).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {

          this.toastr.success('Thanks for the registeration we have sent a welcome email to the address provided');
          this.registerForm.reset();
          this.submitted = false;

          // this.userType === 'U' ? this._router.navigate(['/']) : this._router.navigate(['dashboard/professional-info']);

          this._sharedService.loginUser(res, 'reg');
        } else {
          this.toastr.error(res.message);
        }
      }, (error) => {
        this.toastr.error("There are some error please try after some time.")
        this._sharedService.loader('hide');
      });
    
    });
  }
  registerUser() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    else {
      this.submitted = true;
      const payload = this.registerForm.value;
      let dataReg = JSON.stringify(payload);

      this._sharedService.loader('show');
      this._sharedService.register(dataReg).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {

          this.toastr.success('Thanks for the registeration we have sent a welcome email to the address provided');
          this.registerForm.reset();
          this.submitted = false;

          // this.userType === 'U' ? this._router.navigate(['/']) : this._router.navigate(['dashboard/professional-info']);

          this._sharedService.loginUser(res, 'reg');
        } else {
          this.toastr.error(res.message);
        }
      }, (error) => {
        this.toastr.error("There are some error please try after some time.")
        this._sharedService.loader('hide');
      });
    }
  }

  loginSocial() {
  }
}
