import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from 'src/app/_helpers/form-settings';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import getBlobDuration from 'get-blob-duration';
import { AudioRecordService, RecordedAudioOutput } from '../audio-record.service';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { Profile } from 'src/app/models/profile';
import { ModalService } from 'src/app/shared/services/modal.service';
import { IContentCreateResult, IUploadImageResult, IUploadMultipleImagesResult } from 'src/app/models/response-data';
import { FormItemServiceComponent } from 'src/app/shared/form-item-service/form-item-service.component';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';


@Component({
  selector: 'card-new-post',
  templateUrl: './card-new-post.component.html',
  styleUrls: ['./card-new-post.component.scss'],
  animations: [expandVerticalAnimation],
})
export class CardNewPostComponent implements OnInit {

  @Output() onPublished = new EventEmitter<any>();

  get f() { return this.form.controls; }

  get userImage(): string { return this.user ? this.user.profileImage : ''; }
  get user(): Profile { return this._profileService.profile; }

  safeResourceUrlOf(url: string): SafeResourceUrl { return this._sanitizer.bypassSecurityTrustUrl(url); }

  public isMoreShown: boolean = false;
  public isEditorFocused: boolean = false;
  public imagePreview: string | ArrayBuffer;
  public audioSaved: AudioData =  null;

  public isSubmitted: boolean = false;
  public isUploading: boolean = false;

  /** AUDIO RECORDER START */
  public isAudioRecording: boolean = false;
  public isAudioPlaying: boolean = false;
  public timeAudioPlayCurrent: number = 0; //unit: ms;
  public timeAudioRecordingRemaining: number = 0; //unit: s;
  public percentAudioPlayCurrent: number = 0;
  public recorder: any;
  public audioData: AudioData = null;
  /** AUDIO RECORDER END */

  public form: FormGroup;
  @ViewChild('inputMedia') private inputMedia: ElementRef;
  @ViewChild('audioPlayer') private audioPlayer: ElementRef;
  @ViewChild('modalAudioRecorder') private modalAudioRecorder: ModalComponent;
  @ViewChild('editor') private editor: ElementRef;
  @ViewChild('formItemService') private formItemService: FormItemServiceComponent;

  constructor(
    private _sharedService: SharedService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _sanitizer: DomSanitizer,
    private _profileService: ProfileManagementService,
    private _audioRecorder: AudioRecordService,
    private _changeDetector: ChangeDetectorRef,
    private _modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      body: new FormControl(),
      authorId: new FormControl(),
      images: new FormControl(),
      voice: new FormControl(),
      status: new FormControl(),
    }, validators.note);

    this._audioRecorder.recordingFailed().subscribe((message) => {
      this.onAudioRecordingFaild(message);
    });

    this._audioRecorder.recordingStarted().subscribe((data) => {
      this.onAudioRecordingStarted();
    });

    this._audioRecorder.timerRecording().subscribe((seconds) => {
      this.onTimerAudioRecordingChanged(seconds);
    })

    this._audioRecorder.recordingDone().subscribe((data) => {
      this.onAudioRecordingDone(data);
    });
  }

  onClickButtonMedia() {
    const el = this.inputMedia.nativeElement as HTMLInputElement;
    if(el) {
      el.click();
    }
  }

  async onSelectMedia(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){

      let image: {file: File | Blob, filename: string};

      try { 
        image = await this._sharedService.shrinkImageByFixedWidth(files[0], 800);
        this.f.images.setValue(image);
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
    this.f.images.setValue(null);
  }

  onClickButtonAudio() {
    this.audioData = this.audioSaved ? this.audioSaved.copy() : null;
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: 'audio-recorder'}});
  }

  onClickButtonRemoveAudio() {
    this.audioSaved = null;
    this.f.audio.setValue('');
  }

  cancelAudioRecord() {
    this.modalAudioRecorder.goBack();
  }
  saveAudioRecord() {
    this.f.voice.setValue(this.audioData.blob);
    this.audioSaved = this.audioData.copy();
    this.modalAudioRecorder.goBack();
  }

  onClickButtonMore() {
    this.isMoreShown = !this.isMoreShown;
  }

  focusEditor() {
    if(!this.isEditorFocused) {
      this.isEditorFocused = true;
    }
  }

  blurEditor() {
    if(this.isEditorFocused && this.editor && this.editor.nativeElement) {
      const editor = this.editor.nativeElement.querySelector('.ql-editor') as HTMLDivElement;
      editor.blur();
      this.isEditorFocused = false;
    }
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

  onTimerAudioRecordingChanged(seconds: number) {
    this.timeAudioRecordingRemaining = seconds;
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

  async onSubmit() {
    this.isSubmitted = true;
    this.f.authorId.setValue(this.user._id);
    this.f.status.setValue('ACTIVE');


    this.isUploading = true;
    try {
      await this.uploadImagesIfNeeded();
    } catch(error) {
      console.log(error);
      this._toastr.error('Could not upload image. Please try again later');
      this.isUploading = false;
      return;
    }

    const data = {
      ...this.form.value,
    };
    const categories = this.formItemService.getSelected();
    if(categories.length > 0) {
      data.categories = categories;
    }

    if (data.images) {
      data.images = [data.images];
    } else {
      delete data.images;
    }

    if (!data.voice) {
      delete data.voice;
    }

    console.log(data);
    this._sharedService.put(data, 'note/create').subscribe((res: IContentCreateResult) => {
      if(res.statusCode == 200) {
        this.isSubmitted = false;
        this.isMoreShown = false;
        this.formItemService.deselectAll();
        this.onPublished.emit(res.data);
        this.form.reset();
      }
      console.log(res);
    }, error => {
      console.log(error);
    }, () => {
      this.isUploading = false;
    });
  }

  uploadImagesIfNeeded(): Promise<void> {
    //TODO: need to implement for multiple images upload feature (ver 2.1)
    return new Promise((resolve, reject) => {
      const image = this.f.images.value as {file: File|Blob, filename: string};
      if (!image) {
        resolve();
      } else {
        this._sharedService.uploadMultipleImages([image], this.user._id, 'notes').subscribe((res: IUploadImageResult) => {
          if(res.statusCode == 200) {
            this.f.images.setValue(res.data);
            resolve();
          } else {
            reject(res.message)
          }
        }, error => {
          reject(error);
        });
      }
    })
  }
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

  copy() {
    return new AudioData({blob: this.blob, title: this.name});
  }
}