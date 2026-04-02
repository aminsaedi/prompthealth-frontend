import { Component, OnInit , OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-subscription',
  templateUrl: './payment-subscription.component.html',
  styleUrls: ['./payment-subscription.component.scss']
})
export class PaymentSubscriptionComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


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
    this._sharedService.post(data, path).pipe(takeUntil(this.destroy$)).subscribe((res: IResponseData) => {

      if (res.statusCode === 200) {
        if (res.data.type === 'portal') {
          location.href = res.data.url;
        }
      } else {
        this.isUploading = false;
        this._toastr.error('Something went wrong. Please try again.');
      }
    }, error => {
      this.isUploading = false;
      this._toastr.error('Something went wrong. Please try again.');      
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
