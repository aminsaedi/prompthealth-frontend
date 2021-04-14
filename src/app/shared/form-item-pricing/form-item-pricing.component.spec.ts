import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemPricingComponent } from './form-item-pricing.component';

describe('FormItemPricingComponent', () => {
  let component: FormItemPricingComponent;
  let fixture: ComponentFixture<FormItemPricingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemPricingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
