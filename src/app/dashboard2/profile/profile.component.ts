import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ISaveProfileResult } from 'src/app/models/response-data';
import { IUserDetail } from 'src/app/models/user-detail';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  get user() { return this._profileService.profile; }

  public isUploading = false; 

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
  }

  onSubmit(data: IUserDetail) {
    this.isUploading = true;
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: ISaveProfileResult) => {
      this.isUploading = false;
      if (res.statusCode === 200) {
        this._toastr.success('Updated successfully');
        this.user.update(data);
      } else {
        this._toastr.error(res.message);
      }
    }, error => {
      console.log(error);
      this.isUploading = false;
      this._toastr.error('Something went wrong. Please try again');
    }, () => {
      this._changeDetector.detectChanges();
    });
  }

}
