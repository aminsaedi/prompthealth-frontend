import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCreditComponent } from './payment-credit.component';

describe('PaymentCreditComponent', () => {
  let component: PaymentCreditComponent;
  let fixture: ComponentFixture<PaymentCreditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentCreditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
