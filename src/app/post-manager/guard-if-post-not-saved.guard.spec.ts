import { TestBed } from '@angular/core/testing';

import { GuardIfPostNotSavedGuard } from './guard-if-post-not-saved.guard';

describe('GuardIfPostNotSavedGuard', () => {
  let guard: GuardIfPostNotSavedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfPostNotSavedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
