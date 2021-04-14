import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormProviderGeneralComponent } from './form-provider-general.component';

describe('FormProviderGeneralComponent', () => {
  let component: FormProviderGeneralComponent;
  let fixture: ComponentFixture<FormProviderGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormProviderGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormProviderGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
