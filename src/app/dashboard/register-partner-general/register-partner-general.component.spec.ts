import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPartnerGeneralComponent } from './register-partner-general.component';

describe('RegisterPartnerGeneralComponent', () => {
  let component: RegisterPartnerGeneralComponent;
  let fixture: ComponentFixture<RegisterPartnerGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPartnerGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPartnerGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
