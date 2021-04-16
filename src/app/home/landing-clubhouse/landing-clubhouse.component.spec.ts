import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingClubhouseComponent } from './landing-clubhouse.component';

describe('LandingClubhouseComponent', () => {
  let component: LandingClubhouseComponent;
  let fixture: ComponentFixture<LandingClubhouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingClubhouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingClubhouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
