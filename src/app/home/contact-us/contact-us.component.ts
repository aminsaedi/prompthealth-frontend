import { Component, OnInit , OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { SharedService } from '../../shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


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
    this._sharedService.postNoAuth(this.form.value, 'user/contactus').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.isUploading = false;
      if (res.statusCode === 200) {
        this._toastr.success(res.message);
        /* Explicit '', because reset() alone sets null, which the server's
         * string rules reject on the next message. */
        this.form.reset({ name: '', email: '', message: '' });
        this.isSubmitted = false;
      } else {
        /* A service error answers 200 with failAction, which has no `error`
         * field: reading res.error.message threw here, so the visitor saw no
         * toast and the button stayed disabled. */
        this._toastr.error(res.message || 'Your message was not sent. Please try again.');
      }
    }, error => {
      /* complete() never runs after an error, and it was the only place that
       * enabled the button again. ErrorInterceptor has already reduced the
       * response to the server's message, so its wording (a validation rule,
       * the rate limit) is what the visitor sees. */
      this.isUploading = false;
      this._toastr.error(typeof error === 'string' && error ? error : 'Your message was not sent. Please try again.');
    });

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


// const faqs: IFAQItem[] = [
//   {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
//   {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
//   {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,},
//   {q: 'What is the center plan?', a: 'Celine Spino loves to cook and dine out. But a few years ago, the New Jersey accountant and mother of two decided she was doing a little too much of the latter. A lack of time and planning made restaurant dining the easier option on many nights, yet eating out meant she couldn\'t exercise much control over her family\'s nutrition. So Celine began planning meals ahead of time to ensure that home cooking was on the menu almost every night.', opened: false,
// },
// ]
