import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-payment-subscription',
  templateUrl: './payment-subscription.component.html',
  styleUrls: ['./payment-subscription.component.scss']
})
export class PaymentSubscriptionComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get linkToPlan() {
    const link = ['/plans'];
    if(this.user.isP) {
      link.push('product');
    }
    return link;
  }
  
  public isUploading: boolean = false;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
  }

  goStripe() {
    const data = {
      return_url: location.href,
      userId: this.user._id,
      userType: this.user.role,
      email: this.user.email,
    };
    const path = `user/customer-portal`;
    this.isUploading = true;
    this._sharedService.post(data, path).subscribe((res: IResponseData) => {

      if (res.statusCode === 200) {
        if (res.data.type === 'portal') {
          console.log(res.data);
          location.href = res.data.url;
        }
      } else {
        console.log(res.message);
        this.isUploading = false;
        this._toastr.error('Something went wrong. Please try again.');
      }
    }, error => {
      console.log(error);
      this.isUploading = false;
      this._toastr.error('Something went wrong. Please try again.');      
    });
  }
}
