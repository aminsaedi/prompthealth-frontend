import { Location } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import Quill from 'quill';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IContentCreateResult, IUploadImageResult, IUploadMultipleImagesResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { DateTimeData } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { FormItemServiceComponent } from 'src/app/shared/form-item-service/form-item-service.component';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { formatDateToString, formatStringToDate } from 'src/app/_helpers/date-formatter';
import { environment } from 'src/environments/environment';
import { EditorService, ISaveQuery, SaveQuery } from '../editor.service';
import { AudioData } from '../modal-voice-recorder/modal-voice-recorder.component';
import { SocialService } from '../social.service';
import { CheckboxSelectionItem } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  get form() { return this._editorService.form; }
  get f() {return this._editorService.form.controls; }
  get isEvent() { return this.editorType == 'EVENT'; }
  get isArticle() { return this.editorType == 'ARTICLE'; }
  get isNote() { return this.editorType == 'NOTE'; }
  get user() { return this._profileService.profile; }
  get isEditMode() { return this._editorService.existsData; }
  get isPublished(): boolean { 
    const status = this._editorService.originalData ? this._editorService.originalData.status : 'DRAFT';
    return status == 'APPROVED' || status == 'HIDDEN';
  }

  get imagePreview() {
    return this._imagePreview ? this._imagePreview :
     this.form && this.f.image.value && typeof this.f.image.value == 'string' ? this._s3 + this.f.image.value + '?ver=2.3' : 
      null;
  }

  get eligibleToMarkAsNews() { return this.user?.isSA && this.isArticle; }

  get eligibleToSetOnlineAcademyCategory() { return !!this.f.isAcademy?.value }

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload(e: BeforeUnloadEvent) {
    if(this._editorService.isEditorLocked) {
      e.returnValue = true;
    }
  }

  public _imagePreview: string | ArrayBuffer;

  public description: string;
  public formCheckboxOnlineEvent: FormControl;
  public editorType: ISocialPost['contentType'] = null;

  public isUploadingImage: boolean = true;

  private contentEditor: Quill;

  public isSubmitted: boolean = false;
  public isLoadingVoice: boolean = false;
  public isUploading: boolean = false;

  public minDateTimeEventStart: DateTimeData;
  public minDateTimeEventEnd: DateTimeData;

  public audioPreview: AudioData = null;
  public imagesPreview: (string|ArrayBuffer)[] = [];

  public itemsRolesRestrictedTo: CheckboxSelectionItem[] = [
    {id: 'client', label: 'Client', value: 'U'},
    {id: 'provider', label: 'Service Provider', value: 'SP+C'},
    {id: 'company', label: 'Company', value: 'P'},
  ];

  private _s3 = environment.config.AWS_S3;
  private subscriptionLoginStatus: Subscription;

  @ViewChild('inputMedia') private inputMedia: ElementRef;
  @ViewChild('formItemService') private formItemService: FormItemServiceComponent;

  constructor(
    private _sharedService: SharedService,
    private _location: Location,
    private _router: Router,
    private _route: ActivatedRoute,
    private _editorService: EditorService,
    private _profileService: ProfileManagementService,
    private _headerService: HeaderStatusService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
    private _socialService: SocialService,
    private _modalService: ModalService,
  ) { }

  ngOnDestroy() {
    this._editorService.dispose();
    this._headerService.showHeader();

    this.subscriptionLoginStatus?.unsubscribe();
  }

  ngOnInit(): void {
    this.observeLoginStatus();

    this._route.data.subscribe((data: {type: string}) => {
      this._uService.setMeta(this._router.url, {
        title: 'Editor | PromptHealth Community'
      });

      switch(data.type) {
        case 'article': this.editorType = 'ARTICLE'; break;
        case 'event': this.editorType = 'EVENT'; break;
        default: this.editorType = null;
      }

      this._editorService.init(
        this.editorType, 
        this.user,
      );

      const isOnline = this.f.eventType ? this.f.eventType.value == 'ONLINE' : false;
      this.formCheckboxOnlineEvent = new FormControl(isOnline);
  
      const now = new Date();
      this.minDateTimeEventStart = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours() + 1,
        minute: 0,
      }
      this.minDateTimeEventEnd = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours() + 2,
        minute: 0
      }  
    });
  }

  observeLoginStatus() {
    this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe(res => {
      if(res == 'notLoggedIn') {
        this._editorService.dispose();
        this._router.navigate(['/community/feed'], {replaceUrl: true});
      }
    });
  }

  goback() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      this._router.navigate(['/community/feed']);
    } else {
      this._location.back();
    }
  }

  async onSelectCoverImage(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){

      let image: {file: File | Blob, filename: string};

      try { 
        image = await this._sharedService.shrinkImageByFixedWidth(files[0], 800);
        this.f.image.setValue(image);

        const reader = new FileReader();
        reader.readAsDataURL(image.file);
        reader.onloadend = () => {
          this._imagePreview = reader.result;
        }
      } catch(err){
        console.log(err);
        return;
      }
    }
  }

  onClickButtonRemoveCoverImage() {
    this._imagePreview = null;
    this.f.image.setValue(null);
  }


  onBeforeInputTitle(e: InputEvent) {
    if(e.inputType.match('format')) {
      e.preventDefault();
    }
    if(e.inputType.match(/insert(Paragraph|LineBreak)/)) {
      e.preventDefault();
      if(this.contentEditor) {
        this.contentEditor.focus();
      }
    }
  }

  onInputTitle(e: InputEvent) {
    let val = this.f.title.value;

    // for android
    //// cannot detect insertParagraph sometime on android.
    //// if new paragraph is inserted, remove it and focus editor.
    if(val.match(/<div><br><\/div>/)) {
      val = val.replace(/<div><br><\/div>/, '');
      this.f.title.setValue(val);
      if(this.contentEditor) {
        this.contentEditor.focus();
      }
    }

    // if user paste html contents, remove tags and format.
    const regexTag = /<\/?[^>]+(>|$)/g;
    if(val.match(regexTag)) {
      val = val.replace(regexTag, '').replace(/\s{2,}/, " ").trim();
      this.f.title.setValue(val);
    }
  }

  onEditorCreated(e: Quill) {
    this.contentEditor = e;
  }

  onEditorChanged(e: EditorChangeContent | EditorChangeSelection) {
    if('html' in e && e.html) {
      const regExSpotifyEmbedded = /<iframe(.*)src="https:\/\/open\.spotify\.com\/(track|playlist|show|episode)/;
      const matchSpotify = e.html.match(regExSpotifyEmbedded);

      if(matchSpotify) {
        const replaced = `<iframe${matchSpotify[1]}src="https://open.spotify.com/embed/${matchSpotify[2]}`;
        this.f.description.setValue(e.html.replace(regExSpotifyEmbedded, replaced));
      }
    }
  }

  onChangeStartDateTime () {
    const start: Date = formatStringToDate(this.f.eventStartTime.value);
    const end: Date = formatStringToDate(this.f.eventEndTime.value);

    if(start) {
      this.minDateTimeEventEnd = {
        year: start.getFullYear(),
        month: start.getMonth() + 1,
        day: start.getDate(),
        hour: start.getHours(),
        minute: start.getMinutes(),
      }  
    }

    if(start && end && (start.getTime() - end.getTime() > 0)) {
      start.setHours(start.getHours() + 1);
      const val = formatDateToString(start);
      this.f.eventEndTime.setValue(val);
    }
  }

  onChangeEndDateTime(e: Date) {
    const start: Date = formatStringToDate(this.f.eventStartTime.value);
    const end: Date = formatStringToDate(this.f.eventEndTime.value);

    if(start && end && (start.getTime() - end.getTime() > 0)) {
      this.f.eventStartTime.setValue(formatDateToString(end));
    }
  } 

  onChangeEventType(online: boolean) {
    this.f.eventType.setValue(online ? 'ONLINE' : 'OFFLINE');
  }

  onClickButtonMedia() {
    const el = this.inputMedia.nativeElement as HTMLInputElement;
    if(el) {
      el.click();
    }
  }
  onChangeTags(ids: string[]) {
    this.f.tags.setValue(ids);
  }

  onChangeRolesRestrictedTo(vals: string[]) {
    let roles = [];
    vals.forEach(val => {
      const valArray = val.split('+');
      roles = roles.concat(valArray);
    });
    this.f.rolesRestrictedTo.setValue(roles);
  }

  onClickButtonAudio() {
    this._modalService.show('audio-recorder');
  }

  async onSelectMedia(e: Event){
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){
      let image: {file: File | Blob, filename: string};

      try { 
        image = await this._sharedService.shrinkImageByFixedWidth(files[0], 800);
        this.f.images.setValue(image);

        const reader = new FileReader();
        reader.readAsDataURL(image.file);
        reader.onloadend = () => {
          this.imagesPreview = [reader.result];
        }
      } catch(err){
        console.log(err);
        return;
      }
    }
  }

  onClickButtonRemoveMediaOf(i: number) {
    this.imagesPreview.splice(i,1);
  }

  onClickButtonRemoveAudio() {
    this.audioPreview = null;
    this.f.voice.setValue(null);
    this._editorService.lockEditor();
  }

  onAudioSaved(data: AudioData) {
    this.audioPreview = data;
    this.f.voice.setValue(data ? {file: data.file, filename: data.filename} : null);
  }

  /** trigger when editor tool bar is sticked to top */
  changeStickyStatus(isSticked: boolean) {
    if (isSticked) { 
      this._headerService.hideHeader(); 
    } else { 
      this._headerService.showHeader(); 
    }
  }

  async saveAsDraft() {
    try {
      const data = await this.save('DRAFT');
      this._toastr.success('Saved as draft successfully');

      this._editorService.setData(data);
      this._editorService.unlockEditor();
    } catch(error) {
      this._toastr.error(error);
    }
  }
  

  async publish() {
    try {
      const data = await this.save('APPROVED');
      this._toastr.success(this.isPublished ? 'Updated successfully' : 'Published successfully');
      
      this._editorService.dispose();
      this._socialService.updateCacheSingle(data);
      this.goback();
    } catch (error) {
      console.log(error);
      this._toastr.error(error);
    }
  }

  save(status: ISocialPost['status']): Promise<ISocialPost> {
    return new Promise(async (resolve, reject) => {
      this.isSubmitted = true;
      this._editorService.format();
      this._editorService.validate( status == 'DRAFT' ? false : true );
  
      const form = this._editorService.form;   
      if(form.invalid) {
        reject('There are several items that require your attention.');
        return;
      }
  
      this.isUploading = true;
  
      let imageUploaded = false;
      try {
        await this.uploadImagesIfNeeded();
        imageUploaded = true;
      } catch(error) {
        console.log(error);
        this.isUploading = false;
        reject('Could not upload media. Please try later');
      }
      if(!imageUploaded) {
        return false;
      }
  
      const data: ISaveQuery = form.value;
      data.status = status;
  
      const payload: ISaveQuery = new SaveQuery(data).toJson();
      const req = this.isNote ? this._sharedService.put(
        payload, 
        this.isEditMode ? `note/update/${this._editorService.originalData._id}` : `note/create`
      ) :
        this.isEditMode ? this._sharedService.put(payload, `blog/update/${this._editorService.originalData._id}`) : 
        this._sharedService.post(payload, 'blog/create');
        
      req.subscribe((res: IContentCreateResult) => {
        this.isUploading = false;
        if(res.statusCode === 200) {
          this.isSubmitted = false;
  
          if(status == 'APPROVED') {
            // this._imagePreview = null;
            // this.formItemService.deselectAll();
            // this.formCheckboxOnlineEvent.setValue(true);
          
            // this._toastr.success( this.isPublished ? ' Updated sccessfully' : 'Published successfully');
          } else if(status == 'DRAFT') {
            // this._editorService.setData(res.data);
          };

          resolve(res.data);
  
        } else {
          reject(res.message);
        }
      }, (err) => {
        console.log(err);
        this.isUploading = false;
        reject(err);
      });
    });
  }

  uploadImagesIfNeeded(): Promise<void> {
    return new Promise( async (resolve, reject) => {
      const images = [];
      if(this.f.voice?.value && typeof this.f.voice.value != 'string') {
        images.push(this.f.voice.value);
      }

      if(this.f.images?.value && typeof this.f.voice.value != 'string') {
        images.push(this.f.images.value);
      }

      if(this.f.image?.value && typeof this.f.image.value != 'string') {
        images.push(this.f.image.value);
      }

      let desc = this.f.description.value || '';
      const regExImageBase64All = /<img src="(data:image\/.+?;base64,.+?)"(\/)?>/g;
      const matchImages: string[] = desc.match(regExImageBase64All);
      if(matchImages && matchImages.length > 0) {
        try {
          const results = await this.shrinkImagesInBody(matchImages);
          results.forEach(res => {
            images.push(res);
          });
        } catch(error) {
          reject();
        }
      }

      if(images.length == 0) {
        resolve();
      } else {
        this._sharedService.uploadMultipleImages(images, this.user._id, 'blogs').subscribe((res: IUploadImageResult|IUploadMultipleImagesResult) => {
          if(res.statusCode === 200) {
            const images = (typeof res.data == 'string') ? [res.data] : res.data;

            if(this.f.voice?.value && typeof this.f.voice.value != 'string') {
              this.f.voice.setValue(images[0]);
              images.splice(0,1);
            }

            if(this.f.images?.value && typeof this.f.images.value != 'string') {
              this.f.images.setValue(images[0]);
              images.splice(0,1);
            }

            if(this.f.image?.value && typeof this.f.image.value != 'string') {
              this.f.image.setValue(images[0]);
              images.splice(0,1);
            }

            if(matchImages && matchImages.length > 0) {
              matchImages.forEach((match, i) => {
                desc = desc.replace(match, `<img src="${this._s3 + images[i]}">`);
              });
              this.f.description.setValue(desc);  
            }
            resolve();
          } else {
            console.log(res.message);
            reject()
          }
        }, error => {
          console.log(error);
          reject();
        });
      }
    });
  }

  shrinkImagesInBody(images: string[]): Promise<{file: Blob|File, filename: string}[]> {
    return new Promise((resolve, reject) => {
      const regExImageBase64 = /<img src="(data:image\/.+?;base64,.+?)"(\/)?>/

      const promiseAll = [];
      images.forEach(image => {
        const b64 = image.match(regExImageBase64)[1];
        const blob = this._sharedService.b64ToBlob(b64);
        promiseAll.push(this._sharedService.shrinkImageByFixedWidth(blob, 800));
      });

      Promise.all(promiseAll).then((results: {file: Blob|File, filename: string}[]) => {
        resolve(results);
      }, error => {
        console.log(error);
        reject();
      });  
    });
  }
}

