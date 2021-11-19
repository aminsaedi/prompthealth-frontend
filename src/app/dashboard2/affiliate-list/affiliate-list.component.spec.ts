import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateListComponent } from './affiliate-list.component';

describe('AffiliateListComponent', () => {
  let component: AffiliateListComponent;
  let fixture: ComponentFixture<AffiliateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
