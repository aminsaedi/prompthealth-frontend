import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SharedService } from '../../shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { validators } from 'src/app/_helpers/form-settings';
import { IResponseData } from 'src/app/models/response-data';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public isSubmitted = false;
  public isUploading = false;
  public isDone = false;

  public form: FormControl = new FormControl('', validators.email);

  constructor(

    private _toastr: ToastrService,
    private _router: Router,
    private _sharedService: SharedService,
    private _uService: UniversalService,  
  ) { }

  ngOnInit() {
    this._sharedService.sendTop();

    this._uService.setMeta(this._router.url, {
      title: 'Forgot password? | PromptHealth',
    });
  }

  submit() {
    this.isSubmitted = true;

    if (this.form.invalid) {
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    this.isUploading = true;
    this._sharedService.postNoAuth({email: this.form.value}, 'user/resetPassword/generateToken').subscribe((res: IResponseData) => {
      this.isUploading = false;
      if (res.statusCode === 200) {
        this.isDone = true;
      } else {
        console.log(res.message);
        this._toastr.error('Could not send email. Please try again.');
      }
    }, (error) => {
      this.isUploading = false;
      console.log(error);
      this._toastr.error('Could not send email. Please try again.');
    });
  }
}
