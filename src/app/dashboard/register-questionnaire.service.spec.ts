import { TestBed } from '@angular/core/testing';

import { RegisterQuestionnaireService } from './register-questionnaire.service';

describe('RegisterPartnerService', () => {
  let service: RegisterQuestionnaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterQuestionnaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
