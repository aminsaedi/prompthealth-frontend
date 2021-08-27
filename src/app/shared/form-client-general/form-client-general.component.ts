import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { IUserDetail } from 'src/app/models/user-detail';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { FormItemCheckboxGroupComponent, CheckboxSelectionItem } from '../form-item-checkbox-group/form-item-checkbox-group.component';
import { FormItemPricingComponent } from '../form-item-pricing/form-item-pricing.component';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'form-client-general',
  templateUrl: './form-client-general.component.html',
  styleUrls: ['./form-client-general.component.scss']
})
export class FormClientGeneralComponent implements OnInit {

  @Input() data: IUserDetail = {};
  @Input() disabled = false;
  
  @Output() submitForm = new EventEmitter<IUserDetail>();

  get f() { return this.form.controls; }

  public form: FormGroup;
  public isSubmitted = false;

  public maxName = minmax.nameMax;

  @ViewChildren(FormItemCheckboxGroupComponent) formItemCheckboxGroupComponents: QueryList<FormItemCheckboxGroupComponent>;

  constructor(
    private _fb: FormBuilder,
    private _toastr: ToastrService,
  ) { }

  async ngOnInit() {

    this.form = this._fb.group({
      profileImage: new FormControl(this.data.profileImage ? this.data.profileImage : ''),
      firstName: new FormControl(this.data.firstName ? this.data.firstName : '', validators.firstnameClient),
      lastName: new FormControl(this.data.lastName ? this.data.lastName : '', validators.lastnameClient),
      
      userType: new FormControl('Client'),
      email: new FormControl(this.data.email ? this.data.email : '', validators.email),
      phone: new FormControl(this.data.phone ? this.data.phone : '', validators.phone),
      gender: new FormControl(this.data.gender ? this.data.gender: ''),
      address: new FormControl(this.data.address ? this.data.address : ''),
      latitude: new FormControl((this.data.location && this.data.location[1]) ? this.data.location[1] : 0 ),
      longitude: new FormControl((this.data.location && this.data.location[0]) ? this.data.location[0] : 0 ),
      city: new FormControl(this.data.city ? this.data.city : '' ),
      state: new FormControl( this.data.state ? this.data.state : '' ),
      zipcode: new FormControl( this.data.zipcode ? this.data.zipcode : '' ),
    }, {validators: validators.addressSelectedFromSuggestion});
  }

  onChangeImage(imageURL: string) {
    // this._profileService.update({profileImage: imageURL});
  }


  onSubmit(){
    if(this.form.invalid){
      this.isSubmitted = true;
      this._toastr.error('There are some items that require your attention.');
      return;
    }
    
    const data: IUserDetail = {};
    data._id = this.data._id;
    for(const key in this.form.controls){
      const f = this.form.controls[key];
      if(key == 'priceMode' || key == 'userType'){
        //nothing to do
      }else if(f instanceof FormControl){
        data[key] = f.value;
      }else if(f instanceof FormArray) {
        this.formItemCheckboxGroupComponents.forEach(component => {
          if(component.id == key){
            data[key] = component.getSelected();
          }
        });
      }
    }

    this.submitForm.emit(data);
  }

}
