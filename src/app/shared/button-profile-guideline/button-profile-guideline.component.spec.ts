import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonProfileGuidelineComponent } from './button-profile-guideline.component';

describe('ButtonProfileGuidelineComponent', () => {
  let component: ButtonProfileGuidelineComponent;
  let fixture: ComponentFixture<ButtonProfileGuidelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonProfileGuidelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonProfileGuidelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
