import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, FormArray, FormGroup} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { FormItemServiceComponent } from '../form-item-service/form-item-service.component';
import { IUserDetail } from 'src/app/models/user-detail';

@Component({
  selector: 'form-partner-service',
  templateUrl: './form-partner-service.component.html',
  styleUrls: ['./form-partner-service.component.scss']
})
export class FormPartnerServiceComponent implements OnInit {

  @Input() data: IUserDetail = {};
  @Input() disabled = false;
  @Input() hideSubmit: boolean = false;

  @Output() changeService = new EventEmitter<string[]>();
  @Output() changeImage = new EventEmitter<string[]>();
  @Output() submitForm = new EventEmitter<IUserDetail>();

  public formImages: FormArray;
  public formService = new FormGroup({});
  public baseURLImage = environment.config.AWS_S3;
  public isUploadingImage: boolean = false;
  public isSubmitted = false;

  @ViewChild('formItemService') private formItemService: FormItemServiceComponent;

  constructor(
    private _toastr: ToastrService,
    private _sharedService: SharedService,
  ) { }


  ngOnInit(): void {
    this.formImages = new FormArray([]);
    if(this.data.image){
      (this.data.image as string[]).forEach((image: string) => {
        this.formImages.push(new FormControl(image));
      });  
    }
  }

  onChangeSelectedServices(services: []){
    this.emitService(services);
  }

  async onSelectProductImages(e: Event){
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){
      if(files.length + this.formImages.length > 5){
        this._toastr.error('Cannot upload more than 5 images.');
        return;
      }

      const imagesUploading: {file: File | Blob, filename: string}[] = [];
      let imageCountTooBig = 0;
      for(var i=0; i<files.length; i++){
        try { 
          const image = await this._sharedService.shrinkImageByFixedWidth(files.item(i), 1200); 
          imagesUploading.push(image);
        }
        catch(err){
          imageCountTooBig++;
        }
      }

      if(imageCountTooBig > 0){
        const error = ((imageCountTooBig == 1) ? 'A image is' : imageCountTooBig + 'images are') + 'too big. Please upload image size less than 10MB.';
        this._toastr.error(error);
      }

      if(imagesUploading.length > 0){
        this.isUploadingImage = true;
        try{
          const result = await this.uploadImages(imagesUploading);
          result.forEach(path => {
            this.formImages.push(new FormControl(path));
          });
          this.emitImage();
        } catch(err){ 
          this._toastr.error(err); 
        } finally {
          this.isUploadingImage = false;
        } 
      }
    }
  }

  removeProductImage(index: number){
    this.formImages.removeAt(index);
    this.emitImage();    
  }

  async uploadImages(images: {file: File | Blob, filename: string}[]): Promise<string[]>{
    return new Promise((resolve, reject) => {
      const uploadImage = new FormData();
      uploadImage.append('imgLocation', 'partner');
      uploadImage.append('_id', this.data._id);
      images.forEach(image => {
        uploadImage.append('images', image.file, image.filename);
      });

      const path = (images.length == 1) ? 'common/imgUpload' : 'common/imgMultipleUpload';
      this._sharedService.imgUpload(uploadImage, path).subscribe((res: any) => {
        if(res.statusCode == 200){
          const result = (images.length == 1) ? [res.data] : res.data;
          resolve(result);
        }else{
          reject('Something went wrong. Please try again.');
        }
      }), (error: any) => {
        console.log(error);
        reject('Something went wrong. Please try again.');
      };
    });
  }

  emitService(services: string[]){ this.changeService.emit(services); }

  emitImage(){
    const images = [];
    this.formImages.controls.forEach(control => {
      images.push(control.value);
    });
    this.changeImage.emit(images);
  }

  onSubmit() {
    this.isSubmitted = true;
    if(this.formItemService.controller.invalid) {
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    const data = {
      ... this.data._id && { _id: this.data._id }, 
      services: this.formItemService.getSelected(),
      image: this.formImages.value,
    }

    this.submitForm.emit(data);
  }
}
