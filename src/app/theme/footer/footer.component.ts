import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ToastrService } from 'ngx-toastr';
// import { SharedService } from '../../shared/services/shared.service';
// import { Router } from '@angular/router';

// declare var FB: any;
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  // email: any;
  constructor(
    // private formBuilder: FormBuilder,
    // private _router: Router,
    // private _sharedService: SharedService,
    // private toastr: ToastrService,
  ) { }

  
  ngOnInit() {
  }

  // route(path, queryParams) {
  //   this._router.navigate([path], { queryParams: queryParams });
  // }

  // subscribe() {
  //   let data = { email: this.email }
  //   if (!this.email || ((this.email.indexOf('@') == -1) && (this.email.indexOf('.') == -1))) {
  //     this._sharedService.showAlert('Please enter valid email id.', 'alert-danger');
  //     return;
  //   }
  //   this._sharedService.loader('show');
  //   this._sharedService.post(data, 'subscription').subscribe((res: any) => {
  //     this._sharedService.loader('hide');
  //     this.email = '';
  //     if (res.success) {
  //       this._sharedService.showAlert(res.data.message, 'alert-success');
  //     } else {
  //       this._sharedService.showAlert(res.error.message, 'alert-danger');
  //     }
  //   }, (error) => { });
  // }
}
