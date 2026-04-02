import { Component, OnInit , OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { validators } from 'src/app/_helpers/form-settings';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  public form: FormControl = new FormControl('', validators.email);
  public isSubmitted: boolean = false;
  public isUploading: boolean = false;
  public isDone: boolean = false;

  constructor(
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'My profile - Change password | PromptHealth',
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if(this.form.invalid) { 
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    this.isUploading = true;
    this._sharedService.post({email: this.form.value}, 'user/resetPassword/generateToken').pipe(takeUntil(this.destroy$)).subscribe((res: IResponseData) => {
      if(res.statusCode == 200) {

        this.isDone = true;  
      } else {
        this._toastr.error('Could not send email. Please try again.');
      }
    }, error => {
      this._toastr.error('Could not send email. Please try again.');
    }, () => {
      this.isUploading = false;
    })
    
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
