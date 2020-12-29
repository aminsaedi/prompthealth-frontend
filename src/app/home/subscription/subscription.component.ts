import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit, OnDestroy {


  private _SubcriberObservable: any;
  public subscriptionForm: FormGroup;
  submitted = false;


  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _sharedService: SharedService,
    private spinner: NgxSpinnerService
  ) {
    this.createForm();
  }

  createForm() {
    this.subscriptionForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() { return this.subscriptionForm.controls; }

  ngOnInit(): void {
  }

  onSubmit() {
    this.submitted = true;
    if (!this.subscriptionForm.invalid) {
      this.spinner.show();
      // var data = {
      //   'email': this.email
      // }
      this._SubcriberObservable = this._sharedService.sendEmailSubscribers(this.subscriptionForm.value).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.toastr.success(res.message);

        } else {
          this.toastr.error(res.error.message);
        }
      },
        error => {
          this.spinner.hide();
          this.toastr.error(error);
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this._SubcriberObservable) {
      this._SubcriberObservable.unsubscribe();
    }
  }

}
