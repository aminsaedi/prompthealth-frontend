import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import Quill from 'quill';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { DateTimeData } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { formatDateToString, formatStringToDate } from 'src/app/_helpers/date-formatter';
import { validators } from 'src/app/_helpers/form-settings';
import { environment } from 'src/environments/environment';
import { EditorService, SocialEditorType } from '../editor.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {


  get f() {return this._editorService.form.controls; }
  get isEvent() { return this.editorType == 'event'; }
  get isArticle() { return this.editorType == 'article'; }

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload(e: BeforeUnloadEvent) {
    if(this._editorService.isEditorLocked) {
      e.returnValue = true;
    }
  }

  public imagePreview: string | ArrayBuffer;

  public formCheckboxOnlineEvent: FormControl;
  public editorType: SocialEditorType = null;

  private contentEditor: Quill;

  public isSubmitted: boolean = false;
  public isUploading: boolean = false;
  public minDateTimeEventStart: DateTimeData;
  public minDateTimeEventEnd: DateTimeData;

  private AWS_S3 = environment.config.AWS_S3;

  @ViewChild('inputMedia') private inputMedia: ElementRef;


  constructor(
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _toastr: ToastrService,
    private _location: Location,
    private _router: Router,
    private _route: ActivatedRoute,
    private _editorService: EditorService,
    private _headerService: HeaderStatusService,
  ) { }

  ngOnDestroy() {
    this._editorService.unlockEditor();
    this._headerService.showHeader();
  }

  ngOnInit(): void {
    this._route.data.subscribe((data: {type: SocialEditorType}) => {
      this.editorType = data.type || null;
      this._editorService.init(this.editorType);
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

    /** trigger when filter is sticked to top */
    changeStickyStatus(isSticked: boolean) {
      if (isSticked) { 
        this._headerService.hideHeader(); 
      } else { 
        this._headerService.showHeader(); 
      }
    }
  
}

