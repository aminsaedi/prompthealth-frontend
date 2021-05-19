import { TestBed } from '@angular/core/testing';

import { RegisterQuestionnaireCompleteGuard } from './register-questionnaire-complete.guard';

describe('RegisterQuestionnaireCompleteGuardGuard', () => {
  let guard: RegisterQuestionnaireCompleteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RegisterQuestionnaireCompleteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
