import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPartnerOfferComponent } from './form-partner-offer.component';

describe('FormPartnerOfferComponent', () => {
  let component: FormPartnerOfferComponent;
  let fixture: ComponentFixture<FormPartnerOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormPartnerOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPartnerOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
