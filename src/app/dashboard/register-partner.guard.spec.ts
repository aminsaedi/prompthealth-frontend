import { TestBed } from '@angular/core/testing';

import { RegisterPartnerGuard } from './register-partner.guard';

describe('RegisterPartnerGuard', () => {
  let guard: RegisterPartnerGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RegisterPartnerGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
