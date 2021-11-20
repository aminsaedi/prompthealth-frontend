import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSubscriptionComponent } from './payment-subscription.component';

describe('PaymentSubscriptionComponent', () => {
  let component: PaymentSubscriptionComponent;
  let fixture: ComponentFixture<PaymentSubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
