import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { IUserDetail } from 'src/app/models/user-detail';
import { CheckboxSelectionItem, FormItemCheckboxGroupComponent } from '../form-item-checkbox-group/form-item-checkbox-group.component';

@Component({
  selector: 'form-partner-general',
  templateUrl: './form-partner-general.component.html',
  styleUrls: ['./form-partner-general.component.scss']
})
export class FormPartnerGeneralComponent implements OnInit {

  @Input() data: IUserDetail;
  @Input() disabled = false;
  @Input() hideSubmit: boolean = false;

  @Output() changeImage = new EventEmitter<string>();
  @Output() submitForm = new EventEmitter<any>();
  @Output() submitText = new EventEmitter<any>(); /** it does NOT return userID nor imageURL */

  public form: FormGroup;
  public isSubmitted = false;
  public isUploadingProfileImage = false;

  public maxName: number = minmax.nameMax;
  public maxTextarea: number = minmax.textareaMax;

  public companyTypeItems: CheckboxSelectionItem[] = [
    {id: 'type1', label: 'Apps', value: 'apps'},
    {id: 'type2', label: 'Services', value: 'services'},
    {id: 'type3', label: 'Products', value: 'products'},
    {id: 'type4', label: 'Resource', value: 'resource'},  
  ];


  get f() { return this.form.controls; }

  @ViewChild('formCompanyType') private formCompanyType: FormItemCheckboxGroupComponent;


  constructor(
    private _fb: FormBuilder,
    private _toastr: ToastrService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      profileImage: new FormControl((this.data.profileImage ? this.data.profileImage : ''), []),
      firstName: new FormControl((this.data.firstName ? this.data.firstName : ''), validators.nameCentre),
      email: new FormControl((this.data.email ? this.data.email : ''), validators.email),
      address: new FormControl((this.data.address ? this.data.address : '')),
      latitude: new FormControl(((this.data.location && this.data.location[1]) ? this.data.location[1] : 0), []),
      longitude: new FormControl(((this.data.location && this.data.location[0]) ? this.data.location[0] : 0), []),
      city: new FormControl((this.data.city ? this.data.city : ''), []),
      state: new FormControl((this.data.state ? this.data.state : ''), []),
      zipcode: new FormControl((this.data.zipcode ? this.data.zipcode : ''), []),
      placeId: new FormControl((this.data.placeId ? this.data.placeId : ''), []),

      company_type: new FormArray([], validators.companyType),

      phone: new FormControl((this.data.phone ? this.data.phone : ''), validators.phone),
      website: new FormControl((this.data.website ? this.data.website : ''), validators.website),
      product_description: new FormControl((this.data.product_description ? this.data.product_description : ''), [
        Validators.required,
        Validators.maxLength(this.maxTextarea),
      ]),
      messageToPlatform: new FormControl((this.data.messageToPlatform ? this.data.messageToPlatform : ''), [Validators.maxLength(this.maxTextarea)]),
    }, { validators: validators.addressSelectedFromSuggestion });
  }


  onStartUploadingProfileImage () {
    this.isUploadingProfileImage = true;
  }
  onDoneUploadingProfileImage () {
    this.isUploadingProfileImage = false;
  }

  onChangePlace() {
    this._changeDetector.detectChanges();
  }

  onSubmit(){
    if(this.form.invalid){
      this.isSubmitted = true;
      this._toastr.error('There are some items that require your attention.');
      return;
    }

    const data = this.form.value;
    data.company_type = this.formCompanyType.getSelected();

    this.submitText.emit(this.form.value);

    if(this.data) {
      data._id = this.data._id;
    }
    this.submitForm.emit(this.form.value);
  }
}
