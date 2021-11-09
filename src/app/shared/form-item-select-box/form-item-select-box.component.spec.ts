import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemSelectBoxComponent } from './form-item-select-box.component';

describe('FormItemSelectBoxComponent', () => {
  let component: FormItemSelectBoxComponent;
  let fixture: ComponentFixture<FormItemSelectBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemSelectBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemSelectBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
