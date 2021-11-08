import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ProfileManagementService } from '../dashboard/profileManagement/profile-management.service';
import { SharedService } from './services/shared.service';

@Directive({
  selector: '[imageUploader]'
})
export class ImageUploaderDirective {

  // @Input() shrinkBy: string = 'width';
  @Input() shrinkSize: number = 800;
  @Input() imageType: ImageType = 'profileImage';

  @Output() onChange = new EventEmitter<string|ArrayBuffer>();
  @Output() startUpload = new EventEmitter<void>();
  @Output() doneUpload = new EventEmitter<string>();
  @Output() failUpload = new EventEmitter<void>();

  get user() { return this._profileService.profile; }

  @HostListener('change', ['$event']) async change(e: Event) {
    const image = this.getSelectedImage(e);
    if(!image) {
      return;
    }

    const imageShrink = await this.shrinkImageByFixedWidth(image);

    const reader = new FileReader();
    reader.readAsDataURL(imageShrink.file);
    reader.onloadend = () => {
      this.onChange.emit(reader.result);
    }


    let imageUploadRequest: Promise<string>;
    switch(this.imageType) {
      case 'profileCover':
      case 'profileImage':
        imageUploadRequest = this.uploadImageAndUpdateUserData(imageShrink.file, imageShrink.name);
        break;
      case 'staff':
        imageUploadRequest = this.uploadImageTo(imageShrink.file, imageShrink.name, 'staffs');
        break;
    }
    try {
      this.startUpload.emit();
      const result = await imageUploadRequest;
      this.doneUpload.emit(result);
    } catch (error) {
      console.log(error);
      this.failUpload.emit();
    }
  } 

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
  ) { 
  }


  getSelectedImage(e: Event) {
    let image: File = null;
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0) {
      image = files[0];
    }
    return image;
  }

  shrinkImageByFixedWidth(image: File): Promise<{file: Blob, name: string}> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if(img.width <= this.shrinkSize) {
          resolve({file: image, name: image.name});
        } else {
          const canvas = document.createElement('canvas');
          canvas.width = this.shrinkSize;
          canvas.height = img.height * this.shrinkSize / img.width;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((b: Blob) => {
            resolve({ file: b, name: image.name });
          }, image.type);
        }
      };
      img.src = URL.createObjectURL(image);
    });
  }

  // shrinkImageByFixedHeight(image: File): Promise<{file: Blob, name: string}> {
  //   return new Promise((resolve, reject) => {});
  // }

  uploadImageTo(file: Blob, name: string, location: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadImage = new FormData();
      uploadImage.append('imgLocation', location);
      uploadImage.append('images', file, name);

      this._sharedService.imgUpload(uploadImage, 'common/imgUpload').subscribe((res: any) => {
        if(res.statusCode === 200) {
          resolve(res.data);
        } else {
          console.log(res.message);
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      });
    });
  }
  uploadImageAndUpdateUserData(file: Blob, name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const imageType = this.imageType == 'profileImage' ? 'profileImage' : 'cover';
      const data = new FormData();
      data.append('_id', this.user._id);
      data.append(imageType, file, name);

      this._sharedService.imgUpload(data, 'user/imgUpload').subscribe((res: any) => {
        if(res.statusCode == 200){
          resolve(res.data[imageType]);
        }else{
          console.log(res.message);
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      });
    });
  }
}

type ImageType = 'profileImage' | 'profileCover' | 'staff';