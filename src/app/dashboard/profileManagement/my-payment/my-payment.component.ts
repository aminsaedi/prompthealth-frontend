import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-my-payment',
  templateUrl: './my-payment.component.html',
  styleUrls: ['./my-payment.component.scss']
})
export class MyPaymentComponent implements OnInit {
  transactionList = [];
  balanceList = [];
  currentPage;
  totalItems;
  pageSize: 10;
  constructor(
    private sharedService: SharedService,
    private _router: Router,
    private _uService: UniversalService,  
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Payment history | PromptHealth',
    });    
    
    this.getMyTransactions();
    this.getMyBalance();
  }
  getMyTransactions() {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const path = `user/get-payment-details/${userInfo._id}`;
    this.sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.transactionList = res.data;
        this.totalItems = this.transactionList;
      } else {
        this.sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this.sharedService.checkAccessToken(err);
    });

  }
  getMyBalance() {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const path = `user/get-balance/${userInfo._id}`;
    this.sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.balanceList = res.data.data;
        // console.log(this.balanceList);
      } else {
        this.sharedService.checkAccessToken(res.message);
      }
    }, err => {
      this.sharedService.checkAccessToken(err);
    });

  }
}
