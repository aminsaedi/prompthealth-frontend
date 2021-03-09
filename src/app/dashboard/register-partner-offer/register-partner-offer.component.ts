import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register-partner-offer',
  templateUrl: './register-partner-offer.component.html',
  styleUrls: ['./register-partner-offer.component.scss']
})
export class RegisterPartnerOfferComponent implements OnInit {

  public offers: {id: string, label: string, placeholder: string}[] = [
    {id: 'coupon',    label: 'Coupons',        placeholder: 'Coupon name',},
    {id: 'sample',    label: 'Free samples',   placeholder: 'https://example.com', },
    {id: 'trial',     label: 'Trials',         placeholder: 'https://example.com', },
    {id: 'affiliate', label: 'Affiliate Link', placeholder: 'https://example.com', }
  ];

  public form: FormGroup;
  public isSubmitted: boolean = false;

  public maxCode = 50;

  private subscriptionNavigation: Subscription;

  private patternURL = "http(s)?:\\/\\/([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?";
  private patternPrice = "[0-9]{1,}(\\.[0-9]{1,2})?";


  get f(){ return this.form.controls; }
  getFormArray(name: string){ return this.form.controls[name] as FormArray; }

  /** copy start */
  constructor(
    private _fb: FormBuilder,
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
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
  initForm(){
    const user = this._qService.getUser();

    this.form = this._fb.group({
      // code: new FormControl((user.code ? user.code : ''), [Validators.maxLength(this.maxCode)]),
      offerForFree: new FormControl((user.offerForFree ? user.offerForFree : false)),
      priceRange: new FormControl((user.priceRange ? user.priceRange : ''), [Validators.required]),
      price1: new FormControl((user.price1 ? user.price1 : ''), [Validators.pattern(this.patternPrice)]),
      price2: new FormControl((user.price2 ? user.price2 : ''), [Validators.pattern(this.patternPrice)]),
      signupURL: new FormControl((user.signupURL ? user.signupURL : ''), [Validators.pattern(this.patternURL)]),
      coupon: new FormArray([
        new FormControl((user.offer && user.offer.coupon) ? true : false),
        new FormControl((user.offer && user.offer.coupon) ? user.offer.coupon : '', []),
      ]),
      sample: new FormArray([
        new FormControl((user.offer && user.offer.sample) ? true : false),
        new FormControl((user.offer && user.offer.sample) ? user.offer.sample : '', [Validators.pattern(this.patternURL)]),        
      ]),
      trial: new FormArray([
        new FormControl((user.offer && user.offer.trial) ? true : false),
        new FormControl((user.offer && user.offer.trial) ? user.offer.trial : '', [Validators.pattern(this.patternURL)]),        
      ]),
      affiliate: new FormArray([
        new FormControl((user.offer && user.offer.affiliate) ? true : false),
        new FormControl((user.offer && user.offer.affiliate) ? user.offer.affiliate : '', [Validators.pattern(this.patternURL)]),        
      ]),
    });
  }

  onChangeForFree(isFree: boolean){
    if(isFree){
      this.f.priceRange.clearValidators();
      this.f.priceRange.setValue('');
      this.f.price1.setValue('');
      this.f.price2.setValue('');
    }else{
      this.f.priceRange.setValidators(Validators.required);
    }
    this.f.priceRange.updateValueAndValidity();
  }

  onChangeOffer(id: string){
    const control = this.getFormArray(id).controls as FormControl[];
    if(!control[0].value){ control[1].setValue(''); }
  }


  onSubmit(){
    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There are some items that require your attention.');
      return; 
    }

    this._qService.updateUser(this.form.value);

    const offers: PartnerOfferData['offer'] = {};
    this.offers.forEach(o=>{
      const control = this.getFormArray(o.id).controls as FormControl[];
      if(control[0].value && control[1].value != ''){
        offers[o.id]= control[1].value;   
      }
    });

    const data: PartnerOfferData = {
      offerForFree: this.f.offerForFree.value,
      priceRange: this.f.priceRange.value,
      price: [this.f.price1.value, this.f.price2.value],
      signupURL: this.f.signupURL.value,      
      offer: offers
    };

    this._qService.updateUser(data);
    this._qService.goNext(this._route);
  }
}

interface PartnerOfferData {
  offerForFree: boolean;
  priceRange: number;
  price: [number, number];
  signupURL: string;
  offer: {
    coupon?: String;
    sample?: string;
    trial?: string;
    affiliate?: string;
  }
}
