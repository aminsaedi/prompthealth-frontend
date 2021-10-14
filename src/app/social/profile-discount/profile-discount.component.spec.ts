import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDiscountComponent } from './profile-discount.component';

describe('ProfileDiscountComponent', () => {
  let component: ProfileDiscountComponent;
  let fixture: ComponentFixture<ProfileDiscountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileDiscountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
