import { TestBed } from '@angular/core/testing';

import { GuardIfDataNotSetGuard } from './guard-if-data-not-set.guard';

describe('GuardIfDataNotSetGuard', () => {
  let guard: GuardIfDataNotSetGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfDataNotSetGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
