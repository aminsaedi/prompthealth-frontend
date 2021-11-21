import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { AudioRecordService, RecordedAudioOutput } from '../audio-record.service';
import getBlobDuration from 'get-blob-duration';
import { Profile } from 'src/app/models/profile';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-voice-recorder',
  templateUrl: './modal-voice-recorder.component.html',
  styleUrls: ['./modal-voice-recorder.component.scss']
})
export class ModalVoiceRecorderComponent implements OnInit {

  @Input() audioData: AudioData = null;
  @Output() onSave = new EventEmitter<AudioData>();


  get userImage(): string { return this.user ? this.user.profileImage : ''; }
  get user(): Profile { return this._profileService.profile; }
  safeResourceUrlOf(url: string): SafeResourceUrl { return this._sanitizer.bypassSecurityTrustUrl(url); }

  public _audioData: AudioData = null;
  public isAudioRecording: boolean = false;
  public isAudioRecorderBusy: boolean = false;
  public isAudioPlaying: boolean = false;
  public timeAudioPlayCurrent: number = 0; //unit: ms;
  public timeAudioRecordingRemaining: number = 0; //unit: s;
  public percentAudioPlayCurrent: number = 0;
  public recorder: any;

  private subscriptionRecordeingFailed: Subscription;
  private subscriptionRecordingStarted: Subscription;
  private subscriptionTimerRecording: Subscription;
  private subscriptionRecordingDone: Subscription;
  private subscriptionProcessingDone: Subscription;
  
  @ViewChild('audioPlayer') private audioPlayer: ElementRef;
  
  constructor(
    private _audioRecorder: AudioRecordService,
    private _changeDetector: ChangeDetectorRef,
    private _toastr: ToastrService,
    private _profileService: ProfileManagementService,
    private _sanitizer: DomSanitizer,
    private _modalService: ModalService,
  ) { }

  ngOnChanges(e: SimpleChanges) {
    if(e?.audioData?.currentValue != e?.audioData?.previousValue) {
      this._audioData = e.audioData.currentValue;
    }
  }

  ngOnDestroy() {
    this.subscriptionRecordeingFailed?.unsubscribe();
    this.subscriptionRecordingStarted?.unsubscribe();
    this.subscriptionTimerRecording?.unsubscribe();
    this.subscriptionRecordingDone?.unsubscribe();
    this.subscriptionProcessingDone?.unsubscribe();
  }

  ngOnInit(): void {
    this._audioData = this.audioData ? this.audioData.copy() : null;
    this.subscriptionRecordeingFailed = this._audioRecorder.recordingFailed().subscribe((message) => {
      this.onAudioRecordingFaild(message);
    });

    this.subscriptionRecordingStarted = this._audioRecorder.recordingStarted().subscribe(() => {
      this.onAudioRecordingStarted();
    });

    this.subscriptionTimerRecording =  this._audioRecorder.timerRecording().subscribe((seconds) => {
      this.onTimerAudioRecordingChanged(seconds);
    })

    this.subscriptionRecordingDone = this._audioRecorder.recordingDone().subscribe((data) => {
      this.onAudioRecordingDone(data);
    });

    this.subscriptionRecordingStarted = this._audioRecorder.processingStarted().subscribe(() => {
      this.isAudioRecorderBusy = true;
    });

    this.subscriptionProcessingDone = this._audioRecorder.processingDone().subscribe(() => {
      this.isAudioRecorderBusy = false;
    });
  }

  cancelAudioRecord() {
    this._audioData = this.audioData ? this.audioData.copy() : null;
    this._modalService.hide();
  }

  saveAudioRecord() {
    this.onSave.emit(this._audioData ? this._audioData.copy() : null);
    this._modalService.hide();
  }

  /** AUDIO RECORDER / PLAYER START */
  toggleAudioPlayerState() {
    if(!this.isAudioPlaying) {
      this.playAudioPlayer();
    } else {
      this.pauseAudioPlayer();
    }  
  }
  
  private intervalPlayAudio: any;
  playAudioPlayer() {
    const el = this.audioPlayer.nativeElement as HTMLAudioElement;
    if(el) {
      el.play();
      this.isAudioPlaying = true;
      this.intervalPlayAudio = setInterval(() => {
        this.timeAudioPlayCurrent += 100;
        const duration = this._audioData.duration * 1000;
        this.percentAudioPlayCurrent = this.timeAudioPlayCurrent / duration * 100;
        if(this.timeAudioPlayCurrent >= duration) {
          this.timeAudioPlayCurrent = duration * 1000;
          this.percentAudioPlayCurrent = 100;
          clearInterval(this.intervalPlayAudio);
          this.stopAudioPlayer();
        }
      }, 100);  
    }
  }
  pauseAudioPlayer() {
    const el = this.audioPlayer.nativeElement as HTMLAudioElement;
    if(el) {
      el.pause();
      this.isAudioPlaying = false;
      clearInterval(this.intervalPlayAudio);
    }
  }
  
  stopAudioPlayer() {
    const el = this.audioPlayer.nativeElement as HTMLAudioElement;
    if(el) {
      this.isAudioPlaying = false;
      this.timeAudioPlayCurrent = 0;
      this.percentAudioPlayCurrent = 0;
    }
  }
  
  async toggleAudioRecorderState() {
    const stateNext = this.isAudioRecording ? 'stop' : 'start';
  
    if(stateNext == 'start') {
      this.startAudioRecording();
    } else {
      this.stopAudioRecording();
    }
  }
  
  startAudioRecording() {
    this._audioRecorder.startRecording();
  }
  
  stopAudioRecording() {
    this._audioRecorder.stopRecording();    
  }
  
  onAudioRecordingFaild(message: string) {
    console.log('audio recording failed')
    this.isAudioRecording = false;
    this._changeDetector.detectChanges();
    this._toastr.error(message);    
  }
  
  onAudioRecordingStarted() {
    this.isAudioRecording = true;
    this._changeDetector.detectChanges();
  }
  
  onTimerAudioRecordingChanged(seconds: number) {
    this.timeAudioRecordingRemaining = seconds;      
    this._changeDetector.detectChanges();
  }
  
  onAudioRecordingDone(data: RecordedAudioOutput) {
    this.isAudioRecording = false;
    this._audioData = new AudioData(data);
    this._changeDetector.detectChanges();
  }
  
  disposeAudio() {
    this._audioData = null;
    this.timeAudioPlayCurrent = 0;
    this.percentAudioPlayCurrent = 0;
  }
  /** VOICE RECORDER END */


}


export class AudioData{
  public url: string = null;
  public filename: string = null;
  public file: Blob = null;
  public duration: number = null;
  public durationFormatted: string = null;
  
  constructor(data: RecordedAudioOutput) {
    this.url = URL.createObjectURL(data.blob);
    this.filename = data.title;
    this.file = data.blob;
    getBlobDuration(data.blob).then((duration) => {
      this.duration = duration;
    });
  }

  copy() {
    return new AudioData({blob: this.file, title: this.filename});
  }
}