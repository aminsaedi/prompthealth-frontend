import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePartnerComponent } from './profile-partner.component';

describe('ProfilePartnerComponent', () => {
  let component: ProfilePartnerComponent;
  let fixture: ComponentFixture<ProfilePartnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilePartnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
