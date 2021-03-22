import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPartnerServiceComponent } from './form-partner-service.component';

describe('FormPartnerServiceComponent', () => {
  let component: FormPartnerServiceComponent;
  let fixture: ComponentFixture<FormPartnerServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormPartnerServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPartnerServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
