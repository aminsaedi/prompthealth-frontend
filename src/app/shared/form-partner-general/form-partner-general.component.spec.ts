import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPartnerGeneralComponent } from './form-partner-general.component';

describe('FormPartnerGeneralComponent', () => {
  let component: FormPartnerGeneralComponent;
  let fixture: ComponentFixture<FormPartnerGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormPartnerGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPartnerGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
