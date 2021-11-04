import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { validators } from 'src/app/_helpers/form-settings';
import { ProfileManagementService } from '../profile-management.service';
import { Professional } from 'src/app/models/professional';
import { IUserDetail } from 'src/app/models/user-detail';
import { IGetStaffsResult, IResponseData } from 'src/app/models/response-data';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-add-professional',
  templateUrl: './add-professional.component.html',
  styleUrls: ['./add-professional.component.scss']
})
export class AddProfessionalComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get linkToTagStaff() { return this.urlBase + '/join-team/' + this.user._id };
  get selectedStaff(): Professional { return this._modalService.data; }

  public staffs: Professional[] = null;
  public isLoading = false;
  public isUploading = false;

  constructor(
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _router: Router,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
  ) { }

  private urlBase = environment.config.FRONTEND_BASE;

  
  public isTipShareLinkShown: boolean = false;
  public isTipInviteShown: boolean = false;
  toggleStateTipShareLink() {
    this.isTipShareLinkShown = !this.isTipShareLinkShown;
  }
  toggleStateTipInvite() {
    this.isTipInviteShown = !this.isTipInviteShown;
  }
  
  public form = new FormControl('', validators.email);
  public isSubmitted = false;
  onSubmitEmail(){
    this.isSubmitted = true;
    if(this.form.invalid) {
      return;
    }
    this._sharedService.post({email: this.form.value}, 'staff/create').subscribe((res) => {
      console.log(res);
    });
  }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Manage professionals | PromptHealth',
    });
    
    this.getStaffList();
  }

  getStaffList() {
    const path = `staff/get-by-center/${this.user._id}`;
    this.isLoading = true;
    this._sharedService.getNoAuth(path).subscribe((res: IGetStaffsResult) => {
      this.isLoading = false;
      if (res.statusCode === 200) {
        this.staffs = res.data.map(item => new Professional(item.userId._id, item.userId));
      } else {
        this.staffs = [];
      }
    }, err => {
      console.log(err);
      this.isLoading = false;
      this.staffs = [];
    });
  }

  showMenu(staff: Professional) {
    this._modalService.show('staff-menu', staff);
  }

  removeStaff(staff: Professional) {
    this._modalService.hide();

    this.isUploading = true;
    this._sharedService.deleteContent('staff/delete/' + staff._id).subscribe((res: IResponseData) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this._toastr.success('Removed this member successfully');
        const idxStaff = this.staffs.findIndex(item => item.id == staff._id);
        this.staffs.splice(idxStaff, 1);
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again');
      }
    }, error => {
      console.log(error);
      this.isUploading = false;
      this._toastr.error('Something went wrong. Please try again');
    });
  }
}
