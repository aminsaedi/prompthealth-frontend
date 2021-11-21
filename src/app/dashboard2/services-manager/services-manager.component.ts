import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ISaveProfileResult } from 'src/app/models/response-data';
import { IUserDetail } from 'src/app/models/user-detail';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-services-manager',
  templateUrl: './services-manager.component.html',
  styleUrls: ['./services-manager.component.scss']
})
export class ServicesManagerComponent implements OnInit {

  get user() { return this._profileService.profile; }

  public isUploading = false;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit(data: IUserDetail){
    this.isUploading = true;
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: ISaveProfileResult) => {
      this.isUploading = false;

      if (res.statusCode === 200) {
        this._toastr.success('Updated successfully');
        this.user.update(data);
        console.log(this.user)
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again');
      }
    }, error => {
      this.isUploading = false;
      console.log(error)
      this._toastr.error('Something went wrong. Please try again');
    });
  }

}
