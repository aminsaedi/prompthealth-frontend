import { TestBed } from '@angular/core/testing';

import { GuardIfNotLoggedInGuard } from './guard-if-not-logged-in.guard';

describe('GuardIfNotLoggedInGuard', () => {
  let guard: GuardIfNotLoggedInGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfNotLoggedInGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
