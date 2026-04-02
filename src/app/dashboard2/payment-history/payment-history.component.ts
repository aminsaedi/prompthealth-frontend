import { Component, OnInit , OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get user() { return this._profileService.profile; }

  public transactions: any[];
  public isLoading: boolean = false;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.fetchTransactions();
  }

  fetchTransactions(){
    const path = `user/get-payment-details/${this.user._id}`;
    this.isLoading = true;
    this._sharedService.get(path).pipe(takeUntil(this.destroy$)).subscribe((res: IResponseData) => {
      this.isLoading = false;
      if (res.statusCode === 200) {
        this.transactions = res.data;
      } else {
        this._toastr.error('Something went wrong.');
        this.transactions = [];
      }
    }, error => {
      this.transactions = [];
      this.isLoading = false;
      this._toastr.error('Something went wrong.');
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
