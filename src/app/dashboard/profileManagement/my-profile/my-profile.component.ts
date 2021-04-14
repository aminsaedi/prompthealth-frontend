import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { BehaviorService } from '../../../shared/services/behavior.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { ProfileManagementService } from '../profile-management.service';
import { IUserDetail } from 'src/app/models/user-detail';

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
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private _profileService: ProfileManagementService,
  ) { }

  async ngOnInit() {
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
        this._bs.setUserData(res.data);
      } else {
        this.toastr.error(res.message);
      }
    }, err => {
      this._sharedService.loader('hide');
      this.toastr.error('There are some errors, please try again after some time !', 'Error');
    });
  }

  async onFileSelect(event) {
    const maxFileSize = 10 * 1000 * 1000; /** 10MB */
    if (event.target.files[0].type === 'image/png'
      || event.target.files[0].type === 'image/jpg'
      || event.target.files[0].type === 'image/jpeg') {
      if (event.target.files.length > 0) {
        const input = new FormData();
        input.append('_id', this.profile._id);

        const file: File = event.target.files[0];
        if(file.size > maxFileSize){
          try { 
            const img: Blob = await this.shrinkImage(file, 0.8, 0.8, maxFileSize); 
            const filename = Date.now().toString() + '.' + img.type.replace('image/', '');
            input.append('profileImage', img, filename);          
          }
          catch(err){ this.toastr.error('Image size is too big. Please upload image size less than 10MB.'); }
        }else{
          input.append('profileImage', file);
        }

        if(input.has('profileImage')){
          this._sharedService.loader('show');
          this._sharedService.imgUpload(input, 'user/imgUpload').subscribe((res: any) => {
            if (res.statusCode === 200) {
              // this.profile = res.data;
              this._bs.setUserData(res.data)
              this.profile.profileImage = res.data.profileImage;
              this._sharedService.loader('hide');
            } else {
              this.toastr.error(res.message);
            }
          }, err => {
            this._sharedService.loader('hide');
            this.toastr.error('There are some errors, please try again after some time !', 'Error');
          });
        }
      }
    } else {
      this.toastr.error('This file format is not supportbale!');
    }
  }

  async shrinkImage(img0: Blob, ratioSize: number, ratioQuality: number, maxFileSize: number): Promise<Blob>{
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = (e: any)=>{
        const t = e.target;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(t.width * ratioSize); 
        canvas.height = Math.round(t.height * ratioSize);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(t, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b: Blob) => {
          if(b.size >= maxFileSize){ reject('size is too big'); }
          else{ resolve(b); }
        }, img0.type, ratioQuality);  
      }
      img.src = URL.createObjectURL(img0);
    })
  }

  deleteProfile(content) {
    this.modalref = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'sm' });
    this.modalref.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
    });
  }

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
