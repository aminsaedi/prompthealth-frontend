import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPartnerCompleteComponent } from './register-partner-complete.component';

describe('RegisterPartnerCompleteComponent', () => {
  let component: RegisterPartnerCompleteComponent;
  let fixture: ComponentFixture<RegisterPartnerCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPartnerCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPartnerCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
