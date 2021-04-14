import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemCustomerHealthComponent } from './form-item-customer-health.component';

describe('FormItemCustomerHealthComponent', () => {
  let component: FormItemCustomerHealthComponent;
  let fixture: ComponentFixture<FormItemCustomerHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemCustomerHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemCustomerHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
