import { Component, OnInit } from '@angular/core';
import { animate, transition, style, trigger } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';

const animation = trigger('carousel', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(100%)' }),
    animate('500ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('500ms ease', style({ opacity: 0, transform: 'translateX(-100%' })),
  ]),
]);
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [animation],
})
export class LoginComponent implements OnInit {
  user: SocialUser;
  loginForm: FormGroup;

  public professionalLogin = false;
  userType = 'U';
  public submitted = false;
  public loginUserType: any;

  public currentSlide = 0;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    dots: true,
    cssEase: 'ease'
  };

  constructor(
    private authService: SocialAuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _route: ActivatedRoute,
    private _sharedService: SharedService,
    private _bs: BehaviorService,
    private toastr: ToastrService,
  ) { }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % 3;
  }

  ngOnInit(): void {
    setInterval(() => { this.nextSlide(); }, 8000);

    this.authService.authState.subscribe((user) => {
      this.user = user;
    });

    this._bs.getRole().subscribe((res: any) => {
      this.loginUserType = res;
    });

    this.loginUserType = localStorage.getItem('userType');

    // this._route.params.subscribe(param => {
    //   const type = param.type;
    //   this.professionalLogin = (type.toLowerCase() == 'u') ? false : true;
    //   switch (type.toLowerCase()) {
    //     case 'u': this.userType = 'U'; break;
    //     case 'sp': this.userType = 'SP'; break;
    //     case 'c': this.userType = 'C'; break;
    //   }
    // });

    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(re)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      termsCondition: [false, [Validators.required]],
      loginType: ['']
    });
  }
  get f() { return this.loginForm.controls; }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(x => {
      const payload = {
        socialToken: x.idToken,
        email: x.email,
        loginType: x.provider.toLowerCase(),
        social_id: x.id,
        profileImage: x.photoUrl,
        firstName: x.firstName,
        lastName: x.lastName

      };
      // console.log(x);
      this._sharedService.socialRegister(payload).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {

          this.toastr.success('Welcome');
          this.submitted = false;

          // this.userType === 'U' ? this._router.navigate(['/']) : this._router.navigate(['dashboard/professional-info']);

          this._sharedService.loginUser(res, 'reg');
        } else {
          this.toastr.error(res.message);
        }
      }, (error) => {
        this.toastr.error('There are some error please try after some time.');
        this._sharedService.loader('hide');
      });
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(x => {
      const payload = {
        socialToken: x.id,
        email: x.email,
        loginType: x.provider.toLowerCase(),
        termsCondition: true,
        social_id: x.id,
        profileImage: x.photoUrl,
        firstName: x.firstName,
        lastName: x.lastName
      };

      this._sharedService.socialRegister(payload).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {

          this.toastr.success('Welcome');
          this.submitted = false;

          // this.userType === 'U' ? this._router.navigate(['/']) : this._router.navigate(['dashboard/professional-info']);

          this._sharedService.loginUser(res, 'login');
        } else {
          this.toastr.error(res.message);
        }
      }, (error) => {
        this.toastr.error(error.message);
        this._sharedService.loader('hide');
      });
    });
  }

  loginUser(form: FormGroup) {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    } else {
      this.submitted = true;
      this.loginForm.controls.loginType.setValue(this.loginUserType);
      const data = JSON.stringify(this.loginForm.value);
      this._sharedService.loader('show');
      this._sharedService.login(data).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {
          this._sharedService.loginUser(res, 'login');
          this.toastr.success(res.message, '', {
            timeOut: 2000
          });

        } else {
          this.toastr.error(res.message);
        }

      }, (error) => {
        this.toastr.error(error);
        this._sharedService.loader('hide');
      });
    }
  }

}
