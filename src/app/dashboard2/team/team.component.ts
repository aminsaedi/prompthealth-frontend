import { Component, ElementRef, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ICreateStaffResult, IGetStaffsResult, IResponseData } from 'src/app/models/response-data';
import { Staff } from 'src/app/models/staff';
import { ModalStateType } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get selectedStaff(): Staff { return this._modalService.data; }

  get fEditor() { return this.formEditor.controls; }
  get staffImageInEditor() {
    const img = this.staffImageTemp ? 
      this.staffImageTemp :
      this.fEditor.profileImage?.value ? 
        (environment.config.AWS_S3 + this.fEditor.profileImage.value) : 
        null; 
    return img;
  }

  public isUploading = false;
  public isStaffImageUploading: boolean = false;

  public formEditor: FormGroup;
  public minmax = minmax;
  public isEditorSubmitted: boolean = false;
  public staffImageTemp: string;

  @ViewChild('inputStaffImage') private inputStaffImage: ElementRef;

  constructor(
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
  ) { }
 
  ngOnInit(): void {
  }

  onModalEditorStateChanged(state: ModalStateType) {
    if(state == 'open') {
      this.initEditor(this.selectedStaff);
    }
  }

  initEditor(data: Staff = null) {
    const d = data?.decode() || null;
    this.formEditor = new FormGroup({
      firstName: new FormControl(d ? d.firstName : null, validators.firstnameClient),
      profileImage: new FormControl(d ? d.profileImage : null),
      product_description: new FormControl(d ? d.product_description : null, validators.staffDescription),
      professional_title: new FormControl(d ? d.professional_title : null, validators.professionalTitle),
    });
  }

  removeStaff(staff: Staff) {
    this._modalService.hide();

    this.isUploading = true;
    const path = staff.isStatic ? 'staff/' + staff._id : 'staff/delete/' + staff.staffId;
    this._sharedService.deleteContent(path).subscribe((res: IResponseData) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this._toastr.success('Removed this member successfully');
        this.user.removeStaff(staff);
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

  onClickStaffImage() {
    (this.inputStaffImage.nativeElement as HTMLInputElement)?.click();
  }

  onChangeStaffImage(image: string) {
    // console.log(image);
    this.staffImageTemp = image;
  }

  onStartUploadStaffImage() {
    this.isStaffImageUploading = true;
  }

  onFailUploadStaffImage() {
    this.isStaffImageUploading = false;
    this.staffImageTemp = null;
    this._toastr.error('Could not upload image. Please try again');
  }

  onDoneUploadStaffImage(image: string) {
    this.isStaffImageUploading = false;
    this.staffImageTemp = null;
    this.fEditor.profileImage.setValue(image);
  }

  removeStaffImage() {
    this.fEditor.profileImage.setValue(null);
    this.staffImageTemp = null;
  }

  onSubmitEditor() {
    this.isEditorSubmitted = true;
    if(this.formEditor.invalid) {
      this._toastr.error('There are some items that require your attention.');
      return;
    }

    this.isUploading = true;
    const path = this.selectedStaff ? `staff/update-static/${this.selectedStaff._id}` : 'staff/create-static';
    this._sharedService.post(this.formEditor.value, path).subscribe((res: ICreateStaffResult) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        if(this.selectedStaff) {
          this.selectedStaff.updateWith(res.data);
        } else {
          this.user.setStaff(res.data);
        }

        this._toastr.success(this.selectedStaff ? 'Updated successfully' : 'Saved successfully');
        this._modalService.hide();
        this.isEditorSubmitted = false;

      } else {
        console.log(res.message);
        this._toastr.error('Something wrong. Please try again.');
      }
    }, error => {
      console.log(error);
      this.isUploading = false;
      this._toastr.error('Something wrong. Please try again.');
    });
  }

}
