import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingPartnerComponent } from './listing-partner.component';

describe('ListingPartnerComponent', () => {
  let component: ListingPartnerComponent;
  let fixture: ComponentFixture<ListingPartnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingPartnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
