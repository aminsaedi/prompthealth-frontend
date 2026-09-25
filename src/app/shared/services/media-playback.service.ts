import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/*
 * One video at a time on a page.
 *
 * Every player on a growth landing starts with its sound on, and none knew of
 * the others: a visitor sampling the Shorts one after another heard each new
 * one over the last, and over the hero video. A player that starts announces
 * its id here, and every other player stops itself.
 *
 * Nothing is announced until someone presses play, so the server render never
 * reaches this.
 */
@Injectable({ providedIn: 'root' })
export class MediaPlaybackService {

  private started$ = new Subject<string>();
  private lastId = 0;

  /* The id of each player as it starts. A player ignores its own. */
  get started(): Observable<string> {
    return this.started$.asObservable();
  }

  /* One per player instance, taken once at construction. */
  newPlayerId(): string {
    this.lastId += 1;
    return 'player-' + this.lastId;
  }

  /* Called by a player as it starts playing. */
  announce(playerId: string): void {
    this.started$.next(playerId);
  }
}
