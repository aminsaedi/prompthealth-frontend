import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { Professional } from 'src/app/models/professional';
import { IGetProfileResult, IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-tag-provider',
  templateUrl: './tag-provider.component.html',
  styleUrls: ['./tag-provider.component.scss']
})
export class TagProviderComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get centreId() { return this._route.snapshot.params.id; }

  public centre: Professional;
  public isLoading: boolean;
  public isTaggedDone: boolean = false;
  public isTaggedSuccess: boolean;
  public errorMessageTagged: string;


  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _toastr: ToastrService,
  ) { }

  private subscriptionLoginStatus: Subscription;

  ngOnDestroy() {
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.observeLoginStatus()
  }

  observeLoginStatus() {
    const status = this._profileService.loginStatus;
    if(status == 'notLoggedIn' || status == 'loggedIn') {
      this.onChangeLoginStatus();
    } else {
      this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe((status) => {
        this.onChangeLoginStatus();
      });  
    }
  }

  async onChangeLoginStatus() {
    const status = this._profileService.loginStatus;
    if (status == 'notLoggedIn') {
      this._toastr.error('Please login to complete this process');
      this._uService.sessionStorage.setItem('tag_by_centre', this.centreId);
      this._router.navigate(['/auth/login'], {queryParams: {next: this._location.path()}, replaceUrl: true});
    } else if(status == 'loggedIn') {
      if(this.subscriptionLoginStatus) {
        this.subscriptionLoginStatus.unsubscribe();
      }

      if (!this.user.isSP) {
        this._toastr.error('Your account type cannot access this page');
        this._router.navigate(['/community'], {replaceUrl: true});
      } else {
        try {
          await this.fetchCentre();
        } catch (error) {
          this.isLoading = false;
          this._router.navigate(['/404'], {replaceUrl: true});
        } finally {
          this.isLoading = false;
        }
      }
    }
  }

  async onClickJoinTeam() {
    this.isLoading = true;
    try {
      await this.connectStaff();
      this.isTaggedSuccess = true;
    } catch (error) {
      this.isTaggedSuccess = false;
      this.errorMessageTagged = error;
    } finally {
      this.isLoading = false;
      this.isTaggedDone = true;
    }
  }

  fetchCentre(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._sharedService.get('user/get-profile/' + this.centreId).subscribe((res: IGetProfileResult) => {
        if(res.statusCode == 200) {
          const profile = new Professional(res.data._id, res.data);
          if (profile.isC) {
            this.centre = profile;
            resolve();
          } else {
            reject();
          }
        } else{
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      });
    });
  }

  connectStaff(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._sharedService.post({},'staff/create/' + this.centreId).subscribe((res: IResponseData) => {
        if(res.statusCode == 200) { 
          resolve();
        } else{
          reject(res.message);
        }
      }, error => {
        console.log(error);
        reject('Something went wrong. Please try again later');
      });  
    });
  }

}
