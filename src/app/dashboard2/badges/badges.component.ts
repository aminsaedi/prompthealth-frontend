import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { ModalStateType } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-badges',
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get selectedCertificate() { return this._modalService.data; }
  get fEditor() { return this.formEditor.controls; }
  get verifiedBadgeStatus() {
    let status: badgeStatusType = null;
    if(this.user.eligibleToManageBadge) {
      status = this.user.isVerified ? 
        'approved' :
        this.certificateForVerifiedBadge ?
          'pending' :
          'notApplied';
    }
    return status;
  }

  get verifiedBadgeStatusFormatted() {
    let status = null;
    switch(this.verifiedBadgeStatus){
      case 'approved':   status = 'Approved'; break;
      case 'pending':    status = 'Waiting approval'; break;
      case 'notApplied': status = 'Not applied yet'; break;
    }
    return status;
  }
  
  get verifiedBadgeStatusIcon() {
    let icon = null;
    switch(this.verifiedBadgeStatus) {
      case 'approved':   icon = 'check-circle'; break;
      case 'pending':    icon = 'alert-circle'; break;
      case 'notApplied': icon = 'minus-circle'; break;
    }
    return icon;
  }

  filenameOf(i: number) {
    const file: string | File = this.fEditor.certificateFiles.value[i];
    return typeof file == 'string' ? file.replace('certificates/', '').substr(18) : file.name;
  }
  isFileDownloadable(i: number) {
    const file: string | File = this.fEditor.certificateFiles.value[i];
    return typeof file == 'string'
  }

  public formEditor: FormGroup;
  public minmax = minmax;
  public isEditorSubmitted: boolean = false;
  public isLoadingVerifiedBdage: boolean = false;
  public isUploading: boolean = false;
  public isUploadingFile: boolean = false;

  public certificateForVerifiedBadge: ICertificate = null;

  public s3 = environment.config.AWS_S3;

  @ViewChild('modalBadgeEditor') private modalBadgeEditor: ElementRef; 
  @ViewChild('inputFile') private inputFile: ElementRef;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _modalService: ModalService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    if(this.user.eligibleToManageBadge && !this.user.isVerified) {
      this.fetchCertificateForVerifiedBadge();
    }
  }

  fetchCertificateForVerifiedBadge() {
    this.isLoadingVerifiedBdage = true;
    this._sharedService.get('certificate/get-by-userid/' + this.user._id).subscribe((res: IResponseData) => {
      this.isLoadingVerifiedBdage = false;
      if (res.statusCode === 200) {
        const data = res.data as ICertificate[];
        if(data?.length > 0) {
          this.certificateForVerifiedBadge = data[0];
        }
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again.');
      }
    }, error => {
      console.log(error);
      this.isLoadingVerifiedBdage = false;
      this._toastr.error('Something went wrong. Please try again.');
    });
  }

  showMenu(data: ICertificate) {
    this._modalService.show('badge-menu', data);
  }

  showEditor(data: ICertificate = null) {
    this._modalService.show('badge-editor', data);
  }

  onModalEditorStateChanged(state: ModalStateType) {
    this.isEditorSubmitted = false;

    if(state == 'open') {
      this.initEditor(this.selectedCertificate);
    } else {
      this.formEditor = null;
    }
  }
  initEditor(data: ICertificate = null) {
    this.formEditor = new FormGroup({
      title: new FormControl( data ? data.title : '', validators.certificateTitle),
      description: new FormControl( data ? data.description : '', validators.certificateDescription),
      certificateFiles: new FormControl( data ? Array.from(data.certificateFiles) : [], validators.certificateFiles),
    });
  }

  onClickAddFile() {
    this.inputFile.nativeElement?.click();
  }

  onSelectFile(e: Event) { 
    const files = (e.target as HTMLInputElement).files;
    const file = files?.length > 0 ? files[0] : null;
    if(!file) {
      console.log('file is not selected.');
      return;
    } else if(file.size > 10 * 1000 * 1000) /** 10MB */ {
      this._toastr.error('File size is too big. Please shink less than 10MB');
      return;
    }

    if(this.selectedCertificate) {
      //upload imediately
      const data = new FormData();
      data.append('_id', this.user._id);
      data.append('certificates', file);
  
      this.isUploadingFile = true;
      this._sharedService.imgUploadPut(data, 'certificate/add-file/' + this.selectedCertificate._id).subscribe((res: IResponseData) => {
        this.isUploadingFile = false;
        if(res.statusCode == 200) {
          this.fEditor.certificateFiles.setValue(res.data.certificateFiles);
          this.fEditor.certificateFiles.updateValueAndValidity();
        } else {
          console.log(res.message);
          this._toastr.error('Something went wrong. Please try again later');
        }
      }, error => {
        console.log(error);
        this.isUploadingFile = false;
        this._toastr.error('Something went wrong. Please try again later');
      })
    } else {
      //put file into fEditor.certificateFiles and upload later
      const certificateFiles = this.fEditor.certificateFiles.value || [];
      certificateFiles.push(file);
      this.fEditor.certificateFiles.setValue(certificateFiles);
      this.fEditor.certificateFiles.updateValueAndValidity();
    }
  }

  onStartUploadFile() {
    this.isUploadingFile = true;
  }

  onFailUploadFile() {
    this.isUploadingFile = false;
    this._toastr.error('Something went wrong. Please try later');
  }

  onDoneUploadFile(path: string) {
    this.isUploadingFile = false;
  }

  async downloadCertificateFile(i: number) {
    try { 
      await this._sharedService.downloadFile(this.fEditor.certificateFiles.value[i]); 
    } catch (error) {
      console.log(error);
      this._toastr.error('Cannot download file. Please try again after some time !');
    }
  }

  removeCertificateFile(i: number) {
    const files = this.fEditor.certificateFiles.value;
    files.splice(i,1)
    this.fEditor.certificateFiles.setValue(files);
    this.fEditor.certificateFiles.updateValueAndValidity();
  }

  onSubmitEditor(){
    this.isEditorSubmitted = true;
    if(this.formEditor.invalid) {
      this._toastr.error('There are some items that require your attention.');
      return;
    }

    let req: Observable<any>;
    if(this.selectedCertificate) {
      const data = {
        userId: this.user._id,
        title: this.fEditor.title.value,
        description: this.fEditor.description.value,
      }
      req = this._sharedService.put(data, 'certificate/update/' + this.selectedCertificate._id);

    } else {
      const data = new FormData();
      data.append('userId', this.user._id);
      data.append('title', this.fEditor.title.value);
      data.append('description', this.fEditor.description.value);
      (this.fEditor.certificateFiles.value as File[]).forEach(file => {
        data.append('certificates', file);
      });

      req = this._sharedService.imgUpload(data, 'certificate/create');
    }

    this.isUploading = true;
    req.subscribe((res: IResponseData) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this.certificateForVerifiedBadge = res.data as ICertificate;
        this._toastr.success(this.selectedCertificate ? 'Updated successfully.' : 'Uploaded successfully');
        this._modalService.hide();
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again.');
      }
    }, error => {
      this.isUploading = false
      console.log(error);
      this._toastr.error('Something went wrong. Please try again.');
    });
  }

  removeCertificate(certificate: ICertificate) {
    this.isUploading = true;
    this._sharedService.deleteContent('certificate/delete/' + certificate._id).subscribe((res: IResponseData) => {
      this.isUploading = false
      if (res.statusCode === 200) {
        this._modalService.hide();
        this.certificateForVerifiedBadge = null;
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again.');
      }
    }, error => {
      this.isUploading = false
      console.log(error);
      this._toastr.error('Something went wrong. Please try again.');
    });
  }


}

interface ICertificate {
  _id: string;
  userId: string;
  status: boolean;
  title: string;
  description: string;
  certificateFiles: string[];
}

type badgeStatusType = 'approved' | 'pending' | 'notApplied' | 'notApplicable';