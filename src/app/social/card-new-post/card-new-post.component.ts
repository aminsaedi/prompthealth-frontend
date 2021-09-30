import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { Profile } from 'src/app/models/profile';
import { IContentCreateResult, IUploadImageResult, IUploadMultipleImagesResult } from 'src/app/models/response-data';
import { FormItemServiceComponent } from 'src/app/shared/form-item-service/form-item-service.component';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { EditorService } from '../editor.service';
import { ISocialPost } from 'src/app/models/social-post';
import { UploadObserverService } from 'src/app/shared/services/upload-observer.service';
import { AudioData } from '../modal-voice-recorder/modal-voice-recorder.component';
import { ModalService } from 'src/app/shared/services/modal.service';


@Component({
  selector: 'card-new-post',
  templateUrl: './card-new-post.component.html',
  styleUrls: ['./card-new-post.component.scss'],
  animations: [expandVerticalAnimation],
})
export class CardNewPostComponent implements OnInit {

  @Output() onPublished = new EventEmitter<any>();

  get f() { return this._editorService.form.controls; }
  get form() { return this._editorService.form; }

  get userImage(): string { return this.user ? this.user.profileImage : ''; }
  get user(): Profile { return this._profileService.profile; }

  public isMoreShown: boolean = false;
  public isEditorFocused: boolean = false;
  public imagePreview: string | ArrayBuffer;
  public audioSaved: AudioData =  null;
  public audioData: AudioData = null;

  public isSubmitted: boolean = false;
  public isUploading: boolean = false;
  public isAlertUploadingClosedForcibly: boolean = false;

  @ViewChild('inputMedia') private inputMedia: ElementRef;
  @ViewChild('editor') private editor: ElementRef;
  @ViewChild('formItemService') private formItemService: FormItemServiceComponent;

  constructor(
    private _sharedService: SharedService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _profileService: ProfileManagementService,
    private _editorService: EditorService,
    private _uploadObserver: UploadObserverService,
    private _modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this._editorService.init('NOTE', this.user);
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
        this.f.images.setValue('');
        return;
      }
    }
  }

  onClickButtonRemoveMedia() {
    this.imagePreview = null;
    this.f.images.setValue(null);
  }

  onClickButtonAudio() {
    this._modalService.show('audio-recorder');
  }

  onClickButtonRemoveAudio(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.audioSaved = null;
    this.f.voice.setValue('');
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

  onAudioSaved(data: AudioData) {
    this.audioSaved = data;
  }

  async onSubmit() {
    this.isSubmitted = true;
    this.f.authorId.setValue(this.user._id);
    this._editorService.format();

    this.isUploading = true;
    this._uploadObserver.markAsUploading();
    try {
      await this.uploadImagesIfNeeded();
    } catch(error) {
      console.log(error);
      this._toastr.error('Could not upload media. Please try again later');
      this.isUploading = false;
      return;
    }

    const data = {
      ...this.form.value,
    };
    const tags = this.formItemService.getSelected();
    if(tags.length > 0) {
      data.tags = tags;
    }

    if (data.images) {
      data.images = [data.images];
    } else {
      delete data.images;
    }

    if (!data.voice) {
      delete data.voice;
    }

    this._sharedService.put(data, 'note/create').subscribe((res: IContentCreateResult) => {
      this.isUploading = false;
      this.isAlertUploadingClosedForcibly = false;
      this._uploadObserver.markAsUploadDone();

      if(res.statusCode == 200) {
        this.isSubmitted = false;
        this.isMoreShown = false;
        this.formItemService.deselectAll();
        this.onPublished.emit(res.data as ISocialPost);
        this._editorService.resetForm();
        this.imagePreview = null;
        this.audioSaved = null;
      } else {
        console.log(res.message);
        this._toastr.error('Could not upload note. Please try again later.')
      }
    }, error => {
      this.isUploading = false;
      this.isAlertUploadingClosedForcibly = false;
      this._uploadObserver.markAsUploadDone();

      console.log(error);
      this._toastr.error('Could not upload note. Please try again later.')
    });
  }

  onAlertUploadingClosed() {
    this.isAlertUploadingClosedForcibly = true;
    this._uploadObserver.markAsUploadingInBackground();
  }

  uploadImagesIfNeeded(): Promise<void> {
    //TODO: need to implement for multiple images upload feature (ver 2.1)
    return new Promise((resolve, reject) => {
      const files = [];
      const _image = this.f.images.value;
      const image = _image && typeof _image != 'string' ? _image : null;
      if(image) {
        files.push(image);
      }

      const _voice = this.f.voice.value;
      const voice = _voice && typeof _voice != 'string' ? _voice : null;
      if(voice) {
        files.push(voice);
      }

      if (files.length == 0) {
        resolve();
      } else {
        this._sharedService.uploadMultipleImages(files, this.user._id, 'notes').subscribe((res: IUploadImageResult|IUploadMultipleImagesResult) => {
          if(res.statusCode == 200) {
            const files = typeof res.data == 'string' ? [res.data] : res.data;
            if(image) {
              this.f.images.setValue(files[0]);
              files.splice(0,1);
            }

            if(voice) {
              this.f.voice.setValue(files[0]);
            }

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
