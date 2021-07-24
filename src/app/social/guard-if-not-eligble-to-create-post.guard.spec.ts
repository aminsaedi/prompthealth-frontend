import { TestBed } from '@angular/core/testing';

import { GuardIfNotEligbleToCreatePostGuard } from './guard-if-not-eligble-to-create-post.guard';

describe('GuardIfNotEligbleToCreatePostGuard', () => {
  let guard: GuardIfNotEligbleToCreatePostGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfNotEligbleToCreatePostGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
