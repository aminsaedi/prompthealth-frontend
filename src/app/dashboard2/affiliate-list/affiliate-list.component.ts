import { Component, OnInit , OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-affiliate-list',
  templateUrl: './affiliate-list.component.html',
  styleUrls: ['./affiliate-list.component.scss']
})
export class AffiliateListComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get user() { return this._profileService.profile; }

  fullnameOf(data: IAffilateUser) { 
    return (
      data.firstName?.charAt(0)?.toUpperCase() + data.firstName?.slice(1) + ' ' + 
      data.lastName?.charAt(0)?.toUpperCase() + data.lastName?.slice(1)
    ).trim(); 
  }
  
  public affiliateUsers: IAffilateUser[];
  
  
  public isLoading: boolean = false;
  constructor(
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.fetchAffiliateUsers();
  }

  fetchAffiliateUsers() {
    const path = 'user/get-affiliate-request?count=10&page=1&search=';
    this.isLoading = true;
    this._sharedService.get(path).pipe(takeUntil(this.destroy$)).subscribe((res: IResponseData) => {
      this.isLoading = false;
      if (res.statusCode === 200) {
        this.affiliateUsers = (res.data.data as IAffilateUser[]);
      } else {
        this.isLoading = false;
        this.affiliateUsers = [];
        this._toastr.error('Something went wrong.');
      }
    }, (error) => {
      this.isLoading = false;
      this.affiliateUsers = [];
      this._toastr.error('Something went wrong.');
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


interface IAffilateUser {
  firstName: string;
  lastName: string;
  role: 'SP' | 'C';
  email: string;
}