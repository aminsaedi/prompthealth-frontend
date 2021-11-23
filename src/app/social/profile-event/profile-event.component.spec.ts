import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEventComponent } from './profile-event.component';

describe('ProfileEventComponent', () => {
  let component: ProfileEventComponent;
  let fixture: ComponentFixture<ProfileEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
