import { TestBed } from '@angular/core/testing';

import { UniversalService, canonicalPathOf } from './universal.service';

describe('UniversalService', () => {
  let service: UniversalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

/* Not run in CI (no ng test there); the contract setMeta and PageComponent rely on. */
describe('canonicalPathOf', () => {
  it('drops the query, the fragment and matrix parameters', () => {
    expect(canonicalPathOf('/faq?utm_source=x#top')).toBe('/faq');
    expect(canonicalPathOf('/community;x=1/feed')).toBe('/community/feed');
    expect(canonicalPathOf('/community/feed?page=2')).toBe('/community/feed');
  });

  it('gives the root for an empty path or a bare query', () => {
    expect(canonicalPathOf('')).toBe('/');
    expect(canonicalPathOf('/?fbclid=y')).toBe('/');
  });
});
