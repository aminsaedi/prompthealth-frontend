import { TestBed } from '@angular/core/testing';

import { AmbassadorProgramGuardGuard } from './ambassador-program-guard.guard';

describe('AmbassadorProgramGuardGuard', () => {
  let guard: AmbassadorProgramGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AmbassadorProgramGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
