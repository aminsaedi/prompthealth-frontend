import { TestBed } from '@angular/core/testing';

import { GuardIfEditorLockedGuard } from './guard-if-editor-locked.guard';

describe('GuardIfEditorLockedGuard', () => {
  let guard: GuardIfEditorLockedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardIfEditorLockedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
