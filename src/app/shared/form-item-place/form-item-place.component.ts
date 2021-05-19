import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'form-item-place',
  templateUrl: './form-item-place.component.html',
  styleUrls: ['./form-item-place.component.scss']
})
export class FormItemPlaceComponent implements OnInit {

  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() max: number;
  @Input() submitted: boolean = false;
  @Input() controllerGroup: FormGroup;
  @Input() disabled: boolean = false;

  @Output() selectPlace = new EventEmitter<void>();

  get fPlaceName() { return this.controllerGroup.controls.firstName; }
  get fPlaceId() { return this.controllerGroup.controls.placeId; }

  private host: HTMLElement;

  constructor(
    private _maps: MapsAPILoader,
    private _changeDetector: ChangeDetectorRef,
    _el: ElementRef,
  ) { 
    this.host = _el.nativeElement;
  }

  ngOnInit(): void {

    const latStr = localStorage.getItem('ipLat');
    const lngStr = localStorage.getItem('ipLong');
    const lat = latStr ? Number(latStr) : 53.89;
    const lng = lngStr ? Number(lngStr) : -111.25;
    
    this._maps.load().then(() => {
      const options: google.maps.places.AutocompleteOptions = {
        bounds: {north: lat + 0.1, south: lat - 0.1, east: lng + 0.1, west: lng - 0.1},
        types: ['establishment'],
        componentRestrictions: {country: 'ca'},
        strictBounds: false
      }
      const autocomplete = new google.maps.places.Autocomplete(this.host.querySelector('#' + this.name), options);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if(place.place_id){
          this.setPlace(place);
        }
      });
    });
  }

  setPlace(p: google.maps.places.PlaceResult): void {
    const cs = this.controllerGroup.controls;
    cs.firstName.patchValue(p.name);
    cs.address.patchValue(p.formatted_address);
    cs.phone.patchValue(p.formatted_phone_number);
    cs.placeId.patchValue(p.place_id);
    cs.website.patchValue(p.website);

    p.address_components.forEach(c=>{
      if(c.types.indexOf('administrative_area_level_1') >= 0){ cs.state.patchValue(c.long_name); }
      else if(c.types.indexOf('postal_code') >= 0){ cs.zipcode.patchValue(c.long_name); }
      else if(c.types.indexOf('locality') >= 0){ cs.city.patchValue(c.long_name); }
    });
    
    if(p.geometry){
      cs.latitude.patchValue(p.geometry.location.lat());
      cs.longitude.patchValue(p.geometry.location.lng())
    }
    else{
      cs.latitude.patchValue(0);
      cs.longitude.patchValue(0);
      cs.state.patchValue('');
      cs.city.patchValue('');
      cs.zipcode.patchValue('');
    }

    this._changeDetector.markForCheck();
    this._changeDetector.detectChanges();
    this.selectPlace.emit();
  }

  removePlace(): void {
    const cs = this.controllerGroup.controls;
    cs.placeId.patchValue('');
    this.selectPlace.emit();
  }

}
