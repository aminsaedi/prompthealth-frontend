import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterQuestionnaireCompleteComponent } from './register-questionnaire-complete.component';

describe('RegisterQuestionnaireCompleteComponent', () => {
  let component: RegisterQuestionnaireCompleteComponent;
  let fixture: ComponentFixture<RegisterQuestionnaireCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterQuestionnaireCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterQuestionnaireCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
