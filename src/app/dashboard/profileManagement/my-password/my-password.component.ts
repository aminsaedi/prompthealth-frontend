import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { validators } from 'src/app/_helpers/form-settings';
import { MustMatch } from 'src/app/_helpers/must-match.validator';

@Component({
  selector: 'app-my-password',
  templateUrl: './my-password.component.html',
  styleUrls: ['./my-password.component.scss']
})
export class MyPasswordComponent implements OnInit {

  constructor(
    private toastr: ToastrService,
    private _sharedService: SharedService,
    private _router: Router,
    private _uService: UniversalService,
    private _fb: FormBuilder,
  ) { }

  public pass = {
    currentpwd: '',
    password: '',
    confirmPassword: ''
  };

  get f() { return this.form.controls; }
  public form: FormGroup;
  public isSubmitted: boolean = false;
  public isLoading: boolean = false;

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Change password | PromptHealth',
    });

    this.form = this._fb.group({
      'currentpwd': new FormControl('', validators.passwordOld),
      'password': new FormControl('', validators.password),
      'confirmPassword': new FormControl(''),
    }, { validator: MustMatch('password', 'confirmPassword') });
  }

  onSubmit() {
    this.isSubmitted = true;
    if(this.form.invalid) {
      this.toastr.error('There are several items that requires your attention.');
      return;
    }

    this.isLoading = true;
    this._sharedService.post(this.form.value, '/user/change-password').subscribe((res) => {
      this.isLoading = false;
      if(res.statusCode === 200) {
        this.isSubmitted = false;
        this.toastr.success(res.message);
      } else {
        this.toastr.error(res.message);
      }
    }, error => {
      this.isLoading = false;
      this.toastr.error(error);
    });
    
  }

  changePassword(event) {
    if (this.pass.password !== this.pass.confirmPassword) {
      this.toastr.error('Confirm password must match your new password');
      return;
    }
    this._sharedService.post(this.pass, '/user/change-password').subscribe((res) => {
      this.toastr.success(res.message);
    }, error => {
      this.toastr.error(error);
    });
  }
}
