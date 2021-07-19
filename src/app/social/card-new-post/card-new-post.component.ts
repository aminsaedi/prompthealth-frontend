import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from 'src/app/_helpers/form-settings';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import getBlobDuration from 'get-blob-duration';


@Component({
  selector: 'card-new-post',
  templateUrl: './card-new-post.component.html',
  styleUrls: ['./card-new-post.component.scss']
})
export class CardNewPostComponent implements OnInit {

  get f() { return this.form.controls; }

  safeResourceUrlOf(url: string): SafeResourceUrl { return this._sanitizer.bypassSecurityTrustResourceUrl(url); }

  public isMoreShown: boolean = false;
  public imagePreview: string | ArrayBuffer;

  public isVoiceRecording: boolean = false;
  public isVoicePlaying: boolean = false;
  public timeVoicePlayCurrent: number = 0; //unit: ms;
  public percentVoicePlayCurrent: number = 0;
  public recorder: any;
  public audioData: AudioData = null;


  private form: FormGroup;
  @ViewChild('inputMedia') private inputMedia: ElementRef;
  @ViewChild('voicePlayer') private voicePlayer: ElementRef;
  @ViewChild('modalVoiceRecorder') private modalVoiceRecorder: ModalComponent;

  constructor(
    private _sharedService: SharedService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      description: new FormControl('', validators.publishPostDescription),
      authorId: new FormControl(null, validators.savePostAuthorId),
      media: new FormControl(),
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

  onClickButtonVoice() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: 'voice-recorder'}});
  }

  cancelVoiceRecord() {
    this.modalVoiceRecorder.goBack();
  }

  onClickButtonMore() {
    this.isMoreShown = !this.isMoreShown;
  }


  togglePlayingState() {
    if(!this.isVoicePlaying) {
      this.playVoice();
    } else {
      this.pauseVoice();
    }
  }

  private intervalPlayVoice: any;
  playVoice() {
    this.isVoicePlaying = true;
    this.intervalPlayVoice = setInterval(() => {
      this.timeVoicePlayCurrent += 100;
      const duration = 34.256584 * 1000;
      this.percentVoicePlayCurrent = this.timeVoicePlayCurrent / duration * 100;
      if(this.timeVoicePlayCurrent >= duration) {
        clearInterval(this.intervalPlayVoice);
        this.pauseVoice();
      }
    }, 100);
  }
  pauseVoice() {
    this.isVoicePlaying = false;
    clearInterval(this.intervalPlayVoice);
  }

  stopVoice() {
    
  }

  async toggleRecordingState() {
    const stateNext = this.isVoiceRecording ? 'stop' : 'start';
    if(!this.recorder) {
      try {
        await this.initRecorder(); 
      } catch (error) {
        console.log(error);
        return;
      }
    }

    if(stateNext == 'start') {
      this.recorder.record();
      this.audioData = null;

      this.isVoiceRecording = true;
    } else {
      this.recorder.stop(this.processRecording.bind(this));
      this.isVoiceRecording = false;
    }
  }

  initRecorder(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      }).then(
        (stream) => {
          const options = {
            mimeType: "audio/wav",
            numberOfAudioChannels: 1,
            sampleRate: 44100,
          };
          const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
          this.recorder = new StereoAudioRecorder(stream, options);
          resolve(true);
        }, 
        (error) => {
          console.log('cannot init recorder');
          reject(error);
        }
      );
    });
  }

  processRecording(blob: Blob) {
    this.audioData = new AudioData(blob);
    this.timeVoicePlayCurrent = 0;
  }

  disposeVoice() {
    this.audioData = null;
    this.timeVoicePlayCurrent = 0;
  }
}

class AudioData{
  public url: SafeResourceUrl = null;
  public blob: Blob = null;
  public duration: number = null;
  public durationFormatted: string = null;
  
  constructor(blob: Blob) {
    this.url = URL.createObjectURL(blob);
    this.blob = blob;
    getBlobDuration(blob).then((duration) => {
      this.duration = duration;
    });
  }
}
