import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateAddComponent } from './affiliate-add.component';

describe('AffiliateAddComponent', () => {
  let component: AffiliateAddComponent;
  let fixture: ComponentFixture<AffiliateAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
