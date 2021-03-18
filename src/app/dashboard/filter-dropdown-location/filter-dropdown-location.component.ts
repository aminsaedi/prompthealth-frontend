import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'filter-dropdown-location',
  templateUrl: './filter-dropdown-location.component.html',
  styleUrls: ['./filter-dropdown-location.component.scss']
})
export class FilterDropdownLocationComponent implements OnInit {

  @Input() data: Data;
  @Output() changeState = new EventEmitter<string>();
  @Output() changeValue = new EventEmitter<void>();

  public formAddress:FormGroup;

  constructor(_fb: FormBuilder) {
    this.formAddress = _fb.group({
      address: new FormControl(),
      state: new FormControl(),
      city: new FormControl(),
      zipcode: new FormControl(),
      latitude: new FormControl(),
      longitude: new FormControl(),
    })
  }

  ngOnInit(): void {
    this.formAddress.controls.address.setValue( this.data.latLng ? this.data.address : this.data.defaultAddress );
  }

  reset() {
    this.data.distance = this.data.distanceMax;
    this.formAddress.controls.address.setValue(this.data.defaultAddress);
    this.data.latLng = null;
    this.changeState.emit('clear');
    this.changeValue.emit();
  }

  save() {
    this.data.address = this.data.address.trim(); 
    this.changeState.emit('save'); 
  }

  private timer: any;
  onChange(){
    if(this.timer){ clearTimeout(this.timer); }
    this.timer = setTimeout(()=>{ this.changeValue.emit(); },500)
  }

  onSelectAddress(){
    if(this.timer){ clearTimeout(this.timer); }
    this.data.latLng = [this.formAddress.controls.latitude.value, this.formAddress.controls.longitude.value];
    this.data.address = this.formAddress.controls.address.value;
    this.changeValue.emit();
  }
}

interface Data{
  address: string;
  distance: number; 
  defaultAddress: string; 
  latLng: number[];
  distanceMin: number;
  distanceMax: number;
}