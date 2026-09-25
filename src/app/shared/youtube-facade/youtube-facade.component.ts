import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { MediaPlaybackService } from '../services/media-playback.service';

/* The only ids an embed is ever built from. The address is marked trusted for
 * the iframe, which switches off Angular's sanitizer for it, so nothing but a
 * YouTube id may reach it. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
/* The width of the placeholder i.ytimg.com serves for a thumbnail it lacks. */
const MISSING_THUMBNAIL_WIDTH = 120;

/*
 * A YouTube video as a thumbnail and a play button until someone asks for it.
 *
 * An embed loads YouTube's whole player before anyone presses play, four times
 * over on a page with four videos, and this page's visitors arrive from paid
 * ads on phones.
 * The facade costs one image, loaded lazily, and nothing touches window until
 * the click. The click swaps in the privacy-enhanced player with autoplay, so it
 * plays on the page rather than sending the visitor to YouTube.
 *
 * On iOS Safari and in in-app browsers a freshly inserted iframe often ignores
 * autoplay, and the visitor taps the player's own button a second time. Loading
 * the IFrame Player API on click (about 165 KB) does not reliably fix that
 * either, so the second tap is accepted.
 *
 * When another player on the page starts, this one goes back to its thumbnail.
 * Removing the iframe is what stops YouTube's player, so the IFrame API is not
 * needed for that either.
 */
@Component({
  selector: 'youtube-facade',
  templateUrl: './youtube-facade.component.html',
  styleUrls: ['./youtube-facade.component.scss'],
})
export class YoutubeFacadeComponent implements OnChanges, OnDestroy {

  @Input() videoId: string;
  @Input() title = '';
  /* Shorts are 9:16; everything else YouTube serves is 16:9. */
  @Input() ratio: '9:16' | '16:9' = '16:9';

  public isPlaying = false;
  public thumbnail = '';
  public embedUrl: SafeResourceUrl = null;
  private triedFallback = false;
  private readonly playerId: string;
  private readonly otherStarted: Subscription;

  constructor(
    private _sanitizer: DomSanitizer,
    private _playback: MediaPlaybackService,
  ) {
    this.playerId = _playback.newPlayerId();
    this.otherStarted = _playback.started.subscribe(id => {
      if (id !== this.playerId && this.isPlaying) {
        this.stop();
      }
    });
  }

  get isValid(): boolean { return YOUTUBE_ID.test(this.videoId || ''); }
  get isPortrait(): boolean { return this.ratio === '9:16'; }

  ngOnChanges(): void {
    this.isPlaying = false;
    this.embedUrl = null;
    this.triedFallback = false;
    /* oardefault is the frame at the video's own shape, so a Short fills a 9:16
     * box. hqdefault is 4:3, letterboxed, but exists for every video. */
    this.thumbnail = this.isValid ? `https://i.ytimg.com/vi/${this.videoId}/oardefault.jpg` : '';
  }

  /* A missing thumbnail does not fail to load. i.ytimg.com answers 404 with a
   * real 120x90 grey JPEG, so the image fires load, not error, and would show
   * YouTube's placeholder stretched across the tile. Every real oardefault or
   * hqdefault is wider than that. */
  onThumbnailLoad(img: HTMLImageElement): void {
    if (img && img.naturalWidth > 0 && img.naturalWidth <= MISSING_THUMBNAIL_WIDTH) {
      this.onThumbnailError();
    }
  }

  onThumbnailError(): void {
    if (this.triedFallback || !this.isValid) { return; }
    this.triedFallback = true;
    this.thumbnail = `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
  }

  ngOnDestroy(): void {
    this.otherStarted.unsubscribe();
  }

  play(): void {
    if (!this.isValid) { return; }
    this.embedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${this.videoId}?autoplay=1&playsinline=1&rel=0`
    );
    this.isPlaying = true;
    this._playback.announce(this.playerId);
  }

  private stop(): void {
    this.isPlaying = false;
    this.embedUrl = null;
  }
}
