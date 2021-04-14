import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemServiceComponent } from './form-item-service.component';

describe('FormItemServiceComponent', () => {
  let component: FormItemServiceComponent;
  let fixture: ComponentFixture<FormItemServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
