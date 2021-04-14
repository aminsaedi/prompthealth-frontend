import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonTutorialComponent } from './button-tutorial.component';

describe('ButtonTutorialComponent', () => {
  let component: ButtonTutorialComponent;
  let fixture: ComponentFixture<ButtonTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
