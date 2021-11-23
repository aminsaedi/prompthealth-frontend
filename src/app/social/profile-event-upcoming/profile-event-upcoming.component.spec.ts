import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEventUpcomingComponent } from './profile-event-upcoming.component';

describe('ProfileEventUpcomingComponent', () => {
  let component: ProfileEventUpcomingComponent;
  let fixture: ComponentFixture<ProfileEventUpcomingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileEventUpcomingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEventUpcomingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
