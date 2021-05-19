import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

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
  ) { }

  public pass = {
    currentpwd: '',
    password: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Change password | PromptHealth',
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
