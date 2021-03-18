import { TestBed } from '@angular/core/testing';

import { RegisterPartnerCompleteGuard } from './register-partner-complete.guard';

describe('RegisterPartnerCompleteGuardGuard', () => {
  let guard: RegisterPartnerCompleteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RegisterPartnerCompleteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
