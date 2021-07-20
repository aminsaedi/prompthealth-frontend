import { TestBed } from '@angular/core/testing';

import { AudioRecordService } from './audio-record.service';

describe('AudioRecordService', () => {
  let service: AudioRecordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioRecordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
