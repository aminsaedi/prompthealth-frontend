import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';
import { SharedService } from '../../shared/services/shared.service';
import { CategoryService, Category } from '../../shared/services/category.service';
import { environment } from 'src/environments/environment';
import { BehaviorService } from '../../shared/services/behavior.service'; 

@Component({
  selector: 'app-register-partner-service',
  templateUrl: './register-partner-service.component.html',
  styleUrls: ['./register-partner-service.component.scss']
})
export class RegisterPartnerServiceComponent implements OnInit {

  public form: FormGroup;
  public isSubmitted: boolean = false;

  public categories: Category[];

  public baseURLImage = environment.config.AWS_S3;
  private subscriptionNavigation: Subscription;


  get f(){ return this.form.controls; }
  getFormArray(name: string){ return this.form.controls[name] as FormArray; }

  /** copy start */
  constructor(
    private _fb: FormBuilder,
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _catService: CategoryService,
    private _sharedService: SharedService,
    private _bsService: BehaviorService,
  ) {
  }
  
  ngOnDestroy(){
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.initForm();

    this.subscriptionNavigation = this._qService.observeNavigation().subscribe(type => {
      if(type == 'next'){ this.onSubmit(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });
    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
    });
  }
  /** copy end */

  /** original start */
  async initForm(){
    this.form = this._fb.group({});
    const user = this._qService.getUser();

    /** for product */
    this.form.setControl('image', new FormArray([]));
    if(user.image && user.image.length > 0){
      user.image.forEach((image: string)=>{
        this.getFormArray('image').push(new FormControl(image));
      });
    }

    /** for service */
    const cats = await this._catService.getCategoryAsync();
    this.categories = cats;
    this.form.setControl('service', new FormArray([]));
    cats.forEach(cat => {
      this.getFormArray('service').push(new FormControl( (user.services && user.services.indexOf(cat._id) > -1) ? true : false));

      this.form.setControl(cat._id, new FormArray([]));
      cat.subCategory.forEach(sub => {
        this.getFormArray(cat._id).push(new FormControl((user.services && user.services.indexOf(sub._id) > -1) ? true : false));
      });
    });
  }

  async onSelectProductImages(e: Event){
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){
      if(files.length + this.getFormArray('image').length > 5){
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
            this.getFormArray('image').push(new FormControl(path));
          });
          const images = [];
          this.getFormArray('image').controls.forEach(control => {
            images.push(control.value);
          });
          this._bsService.setUserDataOf('image', images);
          this._qService.updateUser({image: images});
        }
        catch(err){ this._toastr.error(err); }
        finally{ this._sharedService.loader('hide'); }
      }
    }
  }

  removeProductImage(index: number){
    this.getFormArray('image').removeAt(index);
  }

  async uploadImages(images: {file: File | Blob, filename: string}[]): Promise<string[]>{
    return new Promise((resolve, reject) => {
      const userid = this._qService.getUser()._id;
      const uploadImage = new FormData();
      uploadImage.append('imgLocation', 'partner');
      uploadImage.append('_id', userid);
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


  onSubmit(){
    const vals = this.form.value;
    const services = [];

    /** get selected services. (if root category is not selected, sub category is ignored.) */
    vals.service.forEach((v: boolean, i: number) => {
      if(v){
        let id = this.categories[i]._id;
        services.push(id);

        vals[id].forEach((vSub: boolean, j: number) => {
          if(vSub){
            let idSub = this.categories[i].subCategory[j]._id;
            services.push(idSub);
          }
        });
      }
    });

    if(services.length == 0){
      this._toastr.error('Please select at least 1 service.');
      return;
    }

    const data: {services: string[], image?: string[]} = { services: services }

    if(this.getFormArray('image').length > 0){
      const images = [];
      this.getFormArray('image').controls.forEach(c=>{
        images.push(c.value);
      });
      data.image = images;
    }

    this._qService.updateUser(data);
    this._qService.goNext(this._route);
  }

}
