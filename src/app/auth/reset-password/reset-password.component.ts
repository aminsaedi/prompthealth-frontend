import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IAuthTempResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from '../../_helpers/form-settings';
import { Auth2Service } from '../auth2.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  public form: FormControl;
  public isSubmitted: boolean = false;
  public isUpdating: boolean = false;
  public doneUpdate: boolean = false;

  constructor(
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _route: ActivatedRoute,
    private _authService: Auth2Service,
  ) { }

  ngOnInit(): void {
    this.form = new FormControl('', validators.password);
  }

  onSubmit() {
    this.isSubmitted = true;
    if(this.form.invalid) {
      this._toastr.error('There is an item that requires your attention.');
      return;
    }

    const data = {
      token: this._route.snapshot.params.token,
      password: this.form.value,
    }

    this._sharedService.postNoAuth(data, 'user/resetPassword').subscribe((res: IAuthTempResult) => {
      this._authService.storeCredential(res);
      this.doneUpdate = true;
    }, error => {
      console.log(error);
      this._toastr.error('Something went wrong. Please try again');
    });
  }
}
