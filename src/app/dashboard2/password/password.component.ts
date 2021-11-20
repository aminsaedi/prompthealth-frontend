import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {

  public form: FormControl = new FormControl('', validators.email);
  public isSubmitted: boolean = false;
  public isUploading: boolean = false;
  public isDone: boolean = false;

  constructor(
    private _toastr: ToastrService,
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.isSubmitted = true;
    if(this.form.invalid) { 
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    this.isUploading = true;
    this._sharedService.post({email: this.form.value}, 'user/resetPassword/generateToken').subscribe((res: IResponseData) => {
      if(res.statusCode == 200) {

        this.isDone = true;  
      } else {
        console.log(res.message);
        this._toastr.error('Could not send email. Please try again.');
      }
    }, error => {
      console.log(error);
      this._toastr.error('Could not send email. Please try again.');
    }, () => {
      this.isUploading = false;
    })
    
  }

}
