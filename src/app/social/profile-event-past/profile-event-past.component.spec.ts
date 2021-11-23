import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEventPastComponent } from './profile-event-past.component';

describe('ProfileEventPastComponent', () => {
  let component: ProfileEventPastComponent;
  let fixture: ComponentFixture<ProfileEventPastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileEventPastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEventPastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
