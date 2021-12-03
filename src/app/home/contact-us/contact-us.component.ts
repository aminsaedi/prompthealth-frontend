import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SharedService } from '../../shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  get f() { return this.form.controls; }

  public form: FormGroup;
  public isSubmitted = false;
  public isUploading = false;
  public maxMessage = minmax.bookingNoteMax;

  // public faqs = faqs;

  constructor(
    private _toastr: ToastrService,
    private _router: Router,
    private _sharedService: SharedService,
    private _uService: UniversalService,
  ) { }

  ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Contact us | PromptHealth',
      description: 'Do you have questions about our service or our app? Feel free to contact us!',
    });
    this.form = new FormGroup({
      name: new FormControl('', validators.contactName),
      email: new FormControl('', validators.contactEmail),
      message: new FormControl('', validators.contactMessage),
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if(this.form.invalid) {
      this._toastr.error('There are items that require your attention');
      return;
    }

    this.isUploading = true;
    this._sharedService.postNoAuth(this.form.value, 'user/contactus').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this._toastr.success(res.message);
        this.isSubmitted = false;
      } else {
        this._toastr.error(res.error.message);
      }
    }, error => {
      console.log(error);
      this._toastr.error('There are some error please try after some time');
    }, () => {
      this.isUploading = false;
    });

  }
}


// const faqs: IFAQItem[] = [
//   {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
//   {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
//   {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
//   {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
// ]
