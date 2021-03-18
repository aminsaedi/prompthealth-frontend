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
    {id: 'couponLink',    label: 'Coupons',        placeholder: 'Coupon name',},
    {id: 'sampleLink',    label: 'Free samples',   placeholder: 'https://example.com', },
    {id: 'trialLink',     label: 'Trials',         placeholder: 'https://example.com', },
    {id: 'affiliateLink', label: 'Affiliate Link', placeholder: 'https://example.com', }
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
      // this._qService.setCurrentIndex(data.index);
    });
  }
  /** copy end */

  /** original start */
  initForm(){
    const user = this._qService.getUser();

    this.form = this._fb.group({
      isFree: new FormControl((user.isFree ? user.isFree : false)),
      priceLevel: new FormControl((user.priceLevel ? user.priceLevel : ''), [Validators.required]),
      price1: new FormControl((user.price1 ? user.price1 : ''), [Validators.pattern(this.patternPrice)]),
      price2: new FormControl((user.price2 ? user.price2 : ''), [Validators.pattern(this.patternPrice)]),
      signupURL: new FormControl((user.signupURL ? user.signupURL : ''), [Validators.pattern(this.patternURL)]),
      couponLink: new FormArray([
        new FormControl(user.couponLink ? true : false),
        new FormControl(user.couponLink ? user.couponLink : '', []),
      ]),
      sampleLink: new FormArray([
        new FormControl(user.sampleLink ? true : false),
        new FormControl(user.sampleLink ? user.sampleLink : '', [Validators.pattern(this.patternURL)]),        
      ]),
      trialLink: new FormArray([
        new FormControl(user.trialLink ? true : false),
        new FormControl(user.trialLink ? user.trialLink : '', [Validators.pattern(this.patternURL)]),        
      ]),
      affiliateLink: new FormArray([
        new FormControl(user.affiliateLink ? true : false),
        new FormControl(user.affiliateLink ? user.affiliateLink : '', [Validators.pattern(this.patternURL)]),        
      ]),
    });
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
      if(control[0].value && control[1].value != ''){
        console.log(control[1].value);
        data[o.id]= control[1].value;   
      }
    });

    this._qService.updateUser(data);
    this._qService.goNext(this._route);
  }
}

interface PartnerOfferData {
  isFree: boolean;
  priceLevel: number;
  price1: number;
  price2: number;
  signupURL: string;
  couponLink?: String;
  sampleLink?: string;
  trialLink?: string;
  affiliateLink?: string;
}
