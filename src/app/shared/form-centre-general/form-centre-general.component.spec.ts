import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCentreGeneralComponent } from './form-centre-general.component';

describe('FormCentreGeneralComponent', () => {
  let component: FormCentreGeneralComponent;
  let fixture: ComponentFixture<FormCentreGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCentreGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCentreGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
