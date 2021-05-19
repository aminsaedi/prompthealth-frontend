import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPractitionerServiceComponent } from './form-practitioner-service.component';

describe('FormPractitionerServiceComponent', () => {
  let component: FormPractitionerServiceComponent;
  let fixture: ComponentFixture<FormPractitionerServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormPractitionerServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPractitionerServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
