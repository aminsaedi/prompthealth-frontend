import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IUserDetail } from 'src/app/models/user-detail';
import { environment } from 'src/environments/environment';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'form-item-upload-image-button',
  templateUrl: './form-item-upload-image-button.component.html',
  styleUrls: ['./form-item-upload-image-button.component.scss']
})
export class FormItemUploadImageButtonComponent implements OnInit {

  @Input() userid: string;
  @Input() label: string = 'Profile image';
  @Input() disabled = false;
  @Input() submitted = false;
  @Input() controller: FormControl;
  @Input() uploadType: 'profile' | 'blogThumbnail' = 'profile';

  @Output() changeImage = new EventEmitter<string>();

  public baseURLImage = environment.config.AWS_S3;
  public isUploading: boolean = false;

  @ViewChild('uploadImageSelector') imageSelector: ElementRef;

  constructor(
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    console.log(this.uploadType);
  }

  select() {
    const el = this.imageSelector.nativeElement as HTMLInputElement;
    if(el) {
      el.click();
    }
  }

  async onSelectImage(e: Event){
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){
      let image: {file: File | Blob, filename: string};
      try { image = await this._sharedService.shrinkImage(files[0]); }
      catch(err){
        this.controller.setValue('');
        this._toastr.error('Image size is too big. Please upload image size less than 10MB.');
        return;
      }

      this._sharedService.loader('show');
      this.isUploading = true;
      try { 
        const imageURL = (this.uploadType == 'profile') ? await this.uploadImage(image.file, image.filename) : await this.uploadImageBlog(image.file, image.filename); 
        this.controller.setValue(imageURL);

        this.changeImage.emit(imageURL);
      }
      catch(err){ this._toastr.error(err); }
      finally{ 
        this._sharedService.loader('hide'); 
        this.isUploading = false;
      }
    }
  }


  async uploadImage(file: File | Blob, name: string): Promise<string>{
    return new Promise((resolve, reject) => {
      const userid = this.userid;
      const uploadImage = new FormData();
      uploadImage.append('_id', userid);
      uploadImage.append('profileImage', file, name);

      this._sharedService.imgUpload(uploadImage, 'user/imgUpload').subscribe((res: any) => {
        if(res.statusCode == 200){
          resolve(res.data.profileImage);
        }else{
          reject('Something went wrong. Please try again.');
        }
      }, error => {
        console.log(error);
          reject('Something went wrong. Please try again.');
      });
    });
  }
  
  async uploadImageBlog(file: File | Blob, name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadImage = new FormData();
      uploadImage.append('imgLocation', 'blogs');
      uploadImage.append('images', file, name);

      this._sharedService.imgUpload(uploadImage, 'common/imgUpload').subscribe((res: any) => {
        if(res.statusCode === 200) {
          resolve(res.data);
        } else {
          console.log(res.message);
          reject('Something went wrong. Please try again.');
        }
      }, error => {
        console.log(error);
        reject('Something went wrong. Please try again.');
      });
    });
  }


}
