import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ModalService } from './modal.service';

/* Not run in CI (no ng test there): the contract every modal, menu and filter
 * relies on, runnable with ng test on Node 14. */
describe('ModalService', () => {
  let service: ModalService; let location: Location; let router: Router;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RouterTestingModule] });
    service = TestBed.inject(ModalService);
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);
  });

  /* The address bar is percent-encoded and navigate encodes again, so what
   * comes out has to be decoded exactly once, or every modal re-encodes it. */
  it('round-trips an encoded path and query without encoding them twice', () => {
    const address = '/community/article/crown-vs-veneers-what%E2%80%99s?utm_campaign=Growth%20Dentists&keyloc=Toronto,%20ON';
    location.go(address);
    const [path, queryParams] = service.currentPathAndQueryParams;
    expect(path).toBe('/community/article/crown-vs-veneers-what\u2019s');
    expect(queryParams).toEqual({ utm_campaign: 'Growth Dentists', keyloc: 'Toronto, ON' });
    expect(router.serializeUrl(router.createUrlTree([path], { queryParams }))).toBe(address);
  });

  it('reads + as a space and keeps repeated keys and values containing =', () => {
    location.go('/?utm_content=a+b&tag=x&tag=y&t=a%3Db');
    const [path, queryParams] = service.currentPathAndQueryParams;
    expect(path).toBe('/');
    expect(queryParams).toEqual({ utm_content: 'a b', tag: ['x', 'y'], t: 'a=b' });
  });
});
