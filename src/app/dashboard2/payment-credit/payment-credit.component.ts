import { Component, OnInit , OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-credit',
  templateUrl: './payment-credit.component.html',
  styleUrls: ['./payment-credit.component.scss']
})
export class PaymentCreditComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();

  
  get user() { return this._profileService.profile; }
  get endingBalance() { return this.credits ? this.credits[0].ending_balance : 0}
  get currency() { return this.credits ? this.credits[0]?.currency.toUpperCase() : null; }
  
  createdAtOf(timestamp: number) {
    return new Date(timestamp * 1000);
  }

  creditOf(amount: number) {
    return - amount / 100;
  }


  public credits: any[];
  public isLoading: boolean = false;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.getMyBalance();
  }

  getMyBalance() {
    const path = `user/get-balance/${this.user._id}`;
    this.isLoading = true;
    this._sharedService.get(path).pipe(takeUntil(this.destroy$)).subscribe((res: IResponseData) => {
      this.isLoading = false;
      if (res.statusCode === 200) {
        this.credits = res.data.data;
      } else {
        this._toastr.error('Something went wrong.');
        this.credits = [];
      }
    }, error => {
      this.credits = [];
      this.isLoading = false;
      this._toastr.error('Something went wrong.');
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
