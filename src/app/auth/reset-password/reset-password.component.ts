import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IAuthResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { slideVerticalAnimation } from 'src/app/_helpers/animations';
import { validators } from '../../_helpers/form-settings';
import { Auth2Service } from '../auth2.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  animations: [slideVerticalAnimation],
})
export class ResetPasswordComponent implements OnInit {

  get token() { return this._route.snapshot.params.token; }

  get isAndroid() { return this._uService.isAndroid; }
  get isIPhone()  { return this._uService.isIphone; }
  get isAppAvailable() { return this._uService.isAppAvailable; }  

  public form: FormControl;
  public isSubmitted: boolean = false;
  public isUpdating: boolean = false;
  public doneUpdate: boolean = false;

  public isAppNavigationShown: boolean = true;

  constructor(
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _route: ActivatedRoute,
    private _authService: Auth2Service,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this.form = new FormControl('', validators.password);
  }

  openApp() {
    this._uService.openApp('confirmResetPassword/' + this.token);
  }

  closeAppNavigation(e: Event) {
    e.stopPropagation();
    this.isAppNavigationShown = false;
  }

  onSubmit() {
    this.isSubmitted = true;
    if(this.form.invalid) {
      this._toastr.error('There is an item that requires your attention.');
      return;
    }

    const data = {
      token: this.token,
      password: this.form.value,
    }

    this._sharedService.postNoAuth(data, 'user/resetPassword').subscribe((res: IAuthResult) => {
      if(res.statusCode == 200) {
        this._authService.storeCredential(res.data);
        this.doneUpdate = true;  
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again');
      }
    }, error => {
      console.log(error);
      this._toastr.error('Something went wrong. Please try again');
    });
  }
}
