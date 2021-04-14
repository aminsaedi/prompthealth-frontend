import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IUserDetail } from 'src/app/models/user-detail';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit {

  public user: IUserDetail;
  public couponCode: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this._route.queryParams.subscribe((data: QueryParams) => {
      if(data.code){
        this.couponCode = data.code;
        sessionStorage.setItem('stripe_coupon_code', data.code);
      }
    });
  }

  logoutAndSignup(role: string){
    this._sharedService.logout();
    this._router.navigate(['/auth/registration', role]);
  }
}

interface QueryParams {
  code?: string;
}