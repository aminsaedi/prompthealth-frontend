import { TestBed } from '@angular/core/testing';

import { PostManagerService } from './post-manager.service';

describe('PostManagerService', () => {
  let service: PostManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
