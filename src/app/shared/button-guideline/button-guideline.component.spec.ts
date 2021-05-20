import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonGuidelineComponent } from './button-guideline.component';

describe('ButtonGuidelineComponent', () => {
  let component: ButtonGuidelineComponent;
  let fixture: ComponentFixture<ButtonGuidelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonGuidelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonGuidelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
