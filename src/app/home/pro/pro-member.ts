import { Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';

/* Resolves once the browser knows whether someone is signed in. */
export function signedIn(profileService: ProfileManagementService): Observable<boolean> {
  return new Observable<string>(subscriber => {
    subscriber.next(profileService.loginStatus);
    const sub = profileService.loginStatusChanged().subscribe(status => subscriber.next(status));
    return () => sub.unsubscribe();
  }).pipe(
    filter(status => status === 'loggedIn' || status === 'notLoggedIn'),
    first(),
    map(status => status === 'loggedIn'),
  );
}
