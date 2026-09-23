import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';
import { MetaPixelService } from 'src/app/shared/services/meta-pixel.service';
import { IGrowthVideo } from '../growth-landing.model';

/* HTMLMediaElement.NETWORK_NO_SOURCE */
const NETWORK_NO_SOURCE = 3;

/*
 * The landing's own video: self-hosted, click to play, captions on.
 *
 * The <video> is in the page from the start, with preload="none", so nothing
 * but the poster is fetched until the tap. It has to exist before the tap
 * because WebKit plays media with sound only when play() is called inside the
 * user's gesture: a <video autoplay> inserted after the tap can sit paused on
 * an iPhone. Until then the native controls are off and the overlay button
 * covers the player, and its click handler calls play() synchronously.
 */
@Component({
  selector: 'hero-video',
  templateUrl: './hero-video.component.html',
  styleUrls: ['./hero-video.component.scss'],
})
export class HeroVideoComponent {

  @Input() video: IGrowthVideo;
  /* The landing's registry key, for the analytics label. */
  @Input() landingKey: string;

  @ViewChild('player', { static: true }) private player: ElementRef;

  public started = false;
  private reported = false;

  constructor(
    private _analytics: AnalyticsService,
    private _pixel: MetaPixelService,
  ) {}

  private get element(): HTMLVideoElement {
    return this.player ? this.player.nativeElement as HTMLVideoElement : null;
  }

  start(): void {
    const video = this.element;
    if (!video) { return; }
    this.started = true;
    try {
      /* The <source> gets its address from a binding, and a browser can run its
       * source selection before the binding lands and give up. load() runs it
       * again; it is still inside the gesture, so play() is still allowed. */
      if (video.networkState === NETWORK_NO_SOURCE) {
        video.load();
      }
      const playing: any = video.play();
      if (playing && typeof playing.catch === 'function') {
        playing.catch(() => {
          /* Refused or failed. The overlay is gone, so the native controls
           * are there to try again. */
        });
      }
      /* The overlay that held focus is about to be removed. The video can take
       * focus only once its controls are on, after this change detection. */
      setTimeout(() => {
        try { video.focus(); } catch (e) { /* focus stays on the page */ }
      });
    } catch (e) {
      /* as above */
    }
  }

  /* `default` on the track is not honoured everywhere, and she asked for
   * captions on from the first second. */
  onLoadedMetadata(): void {
    const video = this.element;
    try {
      const tracks = video && video.textTracks;
      if (tracks && tracks.length > 0) {
        tracks[0].mode = 'showing';
      }
    } catch (e) {
      /* the native captions menu still works */
    }
  }

  /* Reported once per page, on the first play however it started. */
  onPlay(): void {
    this.started = true;
    if (this.reported) { return; }
    this.reported = true;
    this._analytics.event('video_play', { video_title: this.landingKey + '-hero' });
    this._pixel.trackCustom('HeroVideoPlay');
  }
}
