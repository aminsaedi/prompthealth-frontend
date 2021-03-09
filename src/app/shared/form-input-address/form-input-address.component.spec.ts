import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputAddressComponent } from './form-input-address.component';

describe('FormInputAddressComponent', () => {
  let component: FormInputAddressComponent;
  let fixture: ComponentFixture<FormInputAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
