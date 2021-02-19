import { TestBed } from '@angular/core/testing';

import { ProfileManagementChildGuard } from './profile-management-child.guard';

describe('ProfileManagementChildGuard', () => {
  let guard: ProfileManagementChildGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ProfileManagementChildGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
