import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit {

  @Input() src: string = 'assets/video/sample-audio.mp3';
  @Input() audioStyle: {[k: string]: string | number};
  @Input() audioClass: string[] | string | {[k: string]: any};
  get currentTime() {
    return (this.player && this.player.currentTime > 0) ? Math.round(this.player.currentTime) : 0;
  }

  get duration() {
    return (this.player && this.player.duration > 0) ? Math.round(this.player.duration) : 0;
  }

  get currentTimePercent() {
    if(this.player && this.player.duration && this.player.currentTime) {
      return this.player.currentTime / this.player.duration * 100;
    }else {
      return 0;
    }
  }

  public isPlayerReady: boolean = false;
  public isPlayerPlaying: boolean = false;
  public _src: SafeResourceUrl;

  public timeCurrent: number = 0 // unit: s;


  @ViewChild('audioPlayer') private _player: ElementRef;
  public player: HTMLAudioElement;

  constructor(
    private _sanitizer: DomSanitizer,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this._src = this._sanitizer.bypassSecurityTrustResourceUrl(this.src);
  }

  ngAfterViewInit() {
    this.initPlayer();
  }

  initPlayer() {
    this.player = this._player.nativeElement;
    this._changeDetector.detectChanges();
    const p = this.player;
    if(p) {
      p.addEventListener('canplay', () => {this.onPlayerReady(); })
      p.addEventListener('play', () => {this.onPlayerStarted(); });
      p.addEventListener('pause', () => { this.onPlayerPaused(); });
      p.addEventListener('ended', () => { this.onPlayerDone(); });
      p.addEventListener('timeupdate', () => { this.onPlayerTimeUpdated(); });

    } else {
      console.error('Cannot find audio player');
    }
  }

  togglePlayerState() {
    if(!this.player) {
      console.error('cannot find player');
      return;
    }

    if(this.isPlayerPlaying) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  onPlayerReady() {
    this.isPlayerReady = true;
  }

  onPlayerStarted() {
    this.isPlayerPlaying = true;
  }
  onPlayerPaused() {
    this.isPlayerPlaying = false;
  }
  onPlayerDone() {
    this.isPlayerPlaying = false;
  }
  onPlayerTimeUpdated() {
  }
}


