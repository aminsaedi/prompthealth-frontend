import { TestBed } from '@angular/core/testing';

import { RegisterQuestionnaireGuard } from './register-questionnaire.guard';

describe('RegisterQuestionnaireGuard', () => {
  let guard: RegisterQuestionnaireGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RegisterQuestionnaireGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
