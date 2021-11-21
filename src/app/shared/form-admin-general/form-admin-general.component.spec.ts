import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAdminGeneralComponent } from './form-admin-general.component';

describe('FormAdminGeneralComponent', () => {
  let component: FormAdminGeneralComponent;
  let fixture: ComponentFixture<FormAdminGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAdminGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAdminGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
