import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemCheckboxGroupComponent } from './form-item-checkbox-group.component';

describe('FormItemCheckboxGroupComponent', () => {
  let component: FormItemCheckboxGroupComponent;
  let fixture: ComponentFixture<FormItemCheckboxGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemCheckboxGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemCheckboxGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
