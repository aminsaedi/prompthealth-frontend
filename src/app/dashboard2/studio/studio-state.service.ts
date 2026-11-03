import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IPro2Me, Pro2Service } from 'src/app/shared/services/pro2.service';

/*
 * The Studio's overview (GET /pro2/me), shared by the shell and its tabs so
 * the cycle, the allowance and the onboarding step read the same everywhere.
 * Provided by the shell component, so it lives as long as the Studio is open.
 */
@Injectable()
export class StudioStateService {
  private readonly _me = new BehaviorSubject<IPro2Me>(null);

  get me(): IPro2Me { return this._me.value; }
  get me$(): Observable<IPro2Me> { return this._me.asObservable(); }

  constructor(private _pro2: Pro2Service) {}

  refresh(): Observable<IPro2Me> {
    return this._pro2.me().pipe(tap(me => this._me.next(me)));
  }
}
