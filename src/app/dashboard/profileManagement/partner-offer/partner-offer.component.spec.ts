import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerOfferComponent } from './partner-offer.component';

describe('PartnerOfferComponent', () => {
  let component: PartnerOfferComponent;
  let fixture: ComponentFixture<PartnerOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
