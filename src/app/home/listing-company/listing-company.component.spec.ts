import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingCompanyComponent } from './listing-company.component';

describe('ListingCompanyComponent', () => {
  let component: ListingCompanyComponent;
  let fixture: ComponentFixture<ListingCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
