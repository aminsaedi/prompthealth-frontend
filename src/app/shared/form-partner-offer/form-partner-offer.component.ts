import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'form-partner-offer',
  templateUrl: './form-partner-offer.component.html',
  styleUrls: ['./form-partner-offer.component.scss']
})
export class FormPartnerOfferComponent implements OnInit {

  @Input() data: any;
  @Input() disabled = false;

  @Output() submitForm = new EventEmitter<PartnerOfferData>(); /** it does NOT return userID */

  public offers: {id: string, label: string, placeholder: string, autocomplete: string, type: string}[] = [
    {id: 'couponLink',    label: 'Coupons',        placeholder: 'Coupon name',         autocomplete: null,  type: 'text'},
    {id: 'freeSampleLink',label: 'Free samples',   placeholder: 'https://example.com', autocomplete: 'url', type: 'url'},
    {id: 'trialLink',     label: 'Trials',         placeholder: 'https://example.com', autocomplete: 'url', type: 'url'},
    {id: 'affiliateLink', label: 'Affiliate Link', placeholder: 'https://example.com', autocomplete: 'url', type: 'url'},
  ];

  public form: FormGroup;
  public isSubmitted: boolean = false;

  public maxCode = 50;

  private patternURL = "http(s)?:\\/\\/([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?";
  private patternPrice = "[0-9]{1,}(\\.[0-9]{1,2})?";


  get f(){ return this.form.controls; }
  getFormArray(name: string){ return this.form.controls[name] as FormArray; }

  constructor(
    private _fb: FormBuilder,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {

    this.form = this._fb.group({
      isFree: new FormControl((this.data.isFree ? this.data.isFree : false)),
      priceLevel: new FormControl((this.data.priceLevel ? this.data.priceLevel : ''), [Validators.required]),
      price1: new FormControl((this.data.price1 ? this.data.price1 : ''), [Validators.pattern(this.patternPrice)]),
      price2: new FormControl((this.data.price2 ? this.data.price2 : ''), [Validators.pattern(this.patternPrice)]),
      signupURL: new FormControl((this.data.signupURL ? this.data.signupURL : ''), validators.productOfferLink),
      couponLink: new FormArray([
        new FormControl(this.data.couponLink ? true : false),
        new FormControl(this.data.couponLink ? this.data.couponLink : '', []),
      ]),
      freeSampleLink: new FormArray([
        new FormControl(this.data.freeSampleLink ? true : false),
        new FormControl(this.data.freeSampleLink ? this.data.freeSampleLink : '', validators.productOfferLink),        
      ]),
      trialLink: new FormArray([
        new FormControl(this.data.trialLink ? true : false),
        new FormControl(this.data.trialLink ? this.data.trialLink : '', validators.productOfferLink),        
      ]),
      affiliateLink: new FormArray([
        new FormControl(this.data.affiliateLink ? true : false),
        new FormControl(this.data.affiliateLink ? this.data.affiliateLink : '', validators.productOfferLink),        
      ]),
    });

    this.onChangeForFree(this.data.isFree);
  }


  onChangeForFree(isFree: boolean){
    if(isFree){
      this.f.priceLevel.clearValidators();
      this.f.priceLevel.setValue('');
      this.f.price1.setValue('');
      this.f.price2.setValue('');
    }else{
      this.f.priceLevel.setValidators(Validators.required);
    }
    this.f.priceLevel.updateValueAndValidity();
  }

  onChangeOfferCheck(id: string){
    const control = this.getFormArray(id).controls as FormControl[];
    if(!control[0].value){ control[1].setValue(''); }
  }


  onSubmit(){
    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There are some items that require your attention.');
      return; 
    }

    const data: PartnerOfferData = {
      isFree: this.f.isFree.value,
      priceLevel: this.f.priceLevel.value || null,
      price1: this.f.price1.value || null,
      price2: this.f.price2.value || null,
      signupURL: this.f.signupURL.value,      
    };

    this.offers.forEach(o=>{
      const control = this.getFormArray(o.id).controls as FormControl[];
      data[o.id] = (control[0].value && control[1].value != '') ? control[1].value : '';
    });
    this.isSubmitted = false;
    this.submitForm.emit(data);
  }
}

export interface PartnerOfferData {
  isFree: boolean;
  priceLevel: number;
  price1: number;
  price2: number;
  signupURL: string;
  couponLink?: String;
  freeSampleLink?: string;
  trialLink?: string;
  affiliateLink?: string;
}