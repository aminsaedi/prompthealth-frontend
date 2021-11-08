import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { ProfileManagementService } from '../profile-management.service';
import { ICreateStaffResult, IGetStaffsResult, IResponseData } from 'src/app/models/response-data';
import { ModalService } from 'src/app/shared/services/modal.service'
import { IStaff, Staff } from 'src/app/models/staff';

@Component({
  selector: 'app-add-professional',
  templateUrl: './add-professional.component.html',
  styleUrls: ['./add-professional.component.scss']
})
export class AddProfessionalComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get linkToTagStaff() { return this.urlBase + '/join-team/' + this.user._id };
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

  public staffs: Staff[] = null;
  public isLoading = false;
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
  
  // public form = new FormControl('', validators.email);
  // public isSubmitted = false;
  // onSubmitEmail(){
  //   this.isSubmitted = true;
  //   if(this.form.invalid) {
  //     return;
  //   }
  //   this._sharedService.post({email: this.form.value}, 'staff/create').subscribe((res) => {
  //     console.log(res);
  //   });
  // }

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
        this.staffs = res.data.map(item => new Staff(item) );
        console.log(this.staffs);
      } else {
        this.staffs = [];
      }
    }, err => {
      console.log(err);
      this.isLoading = false;
      this.staffs = [];
    });
  }

  initEditor(data: Staff = null) {
    const d = data?.decode() || null;
    this.formEditor = new FormGroup({
      firstName: new FormControl(d ? d.firstName : null, validators.firstnameClient),
      profileImage: new FormControl(d ? d.profileImage : null),
      product_description: new FormControl(d ? d.product_description : null, validators.staffDescription),
      professional_title: new FormControl(d ? d.professional_title : null, validators.professionalTitle),
    });

    this._modalService.show('staff-editor', data);
  }

  showMenu(staff: Staff) {
    this._modalService.show('staff-menu', staff);
  }

  removeStaff(staff: Staff) {
    this._modalService.hide();

    this.isUploading = true;
    const path = staff.isStatic ? 'staff/' + staff._id : 'staff/delete/' + staff.staffId;
    this._sharedService.deleteContent(path).subscribe((res: IResponseData) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this._toastr.success('Removed this member successfully');
        const idxStaff = this.staffs.findIndex(item => item._id == staff._id);
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
          this.staffs?.push(new Staff(res.data));
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