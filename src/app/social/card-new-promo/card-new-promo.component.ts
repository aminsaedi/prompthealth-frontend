import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { Profile } from 'src/app/models/profile';
import { IContentCreateResult, IUploadImageResult, IUploadMultipleImagesResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { DateTimeData } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { FormItemServiceComponent } from 'src/app/shared/form-item-service/form-item-service.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { minmax } from 'src/app/_helpers/form-settings';
import { EditorService, ISaveQuery, SaveQuery } from '../editor.service';

@Component({
  selector: 'card-new-promo',
  templateUrl: './card-new-promo.component.html',
  styleUrls: ['./card-new-promo.component.scss'],
  animations: [expandVerticalAnimation],
})
export class CardNewPromoComponent implements OnInit {

  @Output() onPublished = new EventEmitter<ISocialPost>();

  get userImage(): string { return this.user ? this.user.profileImage : ''; }
  get user(): Profile { return this._profileService.profile; }
  get f() { return this.form.controls; }

  public isEditorFocused: boolean = false;
  public maxPromoCode = minmax.promoCodeMax;
  public minDateTime: DateTimeData;

  private form: FormGroup;
  public imagePreview: string | ArrayBuffer;

  public isSubmitted = false;
  public isUploading = false;
  public isMoreShown: boolean = false;

  @ViewChild('inputMedia') private inputMedia: ElementRef;
  @ViewChild('formItemService') private formItemService: FormItemServiceComponent;


  constructor(
    private _profileService: ProfileManagementService,
    private _toastr: ToastrService,
    private _router: Router,
    private _editorService: EditorService,
    private _sharedService: SharedService,
  ) { }

  ngOnDestroy() {
    this._editorService.dispose();
  }

  ngOnInit(): void {
    this.form = this._editorService.init('PROMO', this.user)
    const now = new Date();
    this.minDateTime = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: 0,
      minute: 0,
    };
  }

  focusEditor() {
    if(!this.isEditorFocused) {
      this.isEditorFocused = true;
    }
  }


  blurEditor() {
    this.isEditorFocused = false;
  }

  onClickButtonMore() {
    this.isMoreShown = !this.isMoreShown;
  }

  onClickButtonEvent() {
    if(this.user.isEligibleToCreateEvent) {
      this._router.navigate(['/community/editor/event']);
    } else {
      this._toastr.error('You are not eligible to create event.');
    }
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

  onChangeTags(ids: string[]) {
    this.f.tags.setValue(ids);
  }

  async onSubmit() {
    this.isSubmitted = true;
    this.f.authorId.setValue(this.user._id);

    if(this.form.invalid) {
      this._toastr.error('There are serveral items that require your attention.');
      return;
    }

    this._editorService.format();
    this.isUploading = true;

    this.isUploading = true;
    try {
      await this.uploadImagesIfNeeded();
    } catch(error) {
      console.log(error);
      this._toastr.error('Could not upload media. Please try again later');
      this.isUploading = false;
      return;
    }

    const data: ISaveQuery = {
      ...this.form.value
    };

    data.images = this.f.images.value ? [this.f.images.value] : []; //change format to array

    //format availableUntil from 'yyyy-mm-dd' to Date(yyyy,mm,dd,23,59,59)
    const dateArray = this.f.availableUntil.value ? this.f.availableUntil.value.split('-') : null;
    data.availableUntil = dateArray ? new Date(dateArray[0], dateArray[1] - 1, dateArray[2], 23, 59, 59) : null;

    const payload: ISaveQuery = new SaveQuery(data).toJson();

    this._sharedService.put(payload, 'note/create').subscribe((res: IContentCreateResult) => {
      this.isUploading = false;
      if(res.statusCode === 200) {
        this.isSubmitted = false;
        this.isMoreShown = false;
        this.formItemService.deselectAll();
        this.imagePreview = null;

        this.onPublished.emit(res.data);
        this._editorService.resetForm();
        this._editorService.unlockEditor();
      } else {
        console.log(res.message);
        this._toastr.error('Could not upload discount promotion. Please try again later.')
      }
    }, error => {
      this.isUploading = false;
      console.log(error);
      this._toastr.error('Could not upload note. Please try again later.')
    });
    
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
