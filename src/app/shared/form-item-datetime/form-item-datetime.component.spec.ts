import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemDatetimeComponent } from './form-item-datetime.component';

describe('FormItemDatetimeComponent', () => {
  let component: FormItemDatetimeComponent;
  let fixture: ComponentFixture<FormItemDatetimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemDatetimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemDatetimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
