import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { SharedService } from '../../shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  get f() { return this.form.controls; }

  public form: FormGroup;
  public isSubmitted = false;
  public maxMessage = minmax.bookingNoteMax;

  public faqs = faqs;


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
    this.form = new FormGroup({
      name: new FormControl('', validators.contactName),
      email: new FormControl('', validators.contactEmail),
      message: new FormControl('', validators.contactMessage),
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


const faqs: IFAQItem[] = [
  {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
  {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
  {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
  {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
]
