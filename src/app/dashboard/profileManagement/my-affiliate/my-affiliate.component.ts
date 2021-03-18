import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-my-affiliate',
  templateUrl: './my-affiliate.component.html',
  styleUrls: ['./my-affiliate.component.scss']
})
export class MyAffiliateComponent implements OnInit {
  affiliateRequestForm: FormGroup;
  submitted = false;
  affiliatedList = [];

  constructor(
    private formBuilder: FormBuilder,
    private _sharedService: SharedService,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  get f() { return this.affiliateRequestForm.controls; }
  ngOnInit(): void {
    this.affiliateRequestForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', []],
      email: ['', [Validators.required, Validators.email]],
      role: ['SP', [Validators.required]],
    });
    this.getListOfAffiliateUsers();
  }

  addAffiliateUser() {
    this.submitted = true;
    if (this.affiliateRequestForm.invalid) {
      return;
    } else {
      this.submitted = true;
      const data = this.affiliateRequestForm.value;
      data.isVipAffiliateUser = false;
      data.addedBy = localStorage.getItem('loginID');
      this._sharedService.loader('show');
      const path = 'user/request';
      this._sharedService.postNoAuth(data, path).subscribe((res: any) => {
        this._sharedService.loader('hide');
        // console.log(res.statusCode);
        if (res.statusCode === 200) {
          this.toastr.success('Invitation sent successfully!');
          this.affiliateRequestForm.reset();
          this.submitted = false;
          this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/dashboard/profilemanagement/my-affiliate']);
          });

        } else {
          this.toastr.error(res.message);
          this._sharedService.showAlert(res.message, 'alert-danger');
        }
      }, (error) => {
        this.toastr.error(error);
        this._sharedService.loader('hide');
      });
    }
  }

  getListOfAffiliateUsers() {
    const path = 'user/get-affiliate-request?count=10&page=1&search=';
    this._sharedService.get(path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.affiliatedList = res.data.data;
        // this.toastr.success(res.message);
      } else {
        this._sharedService.showAlert(res.message, 'alert-danger');
      }
    }, (error) => {
      this._sharedService.loader('hide');
    });
  }

}
