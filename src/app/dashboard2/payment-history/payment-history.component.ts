import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {

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
    this._sharedService.get(path).subscribe((res: IResponseData) => {
      this.isLoading = false;
      if (res.statusCode === 200) {
        this.transactions = res.data;
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong.');
        this.transactions = [];
      }
    }, error => {
      this.transactions = [];
      this.isLoading = false;
      console.log(error)
      this._toastr.error('Something went wrong.');
    });
  }

}
