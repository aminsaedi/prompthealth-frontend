import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemCheckboxComponent } from './form-item-checkbox.component';

describe('FormItemCheckboxComponent', () => {
  let component: FormItemCheckboxComponent;
  let fixture: ComponentFixture<FormItemCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
