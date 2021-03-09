import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPartnerTermComponent } from './register-partner-term.component';

describe('RegisterPartnerTermComponent', () => {
  let component: RegisterPartnerTermComponent;
  let fixture: ComponentFixture<RegisterPartnerTermComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPartnerTermComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPartnerTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
