import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IUserDetail } from 'src/app/models/user-detail';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { FormItemCheckboxGroupComponent, CheckboxSelectionItem } from '../form-item-checkbox-group/form-item-checkbox-group.component';
import { FormItemPricingComponent } from '../form-item-pricing/form-item-pricing.component';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'form-provider-general',
  templateUrl: './form-provider-general.component.html',
  styleUrls: ['./form-provider-general.component.scss']
})
export class FormProviderGeneralComponent implements OnInit {

  @Input() data: IUserDetail = {};
  @Input() disabled = false;
  @Input() hideSubmit: boolean = false;
  
  @Output() changeImage = new EventEmitter<string>();
  @Output() submitForm = new EventEmitter<IUserDetail>();

  get f() { return this.form.controls; }
  get fAgeRangeList() { return (this.f.age_range as FormArray).controls; }
  get fTypicalHourList() { return (this.f.typical_hours as FormArray).controls; }
  get fLanguageList() { return (this.f.languages as FormArray).controls; }
  get fServiceOfferList() { return (this.f.serviceOfferIds as FormArray).controls; }

  public form: FormGroup;
  public isSubmitted = false;
  public isPremiumAccount: boolean;
  public isUploadingProfileImage = false;

  public maxName = minmax.nameMax;
  public maxProfessionalTitle = minmax.professionalTitleMax;
  public maxProfessionalOrganization = minmax.professionalOrganizationMax;
  public maxCertification = minmax.certificationMax;
  public maxTextarea = minmax.descriptionMax;
  public serviceOfferList: CheckboxSelectionItem[];
  public typicalHourList: CheckboxSelectionItem[];
  public languageList: CheckboxSelectionItem[];

  @ViewChildren(FormItemCheckboxGroupComponent) formItemCheckboxGroupComponents: QueryList<FormItemCheckboxGroupComponent>;
  @ViewChild(FormItemPricingComponent) formItemPricingComponent: FormItemPricingComponent;

  constructor(
    private _fb: FormBuilder,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    console.log(this.data)
    this.isPremiumAccount = (this.data.isVipAffiliateUser || (this.data.plan && this.data.plan.name.toLowerCase() !== 'basic')) ? true : false;
    try { await this.getQuestions(); }
    catch(error){ this._toastr.error(error); }
    this._toastr.info("Question received")
    this.form = this._fb.group({
      profileImage: new FormControl(this.data.profileImage ? this.data.profileImage : '', validators.profileImageProvider),
      firstName: new FormControl(this.data.firstName ? this.data.firstName : '', validators.nameProvider),
      lastName: new FormControl(this.data.lastName ? this.data.lastName : '', validators.nameProvider),
      
      userType: new FormControl('Wellness provider'),
      email: new FormControl(this.data.email ? this.data.email : '', validators.email),
      phone: new FormControl(this.data.phone ? this.data.phone : '', validators.phone),
      gender: new FormControl(this.data.gender ? this.data.gender: '', validators.gender),
      
      address: new FormControl(this.data.address ? this.data.address : '', validators.address),
      latitude: new FormControl((this.data.location && this.data.location[1]) ? this.data.location[1] : 0 ),
      longitude: new FormControl((this.data.location && this.data.location[0]) ? this.data.location[0] : 0 ),
      city: new FormControl(this.data.city ? this.data.city : '' ),
      state: new FormControl( this.data.state ? this.data.state : '' ),
      zipcode: new FormControl( this.data.zipcode ? this.data.zipcode : '' ),
      placeId: new FormControl( this.data.placeId ? this.data.placeId : '' ),
      hideAddress: new FormControl( this.data.hideAddress ? this.data.hideAddress : false ),

      website: new FormControl( this.data.website ? this.data.website : '', validators.website),
      professional_title: new FormControl( this.data.professional_title ? this.data.professional_title : '', validators.professionalTitle),
      professional_organization: new FormControl( this.data.professional_organization ? this.data.professional_organization : '', validators.professionalOrganization),
      certification: new FormControl( this.data.certification ? this.data.certification : '', validators.certification),
      bookingURL: new FormControl( this.data.bookingURL ? this.data.bookingURL : '', validators.bookingURL),
      
      typical_hours: new FormArray([], validators.typicalHours),
      languages: new FormArray([]),
      serviceOfferIds: new FormArray([]),

      age_range: new FormArray([], validators.ageRange),
      years_of_experience: new FormControl( this.data.years_of_experience ? this.data.years_of_experience : ''),

      priceMode: new FormControl( this.data.exactPricing ? 'input' : 'select'),
      exactPricing: new FormControl( this.data.exactPricing ? this.data.exactPricing : '', validators.exactPricing),
      price_per_hours: new FormControl( this.data.price_per_hours ? this.data.price_per_hours : ''),

      // business_kind: new FormControl( this.data.business_kind ? this.data.business_kind : '', validators.businessKind),

      product_description: new FormControl( this.data.product_description ? this.data.product_description : '', validators.productDescription),

    });
    console.log("FORM", this.form)
    // , {validators: validators.addressSelectedFromSuggestion}

  }

  async getQuestions(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `questionare/get-profile-questions`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          res.data.forEach((element: any) => {
            const selectionList: CheckboxSelectionItem[] = [];
            element.answers.forEach((a: any) => {
              selectionList.push({
                id: a._id,
                label: a.item_text,
                value: a._id
              });
            });
  
            switch(element.slug){
              case 'offer-your-services': this.serviceOfferList = selectionList; break;
              case 'languages-you-offer': this.languageList = selectionList; break;
              case 'typical-hours': this.typicalHourList = selectionList; break;
            }
          });
          resolve(true);  
        } else {
          reject(res.message);
        }
      }, err => {
        console.log(err);
        reject('There are some errors, please try again after some time !');
      });
    })
  }

  onChangePlace() {
    this._changeDetector.detectChanges();
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

    this.formItemPricingComponent.setValue();
    
    const data: IUserDetail = {};
    data._id = this.data._id;
    data.location = [null, null];

    for(const key in this.form.controls){
      const f = this.form.controls[key];

      if(key == 'priceMode' || key == 'userType'){
        //nothing to do
      }else if(key == 'latitude'){ 
        data.location[1] = f.value;
      }else if(key == 'longitude') {
        data.location[0] = f.value;
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
