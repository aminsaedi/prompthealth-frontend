import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SharedService } from '../../shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UniversalService } from 'src/app/shared/services/universal.service';
const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  submitted = false;
  professionalOption = false;
  public email;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _router: Router,
    private _sharedService: SharedService,
    private _uService: UniversalService,  
  ) { }
  get ff() { return this.forgotForm.controls; }

  ngOnInit() {
    this._sharedService.sendTop();
    this.forgotForm = this.formBuilder.group({

      email: ['', [Validators.required, Validators.pattern(re)]],

    });

    this._uService.setMeta(this._router.url, {
      title: 'Forgot password? | PromptHealth',
    });
  }

  submit() {
    this.submitted = true;

    if (this.forgotForm.invalid) {
      return;
    } else {
      this.submitted = true;
      const data = JSON.parse(JSON.stringify(this.forgotForm.value));

      this._sharedService.loader('show');
      this._sharedService.postNoAuth(data, 'user/forgotpassword').subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {
          this.toastr.success(res.message);
          this._router.navigate(['/auth/login']);

        } else {
          this._sharedService.loader('hide');
          // if (res.success == false)
          this.toastr.error(res.message);

        }

      }, (error) => {
        this.toastr.error(error);
        this._sharedService.loader('hide');
        // this.toastr.error("There are some error please try after some time.");
      });
    }
  }
  handleChange(url) {

    this._router.navigate([url]);
  }


  // validateEmail(email) {
  //     var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //     return re.test(String(email).toLowerCase());
  // }

}
