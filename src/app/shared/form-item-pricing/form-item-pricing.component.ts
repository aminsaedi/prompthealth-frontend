import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { IUserDetail } from 'src/app/models/user-detail';
import { validators } from '../../_helpers/form-settings';

@Component({
  selector: 'form-item-pricing',
  templateUrl: './form-item-pricing.component.html',
  styleUrls: ['./form-item-pricing.component.scss']
})
export class FormItemPricingComponent implements OnInit {

  @Input() data: IUserDetail;
  @Input() formGroup: FormGroup;
  @Input() submitted: boolean = false;
  @Input() disabled: boolean = false;

  public selectionList = priceRange;

  get f() { return this.formGroup.controls; }

  constructor() { }

  ngOnInit(): void {
    /** set validator for price */
    if(this.f.priceMode.value == 'input') {
      this.f.exactPricing.setValidators(validators.exactPricingRequired);
    }else{
      this.f.exactPricing.setValidators(validators.exactPricing);
      this.f.price_per_hours.setValidators(Validators.required);
    }
    this.f.priceMode.valueChanges.subscribe(value=>{
      if(value == 'input'){
        this.f.exactPricing.setValidators(validators.exactPricingRequired);
        this.f.price_per_hours.clearValidators();
      }else{
        this.f.price_per_hours.setValidators(Validators.required);
        this.f.exactPricing.setValidators(validators.exactPricing);
      }
      this.f.exactPricing.updateValueAndValidity();
      this.f.price_per_hours.updateValueAndValidity();
    });
  }

  /** priceMode == input --> set closest priceRange; else exactPricing = null */
  setValue(){
    if(this.f.priceMode.value == 'input'){
      const price = Number(this.f.exactPricing.value);
      for(let p of priceRange){
        if(p.minmax[0] <= price && price <= p.minmax[1]){
          this.f.price_per_hours.setValue(p.value);
        }
      }
    }else{
      this.f.exactPricing.setValue('');
    }
  }
}

export const priceRange = [
  { id: 'price1', label: 'Not Critical', value: 'Not Critical', minmax: [-100, 0] },
  { id: 'price2', label: '< $50', value: '< $50', minmax: [0, 50] },
  { id: 'price3', label: '$50-100', value: '$50-100', minmax: [50, 100] },
  { id: 'price4', label: '$100-200', value: '$100-200', minmax: [100, 200] },
  { id: 'price5', label: '$200-500', value: '$200-500', minmax: [200, 500] },
  { id: 'price6', label: '$500-1000', value: '$500-1000', minmax: [500, 1000] },
  { id: 'price7', label: '> $1000', value: '$1000', minmax: [1000, 1000000] },
];
