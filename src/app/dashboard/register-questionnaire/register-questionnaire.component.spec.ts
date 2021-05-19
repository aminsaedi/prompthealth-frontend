import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterQuestionnaireComponent } from './register-questionnaire.component';

describe('RegisterQuestionnaireComponent', () => {
  let component: RegisterQuestionnaireComponent;
  let fixture: ComponentFixture<RegisterQuestionnaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterQuestionnaireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
