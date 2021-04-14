import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemTextareaComponent } from './form-item-textarea.component';

describe('FormItemTextareaComponent', () => {
  let component: FormItemTextareaComponent;
  let fixture: ComponentFixture<FormItemTextareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemTextareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
