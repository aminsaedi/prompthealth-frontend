import { TestBed } from '@angular/core/testing';

import { GuardIfUserTypeClientGuard } from './guard-if-user-type-client.guard';

describe('GuardIfUserTypeClientGuard', () => {
  let guard: GuardIfUserTypeClientGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfUserTypeClientGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
