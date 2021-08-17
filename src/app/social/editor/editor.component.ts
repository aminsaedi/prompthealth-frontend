import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import Quill from 'quill';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ISocialPost, SocialPost } from 'src/app/models/social-post';
import { DateTimeData } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { formatDateToString, formatStringToDate } from 'src/app/_helpers/date-formatter';
import { validators } from 'src/app/_helpers/form-settings';
import { environment } from 'src/environments/environment';
import { EditorService, ISaveQuery, SaveQuery, SocialEditorType } from '../editor.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {


  get f() {return this._editorService.form.controls; }
  get isEvent() { return this.editorType == 'EVENT'; }
  get isArticle() { return this.editorType == 'ARTICLE'; }

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload(e: BeforeUnloadEvent) {
    if(this._editorService.isEditorLocked) {
      e.returnValue = true;
    }
  }

  public imagePreview: string | ArrayBuffer;

  public formCheckboxOnlineEvent: FormControl;
  public editorType: SocialPost['contentType'] = null;

  public isUploadingImage: boolean = true;

  private contentEditor: Quill;

  public isSubmitted: boolean = false;
  public isUploading: boolean = false;
  public minDateTimeEventStart: DateTimeData;
  public minDateTimeEventEnd: DateTimeData;

  private AWS_S3 = environment.config.AWS_S3;

  @ViewChild('inputMedia') private inputMedia: ElementRef;


  constructor(
    private _sharedService: SharedService,
    private _location: Location,
    private _router: Router,
    private _route: ActivatedRoute,
    private _editorService: EditorService,
    private _profileService: ProfileManagementService,
    private _headerService: HeaderStatusService,
    private _toastr: ToastrService,
  ) { }

  ngOnDestroy() {
    this._editorService.unlockEditor();
    this._headerService.showHeader();
  }

  ngOnInit(): void {
    this._route.data.subscribe((data: {type: string}) => {
      switch(data.type) {
        case 'article': this.editorType = 'ARTICLE'; break;
        case 'event': this.editorType = 'EVENT'; break;
        default: this.editorType = null; 
      }
      this._editorService.init(
        this.editorType, 
        this._profileService.profile,
      );
    });

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

    this.formCheckboxOnlineEvent = new FormControl(true);

  }

  onClickCancel() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      this._router.navigate(['/community/feed']);
    } else {
      this._location.back();
    }
  }

  async onSelectMedia(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){

      let image: {file: File | Blob, filename: string};

      try { 
        image = await this._sharedService.shrinkImageByFixedWidth(files[0], 800);

        const reader = new FileReader();
        reader.readAsDataURL(image.file);
        reader.onloadend = () => {
          this.imagePreview = reader.result;
        }
      } catch(err){
        console.log(err);
        return;
      }
    }
  }

  onClickButtonRemoveMedia() {
    this.imagePreview = null;
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
  }

  onEditorCreated(e: Quill) {
    this.contentEditor = e;
  }

  async onEditorChanged(e: EditorChangeContent | EditorChangeSelection) {
    if('html' in e) {
      const current = this.f.description.value;
      const next = e.html;

      this.f.description.setValue(e.html);
      if(current != next) {
        // this._postsService.lockEditor();
      }

      if(e.html) {
        const regExImageBase64 = /<img src="(data:image\/.+;base64,.+)"(\/)?>/
        const matchImage = e.html.match(regExImageBase64);
        if(matchImage) {
          // this.onImageSelected(matchImage[1]);
        }  
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
    // this._postsService.lockEditor();
  } 

  /** trigger when editor tool bar is sticked to top */
  changeStickyStatus(isSticked: boolean) {
    if (isSticked) { 
      this._headerService.hideHeader(); 
    } else { 
      this._headerService.showHeader(); 
    }
  }

  saveAsDraft() {
    this.save('DRAFT');
  }

  publish() {
    this.save('APPROVED')
  }

  save(status: ISocialPost['status']) {
    this.isSubmitted = true;

    const form = this._editorService.form;   
    const publish = status == 'DRAFT' ? false : true;

    this._editorService.validate(publish);
    console.log(form)
    if(form.invalid) {
      this._toastr.error('There are several items that require your attention.');
      return;
    }

    const data: ISaveQuery = new SaveQuery(form.value).toJson();
    data.status = status;

    // const req =  this.post ? this._sharedService.put(data, `blog/update/${this.post._id}`) : this._sharedService.post(data, 'blog/create');
    const req =  this._sharedService.post(data, 'blog/create');
    console.log('===PAYLOAD====')
    console.log(data);

    this.isUploading = true;

    req.subscribe((res: any) => {
      this.isUploading = false;
      if(res.statusCode === 200) {
        this.isSubmitted = false;
        this._toastr.success('Updated successfully');  
      } else {
        this._toastr.error(res.message);
      }
    }, (err) => {
      this.isUploading = false;
      console.log(err);
      this._toastr.error(err);
    });

  }
  
}

