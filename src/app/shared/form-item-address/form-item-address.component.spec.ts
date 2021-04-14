import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemAddressComponent } from './form-item-address.component';

describe('FormItemAddressComponent', () => {
  let component: FormItemAddressComponent;
  let fixture: ComponentFixture<FormItemAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
