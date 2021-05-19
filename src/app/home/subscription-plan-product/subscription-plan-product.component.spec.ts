import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { subscriptionPlanProductComponent } from './subscription-plan-product.component';

describe('subscriptionPlanProductComponent', () => {
  let component: subscriptionPlanProductComponent;
  let fixture: ComponentFixture<subscriptionPlanProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ subscriptionPlanProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(subscriptionPlanProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
