import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'form-item-address',
  templateUrl: './form-item-address.component.html',
  styleUrls: ['./form-item-address.component.scss']
})
export class FormItemAddressComponent implements OnInit {

  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() submitted: boolean = false;
  @Input() controllerGroup: FormGroup;
  @Input() disabled: boolean = false;

  @Output() selectAddress = new EventEmitter<void>();


  get fAddress(){ return this.controllerGroup.controls.address; }
  
  private host: HTMLElement;

  constructor(
    private _maps: MapsAPILoader,
    private _changeDetector: ChangeDetectorRef,
    _el: ElementRef,
  ) { 
    this.host = _el.nativeElement;
  }

  ngOnInit(): void {
    this._maps.load().then(() => {
      const autocomplete = new google.maps.places.Autocomplete(this.host.querySelector('#' + this.name));
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        this.setAddress(place);
      });
    });
  }

  onChangeAddress(){
    const cs = this.controllerGroup.controls;
    cs.latitude.patchValue(0);
    cs.longitude.patchValue(0);
    cs.state.patchValue('');
    cs.city.patchValue('');
    cs.zipcode.patchValue('');  
  }

  setAddress(p: google.maps.places.PlaceResult){
    const cs = this.controllerGroup.controls;
    cs.address.patchValue(p.formatted_address);

    if(p.geometry){
      cs.latitude.patchValue(p.geometry.location.lat());
      cs.longitude.patchValue(p.geometry.location.lng());

      p.address_components.forEach(c=>{
        if(c.types.indexOf('administrative_area_level_1') >= 0){ cs.state.patchValue(c.long_name); }
        else if(c.types.indexOf('postal_code') >= 0){ cs.zipcode.patchValue(c.long_name); }
        else if(c.types.indexOf('locality') >= 0){ cs.city.patchValue(c.long_name); }
      });
      
      this._changeDetector.markForCheck();
      this.selectAddress.emit();
    }
    else{
      cs.latitude.patchValue(0);
      cs.longitude.patchValue(0);
      cs.state.patchValue('');
      cs.city.patchValue('');
      cs.zipcode.patchValue('');
    }
  }
}