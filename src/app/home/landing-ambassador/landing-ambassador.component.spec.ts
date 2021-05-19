import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingAmbassadorComponent } from './landing-ambassador.component';

describe('LandingAmbassadorComponent', () => {
  let component: LandingAmbassadorComponent;
  let fixture: ComponentFixture<LandingAmbassadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingAmbassadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingAmbassadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
