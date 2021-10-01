import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFollowListComponent } from './profile-follow-list.component';

describe('ProfileFollowListComponent', () => {
  let component: ProfileFollowListComponent;
  let fixture: ComponentFixture<ProfileFollowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileFollowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileFollowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
