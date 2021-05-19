import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPractitionerGeneralComponent } from './register-practitioner-general.component';

describe('RegisterPractitionerGeneralComponent', () => {
  let component: RegisterPractitionerGeneralComponent;
  let fixture: ComponentFixture<RegisterPractitionerGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPractitionerGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPractitionerGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
