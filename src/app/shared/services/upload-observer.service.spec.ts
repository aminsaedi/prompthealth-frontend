import { TestBed } from '@angular/core/testing';

import { UploadObserverService } from './upload-observer.service';

describe('UploadObserverService', () => {
  let service: UploadObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
