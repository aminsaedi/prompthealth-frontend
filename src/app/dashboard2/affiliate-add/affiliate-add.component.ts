import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'app-affiliate-add',
  templateUrl: './affiliate-add.component.html',
  styleUrls: ['./affiliate-add.component.scss']
})
export class AffiliateAddComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get f() { return this.formEditor.controls; }


  public formEditor: FormGroup;
  public minmax = minmax;
  public isEditorSubmitted: boolean = false;
  public isUploading: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.formEditor = new FormGroup({
      firstName: new FormControl('', validators.nameProvider),
      lastName: new FormControl(''),
      email: new FormControl('', validators.email),
      role: new FormControl('SP'),
    });
  }

  onSubmitEditor() {
    this.isEditorSubmitted = true;
    if (this.formEditor.invalid) {
      this._toastr.error('There are some items that require your attention');
      return;
    } else {

      const data = this.formEditor.value;
      data.isVipAffiliateUser = false;
      data.addedBy = this.user._id;

      const path = 'user/request';
      this.isUploading = true;
      this._sharedService.postNoAuth(data, path).subscribe((res: IResponseData) => {
        this.isUploading = false;

        if (res.statusCode === 200) {
          this.isEditorSubmitted = false;
          this._toastr.success('Invitation sent successfully.');
          this.formEditor.reset();
        } else {
          this._toastr.error(res.message);
        }
      }, error => {
        this.isUploading = false;
        this._toastr.error(error);
      });
    }
  }

}
