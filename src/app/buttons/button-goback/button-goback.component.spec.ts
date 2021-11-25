import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonGobackComponent } from './button-goback.component';

describe('ButtonGobackComponent', () => {
  let component: ButtonGobackComponent;
  let fixture: ComponentFixture<ButtonGobackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonGobackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonGobackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
