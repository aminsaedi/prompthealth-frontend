import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { SharedService } from '../../shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  contactForm: FormGroup;
  submitted = false;

  public email

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sharedService: SharedService,
    private _uService: UniversalService,
  ) { }
  get ff() { return this.contactForm.controls; }

  ngOnInit() {
    // this._sharedService.sendTop();
    this._uService.setMeta(this._router.url, {
      title: 'Contact us | PromptHealth',
      description: 'Do you have questions about our service or our app? Feel free to contact us!',
    });
    this.contactForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      message: ['', [Validators.required]],

    });
  }

  submit() {
    debugger
    this.submitted = true;

    if (this.contactForm.invalid) {
      return;
    }
    else {
      this.submitted = true;
      let data = this.contactForm.value;

      this._sharedService.loader('show');
      this._sharedService.postNoAuth(data, 'user/contactus').subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode===200) {
          this.toastr.success(res.message);
          this._router.navigate(['/']);

        } else {
          this._sharedService.loader('hide');
          if (res.success == false)
            this.toastr.error(res.error.message);

        }

      }, (error) => {
        this.toastr.error("There are some error please try after some time.");
      });
    }
  }



}
