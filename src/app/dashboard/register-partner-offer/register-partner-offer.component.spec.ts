import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPartnerOfferComponent } from './register-partner-offer.component';

describe('RegisterPartnerOfferComponent', () => {
  let component: RegisterPartnerOfferComponent;
  let fixture: ComponentFixture<RegisterPartnerOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPartnerOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPartnerOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
