import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'section-subscription',
  templateUrl: './section-subscription.component.html',
  styleUrls: ['./section-subscription.component.scss']
})
export class SectionSubscriptionComponent implements OnInit {

  get f(){ return this.form.controls; }

  private form: FormGroup;
  public isSubmitted: boolean;
  public isSending: boolean;

  constructor(
    _fb: FormBuilder,
    private _uService: UniversalService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) {
    this.form = _fb.group({
			userType: new FormControl('seeker', Validators.required),
      name: new FormControl('subscriber from magazine', validators.firstnameClient),
      email: new FormControl('', validators.email),
      title: new FormControl('', validators.professionalTitle),
      region: new FormControl('not set', Validators.required),
			referrer: new FormControl('other'),
    });
  }

  ngOnInit(): void {
    if(!this._uService.isServer) {
      const ref = this._sharedService.getReferrer();
      console.log(ref);
      this.f.referrer.setValue(ref);
    }
  }

  onSubmit() {
    this.isSubmitted = true;

    if(this.form.invalid) {
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    this.isSubmitted = false;
    this.isSending = true;

    const path = 'clubhouse/create';
		this._sharedService.postNoAuth(this.form.value, path).subscribe((res: any) => {
			if(res.statusCode == 200) {
				this._toastr.success(res.message);
			}else {
				console.log(res);
				let message = res.message;
				if(res.message.match(/^E11000/)){
					message = 'This email is already registered. Please try different email address.';
				} else if(res.message.toLowerCase().match(/not a valid email/)) {
          message = 'Please enter valid email address.'
        }
				this._toastr.error(message);
			}
		}, error => {
			console.log(error);
			this._toastr.error('Something went wrong. Please try again later');
		}, () => {
      this.isSending = false;
    });
  } 
}
