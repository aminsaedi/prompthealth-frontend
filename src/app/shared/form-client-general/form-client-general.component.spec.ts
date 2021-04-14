import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormClientGeneralComponent } from './form-client-general.component';

describe('FormClientGeneralComponent', () => {
  let component: FormClientGeneralComponent;
  let fixture: ComponentFixture<FormClientGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormClientGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormClientGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
