import { TestBed } from '@angular/core/testing';

import { GuardIfNewReferralIncompletedGuard } from './guard-if-new-referral-incompleted.guard';

describe('GuardIfNewReferralIncompletedGuard', () => {
  let guard: GuardIfNewReferralIncompletedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfNewReferralIncompletedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
