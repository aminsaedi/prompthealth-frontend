import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-my-password',
  templateUrl: './my-password.component.html',
  styleUrls: ['./my-password.component.scss']
})
export class MyPasswordComponent implements OnInit {

  constructor(
    private toastr: ToastrService,
    private _sharedService: SharedService
  ) { }

  public pass = {
    currentpwd: '',
    password: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
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
