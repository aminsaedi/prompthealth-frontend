import { TestBed } from '@angular/core/testing';

import { GuardIfNotEligibleToAcessEditorGuard } from './guard-if-not-eligible-to-access-editor.guard';

describe('GuardIfNotEligibleToAcessEditorGuard', () => {
  let guard: GuardIfNotEligibleToAcessEditorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfNotEligibleToAcessEditorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
