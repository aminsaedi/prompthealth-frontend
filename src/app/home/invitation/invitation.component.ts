import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IUserDetail } from 'src/app/models/user-detail';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit {

  public user: IUserDetail;
  public couponCode: string;
  public couponData;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _toaster: ToastrService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Welcome to PromptHealth',
      description: 'We are inviting you with coupon that gives you discount.',
    });

    this.user = JSON.parse(localStorage.getItem('user'));
    this._route.queryParams.subscribe((data: QueryParams) => {
      if (data.code) {
        this.couponCode = data.code;

        this._sharedService.get('user/get-coupon/' + this.couponCode).subscribe((res: any) => {
          sessionStorage.setItem('stripe_coupon_code', JSON.stringify(res.data));
          this.couponData = res.data;
        }, error => {
          console.error(error);
          this._router.navigate(['/404'], { replaceUrl: true });
          this._toaster.error('The coupon is invalid');
        });
      } else {
        this._router.navigate(['/404'], { replaceUrl: true });
      }
    });
  }

  logoutAndSignup(role: string) {
    this._sharedService.logout();
    this._router.navigate(['/auth/registration', role]);
  }
}

interface QueryParams {
  code?: string;
}
