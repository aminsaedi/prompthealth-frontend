import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPractitionerServiceComponent } from './register-practitioner-service.component';

describe('RegisterPractitionerServiceComponent', () => {
  let component: RegisterPractitionerServiceComponent;
  let fixture: ComponentFixture<RegisterPractitionerServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPractitionerServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPractitionerServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
