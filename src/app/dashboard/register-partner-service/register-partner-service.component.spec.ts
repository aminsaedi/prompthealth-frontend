import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPartnerServiceComponent } from './register-partner-service.component';

describe('RegisterPartnerServiceComponent', () => {
  let component: RegisterPartnerServiceComponent;
  let fixture: ComponentFixture<RegisterPartnerServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPartnerServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPartnerServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
