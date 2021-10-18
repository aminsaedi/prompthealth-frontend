import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePromotionComponent } from './profile-promotion.component';

describe('ProfilePromotionComponent', () => {
  let component: ProfilePromotionComponent;
  let fixture: ComponentFixture<ProfilePromotionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilePromotionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
