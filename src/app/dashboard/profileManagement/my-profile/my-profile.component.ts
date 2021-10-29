import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { BehaviorService } from '../../../shared/services/behavior.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { ProfileManagementService } from '../profile-management.service';
import { IUserDetail } from 'src/app/models/user-detail';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {

  public defaultImage = 'assets/img/no-image.jpg';
  public submitted = false;
  public editFields = false;

  public AWS_S3 = '';

  public profile: IUserDetail;

  closeResult: string;
  modalref: any;

  constructor(
    private toastr: ToastrService,
    private _bs: BehaviorService,
    private _sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Edit profile | PromptHealth',
    });
    
    this.AWS_S3 = environment.config.AWS_S3;
    const userInfo = JSON.parse(localStorage.getItem('user'));
    this.profile = await this._profileService.getProfileDetail(userInfo);
  }

  updateFields() { this.editFields = !this.editFields; }

  onSubmit(data: IUserDetail) {
    this._sharedService.loader('show');
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.profile = res.data;
        this.toastr.success(res.message);
        this.editFields = false;
        this._profileService.update(data);
        
        this._changeDetector.detectChanges();
        this._bs.setUserData(res.data);

      } else {
        console.log(res);
        this.toastr.error(res.message);
      }
    }, err => {
      this._sharedService.loader('hide');
      console.log(err);
      this.toastr.error('There are some errors, please try again after some time !', 'Error');
    });
  }

  onChangeImage(imageURL: string) {
    this._bs.setUserDataOf('profileImage', imageURL);
  }


  // deleteProfile(content) {
  //   this.modalref = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'sm' });
  //   this.modalref.result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //   });
  // }

  removeProfile() {
    this.spinner.show();
    const data = {
      id: this.profile._id,
      status: 'false'
    };
    this._sharedService.removeProfile(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.modalref.close();
        this.toastr.success('User deactivated successfully!');
        this._sharedService.logout();
      } else {
        this.toastr.error(res.message);
      }

    },
      err => {
        this.spinner.hide();
        this.toastr.error(err);
      }
    );
  }

  trim(key) {
    if (this.profile[key] && this.profile[key][0] == ' ') this.profile[key] = this.profile[key].trim();
  }
}
