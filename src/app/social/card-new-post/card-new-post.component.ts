import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from 'src/app/_helpers/form-settings';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import getBlobDuration from 'get-blob-duration';
import { AudioRecordService, RecordedAudioOutput } from '../audio-record.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'card-new-post',
  templateUrl: './card-new-post.component.html',
  styleUrls: ['./card-new-post.component.scss']
})
export class CardNewPostComponent implements OnInit {

  get f() { return this.form.controls; }

  safeResourceUrlOf(url: string): SafeResourceUrl { return this._sanitizer.bypassSecurityTrustUrl(url); }

  public isMoreShown: boolean = false;
  public imagePreview: string | ArrayBuffer;

  public isAudioRecording: boolean = false;
  public isAudioPlaying: boolean = false;
  public timeAudioPlayCurrent: number = 0; //unit: ms;
  public percentAudioPlayCurrent: number = 0;
  public recorder: any;
  public audioData: AudioData = null;


  private form: FormGroup;
  @ViewChild('inputMedia') private inputMedia: ElementRef;
  @ViewChild('audioPlayer') private audioPlayer: ElementRef;
  @ViewChild('modalAudioRecorder') private modalAudioRecorder: ModalComponent;

  constructor(
    private _sharedService: SharedService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _sanitizer: DomSanitizer,
    private _audioRecorder: AudioRecordService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      description: new FormControl('', validators.publishPostDescription),
      authorId: new FormControl(null, validators.savePostAuthorId),
      media: new FormControl(),
    });

    this._audioRecorder.recordingFailed().subscribe((message) => {
      this.onAudioRecordingFaild(message);
    });

    this._audioRecorder.recordingStarted().subscribe((data) => {
      this.onAudioRecordingStarted();
    })

    this._audioRecorder.recordingDone().subscribe((data) => {
      this.onAudioRecordingDone(data);
    });
  }

  onClickButtonMedia() {
    const el = this.inputMedia.nativeElement as HTMLInputElement;
    if(el && !this.imagePreview) {
      el.click();
    }
  }

  async onSelectMedia(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){

      let image: {file: File | Blob, filename: string};

      try { 
        image = await this._sharedService.shrinkImageByFixedWidth(files[0], 800);
        this.f.media.setValue(image.file);
        const reader = new FileReader();
        reader.readAsDataURL(image.file);
        reader.onloadend = () => {
          this.imagePreview = reader.result;
        }
      } catch(err){
        this.f.media.setValue('');
        return;
      }
    }
  }

  onClickButtonRemoveMedia() {
    this.imagePreview = null;
    this.f.media.setValue('');
  }

  onClickButtonAudio() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: 'audio-recorder'}});
  }

  cancelAudioRecord() {
    this.modalAudioRecorder.goBack();
  }

  onClickButtonMore() {
    this.isMoreShown = !this.isMoreShown;
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
        const duration = this.audioData.duration * 1000;
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

  onAudioRecordingDone(data: RecordedAudioOutput) {
    this.isAudioRecording = false;
    this.audioData = new AudioData(data);
    this._changeDetector.detectChanges();
  }

  disposeAudio() {
    this.audioData = null;
    this.timeAudioPlayCurrent = 0;
    this.percentAudioPlayCurrent = 0;
  }
  /** VOICE RECORDER END */
}

class AudioData{
  public url: string = null;
  public name: string = null;
  public blob: Blob = null;
  public duration: number = null;
  public durationFormatted: string = null;
  
  constructor(data: RecordedAudioOutput) {
    this.url = URL.createObjectURL(data.blob);
    this.name = data.title;
    this.blob = data.blob;
    getBlobDuration(data.blob).then((duration) => {
      this.duration = duration;
    });
  }
}