import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { latinize } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'filter-dropdown-location',
  templateUrl: './filter-dropdown-location.component.html',
  styleUrls: ['./filter-dropdown-location.component.scss']
})
export class FilterDropdownLocationComponent implements OnInit {

  @Input() data: Data;
  @Output() changeState = new EventEmitter<string>();
  @Output() changeValue = new EventEmitter<void>();

  public form:FormGroup;

  constructor(_fb: FormBuilder) {
    this.form = _fb.group({
      address: new FormControl(),
      state: new FormControl(),
      city: new FormControl(),
      zipcode: new FormControl(),
      latitude: new FormControl(),
      longitude: new FormControl(),
      distance: new FormControl(),
    })
  }

  ngOnInit(): void {
    this.form.controls.distance.setValue( this.data.distance ? this.data.distance : this.data.distanceMax);

    if(this.data.latLng){
      this.form.controls.address.setValue(this.data.address);
      this.form.controls.latitude.setValue(this.data.latLng[0]);
      this.form.controls.longitude.setValue(this.data.latLng[1]);
    }else {
      this.form.controls.address.setValue(this.data.defaultAddress);
      this.form.controls.latitude.setValue(this.data.defaultLatLng[0]);
      this.form.controls.longitude.setValue(this.data.defaultLatLng[1]);
    }
  }

  resetAddress(){
    this.form.controls.address.setValue(this.data.defaultAddress);
    this.form.controls.latitude.setValue(null);
    this.form.controls.longitude.setValue(null);
    // this.data.latLng = null;
    // this.data.address = this.data.defaultAddress;    
  }

  reset() {
    this.resetAddress();

    this.form.controls.distance.setValue(this.data.distanceMax);
    // this.data.distance = this.data.distanceMax;

    // this.changeState.emit('clear');
  }

  save() {
    this.data.distance = this.form.controls.distance.value;

    const [lat, lng] = [this.form.controls.latitude.value, this.form.controls.longitude.value];
    if(lat && lng){
      this.data.address = this.form.controls.address.value;
      this.data.latLng = [lat, lng];
    }else{
      this.resetAddress();
      this.data.latLng = null;
      this.data.address = this.data.defaultAddress;    
  }

    this.changeState.emit('save'); 
  }
}

interface Data{
  address: string;
  distance: number; 
  defaultAddress: string; 
  defaultLatLng: number[],
  latLng: number[];
  distanceMin: number;
  distanceMax: number;
}