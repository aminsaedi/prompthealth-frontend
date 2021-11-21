import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IUserDetail } from 'src/app/models/user-detail';
import { minmax, validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'form-admin-general',
  templateUrl: './form-admin-general.component.html',
  styleUrls: ['./form-admin-general.component.scss']
})
export class FormAdminGeneralComponent implements OnInit {

  @Input() data: IUserDetail = {};
  @Input() disabled = false;
  @Input() hideSubmit: boolean = false;
  
  @Output() submitForm = new EventEmitter<IUserDetail>();

  get f() { return this.form.controls; }

  public form: FormGroup;
  public isSubmitted = false;
  
  public maxTextarea = minmax.textareaMax;
  public maxName = minmax.nameMax;
  public isUploadingProfileImage = false;


  constructor(
    private _fb: FormBuilder,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      profileImage: new FormControl(this.data.profileImage ? this.data.profileImage : ''),
      firstName: new FormControl(this.data.firstName ? this.data.firstName : '', validators.nameProvider),
      userType: new FormControl('Admin'),
      email: new FormControl(this.data.email ? this.data.email : '', validators.email),
      product_description: new FormControl( this.data.product_description ? this.data.product_description : '', validators.productDescription),
    });
  }

  onStartUploadingProfileImage () {
    this.isUploadingProfileImage = true;
  }
  onDoneUploadingProfileImage () {
    this.isUploadingProfileImage = false;
  }

  onSubmit(){
    if(this.form.invalid){
      this.isSubmitted = true;
      this._toastr.error('There are some items that require your attention.');
      return;
    }
    
    const data: IUserDetail = {};
    if(this.data) {
      data._id = this.data._id;
    }

    for(const key in this.form.controls){
      const f = this.form.controls[key];
      if(key == 'priceMode' || key == 'userType'){
        //nothing to do
      }else if(f instanceof FormControl){
        data[key] = f.value;
      }
    }

    this.submitForm.emit(data);
  }

}
