import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';
import { SharedService } from '../../shared/services/shared.service';
import { CategoryService, Category } from '../../shared/services/category.service';

@Component({
  selector: 'app-register-partner-service',
  templateUrl: './register-partner-service.component.html',
  styleUrls: ['./register-partner-service.component.scss']
})
export class RegisterPartnerServiceComponent implements OnInit {

  public form: FormGroup;
  public isSubmitted: boolean = false;

  public categories: Category[];

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
    this.form.setControl('productImage', new FormArray([]));
    if(user.productImage && user.productImage.length > 0){
      user.productImage.forEach((image: string)=>{
        this.getFormArray('productImage').push(new FormControl(image));
      });
    }

    /** for service */
    const cats = await this._catService.getCategoryAsync();
    this.categories = cats;
    this.form.setControl('service', new FormArray([]));
    cats.forEach(cat => {
      this.getFormArray('service').push(new FormControl( (user.ids && user.ids.indexOf(cat._id) > -1) ? true : false));

      this.form.setControl(cat._id, new FormArray([]));
      cat.subCategory.forEach(sub => {
        this.getFormArray(cat._id).push(new FormControl((user.ids && user.ids.indexOf(sub._id) > -1) ? true : false));
      });
    });
  }

  async onSelectProductImage(e: Event){
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){
      let image: {file: File | Blob, filename: string};
      try { image = await this._sharedService.shrinkImage(files[0]); }
      catch(err){
        this.f.photo.setValue('');
        this._toastr.error('Image size is too big. Please upload image size less than 10MB.');
        return;
      }

      try { 
        const imageURL = await this.uploadImage(image.file, image.filename); 
        this.getFormArray('productImage').push(new FormControl(imageURL));
      }
      catch(err){ }
    }
  }

  removeProductImage(index: number){
    this.getFormArray('productImage').removeAt(index);
  }

  async uploadImage(file: File | Blob, name: string): Promise<string>{
    return new Promise((resolve, reject) => {
      const uploadImage = new FormData();
      uploadImage.append('_id', '');
      uploadImage.append('profileImage', file, name);
      resolve('/assets/img/register-partner-0.jpg');
    });
  }


  onSubmit(){
    const vals = this.form.value;
    const ids = [];

    /** get selected ids. (if root category is not selected, sub category is ignored.) */
    vals.service.forEach((v: boolean, i: number) => {
      if(v){
        let id = this.categories[i]._id;
        ids.push(id);

        vals[id].forEach((vSub: boolean, j: number) => {
          if(vSub){
            let idSub = this.categories[i].subCategory[j]._id;
            ids.push(idSub);
          }
        });
      }
    });

    if(ids.length == 0){
      this._toastr.error('Please select at least 1 service.');
      return;
    }

    const data: {ids: string[], productImage?: string[]} = { ids: ids }

    if(this.getFormArray('productImage').length > 0){
      const productImage = [];
      this.getFormArray('productImage').controls.forEach(c=>{
        productImage.push(c.value);
      });
      data.productImage = productImage;
    }

    this._qService.updateUser(data);
    this._qService.goNext(this._route);
  }

}
