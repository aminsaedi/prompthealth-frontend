import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormArray} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'form-partner-service',
  templateUrl: './form-partner-service.component.html',
  styleUrls: ['./form-partner-service.component.scss']
})
export class FormPartnerServiceComponent implements OnInit {

  @Input() data: any;
  @Input() disabled = false;

  @Output() changeService = new EventEmitter<string[]>();
  @Output() changeImage = new EventEmitter<string[]>();

  public formImages: FormArray;
  public baseURLImage = environment.config.AWS_S3;

  constructor(
    private _toastr: ToastrService,
    private _sharedService: SharedService,
  ) { }


  ngOnInit(): void {
    this.formImages = new FormArray([]);
    if(this.data.image){
      this.data.image.forEach((image: string) => {
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
          const image = await this._sharedService.shrinkImage(files.item(i)); 
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
        this._sharedService.loader('show');
        try{
          const result = await this.uploadImages(imagesUploading);
          result.forEach(path => {
            this.formImages.push(new FormControl(path));
          });
          this.emitImage();
        }
        catch(err){ this._toastr.error(err); }
        finally{ this._sharedService.loader('hide'); }
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
}
