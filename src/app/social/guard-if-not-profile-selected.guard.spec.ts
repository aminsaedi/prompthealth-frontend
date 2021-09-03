import { TestBed } from '@angular/core/testing';

import { GuardIfNotProfileSelectedGuard } from './guard-if-not-profile-selected.guard';

describe('GuardIfNotProfileSelectedGuard', () => {
  let guard: GuardIfNotProfileSelectedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfNotProfileSelectedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
