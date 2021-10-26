import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { validators } from '../_helpers/form-settings';
import { Profile } from '../models/profile';
import { formatStringToDate } from '../_helpers/date-formatter';
import { ISocialPost } from '../models/social-post';


@Injectable({
  providedIn: 'root'
})
export class EditorService {

  get isEditorLocked() { return this.editorLocked; }
  get form() { return this._form; }
  
  private editorLocked: boolean = false;
  private _form: FormGroup;
  private editorType: ISocialPost['contentType'];
  private userId: string;

  constructor() { }

  // this function should dispose form data. (reset is not enough.)
  dispose() {
    this.resetForm();
    this.unlockEditor();
  }

  lockEditor() {
    this.editorLocked = true;
  }
  unlockEditor() {
    this.editorLocked = false;
  }

  resetForm() {
    this.form.reset();
    const f = this.form.controls;
    f.authorId.setValue(this.userId);
    f.contentType.setValue(this.editorType);
    f.tags.setValue([]);

    if(this.editorType == 'ARTICLE' || this.editorType == 'EVENT') {
      f.status.setValue('DRAFT');
    }

    if(this.editorType == 'EVENT') {
      f.eventType.setValue('ONLINE');
    }

    if(this.editorType == 'PROMO') {
      f.promo.setValue('');
    }
  }

  init(type: ISocialPost['contentType'], profile: Profile): FormGroup {
    this.unlockEditor();
    this.editorType = type;
    this.userId = profile._id;

    if (type == 'EVENT') {
      this._form = new FormGroup({
        status: new FormControl('DRAFT'),
        contentType: new FormControl(type),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        title: new FormControl(null, validators.savePostTitle),
        description: new FormControl(null),
        image: new FormControl(null),

        eventStartTime: new FormControl(null),  // set validator later
        eventEndTime: new FormControl(null),  // set validator later
        eventType: new FormControl('ONLINE'),
        joinEventLink: new FormControl(null),  // set validator later
        eventAddress: new FormControl(null),
        tags: new FormControl([], validators.topics),
      });  
    } else if (type == 'ARTICLE') {
      this._form = new FormGroup({
        status: new FormControl('DRAFT'),
        contentType: new FormControl(type),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        title: new FormControl(null, validators.savePostTitle),
        description: new FormControl(null), // set validator later
        image: new FormControl('', ),
        tags: new FormControl([], validators.topics),
      })
    } else if (type == 'NOTE') {
      this._form = new FormGroup({
        contentType: new FormControl(type),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        description: new FormControl(),
        images: new FormControl(), // TODO: need change to FormArray in ver2.1
        voice: new FormControl(),
        tags: new FormControl([], validators.topics),
      }, validators.note);
    } else if (type =='PROMO') {
      this._form = new FormGroup({
        contentType: new FormControl(type),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        description: new FormControl('', validators.publishPostDescription),
        promo: new FormControl('', validators.promoCode),
        availableUntil: new FormControl(null, validators.promoExpireDate),
        images: new FormControl(), // TODO: need change to FormArray in ver2.1
        link: new FormControl('', validators.promoLink),
        tags: new FormControl([], validators.topics),
      });
    }

    this._form.valueChanges.subscribe(() => {
      this.lockEditor();
    });

    return this.form;
  }

  format() {
    const f = this.form.controls;

    if(f.title) {
      const title = f.title.value || '';
      f.title.setValue(title.replace(/\&nbsp;/g, ''));
    }

    if(f.description) {
      let desc = f.description.value || '';
      desc = desc.trim();
      f.description.setValue(desc.replace(/(<p><br><\/p>)+$/, ''));
    }
  }

  // for ARTICLE | EVENt 
  // (NOTE does not need validate)
  // TODO: add PROMO validation process
  validate(published: boolean = false) {
    const f = this.form.controls;

    if(this.editorType == 'ARTICLE' || this.editorType == 'EVENT') {
      f.description.clearValidators();
      f.description.setValidators( published ? validators.publishPostDescription : validators.savePostDescription);
      f.description.updateValueAndValidity();  
    }

    if(this.editorType == 'EVENT') {
      f.eventStartTime.clearValidators();
      f.eventEndTime.clearValidators();
      f.joinEventLink.clearValidators();

      f.eventStartTime.setValidators( published ? validators.publishPostEventStartTime : validators.savePostEventStartTime);
      f.eventEndTime.setValidators( published ? validators.publishPostEventEndTime : validators.savePostEventEndTime);
      f.joinEventLink.setValidators( (published && f.eventType.value == 'ONLINE') ? validators.publishPostEventLink : validators.savePostEventLink);
      f.eventAddress.setValidators( (published && f.eventType.value == 'OFFLINE') ? validators.publishPostEventAddress : validators.savePostEventAddress);

      f.eventStartTime.updateValueAndValidity();
      f.eventEndTime.updateValueAndValidity();
      f.joinEventLink.updateValueAndValidity();  
      f.eventAddress.updateValueAndValidity();
    }
  }
}


export interface ISaveQuery {
  _id?: string,
  status?: ISocialPost['status'];
  contentType: ISocialPost['contentType'];
  authorId: string;

  title?: string;
  description?: string;

  image?: string;
  images?: string[];
  voice?: string;

  tags?: string[],

  eventStartTime?: string | Date;
  eventEndTime?: string | Date;
  eventType?: ISocialPost['eventType'];
  joinEventLink?: string;
  eventAddress?: string;

  availableUntil?: Date;
  promo?: string;
  link?: string;
}

export class SaveQuery implements ISaveQuery {
  get _id() { return this.data._id || null };
  get status() { return this.data.status || 'DRAFT'; }
  get contentType() { return this.data.contentType; }
  get authorId() { return this.data.authorId || null; }
  get title() { return this.data.title || null; }
  get description() { return this.data.description || ''; }
  get tags() { return (this.data.tags && this.data.tags.length > 0) ? this.data.tags : []; }
  
  get eventStartTime() { return this.data.eventStartTime ? formatStringToDate(this.data.eventStartTime as string) : null; }
  get eventEndTime() { return this.data.eventEndTime ? formatStringToDate(this.data.eventEndTime as string) : null; }
  get eventType() { return this.data.eventType || 'ONLINE'; }
  get joinEventLink() { return this.data.joinEventLink || null; }
  get eventAddress() { return this.data.eventAddress || null; }
  
  get image() { return this.data.image || ''; }
  get images() { return this.data.images || []; }
  get voice() { return this.data.voice || ''; }

  get availableUntil() { return this.data.availableUntil || null; }
  get promo() { return this.data.promo || null; }
  get link() { return this.data.link || null; }
  
  toJson() { 
    const data: ISaveQuery = {
      contentType: this.contentType,
      authorId: this.authorId,

      ... (this._id) && {_id: this._id},
      ... (this.contentType == 'ARTICLE' || this.contentType == 'EVENT') && {status: this.status}, 

      ... (this.title) && {title: this.title},
      ... (this.description) && {description: this.description},
      ... (this.image) && {image: this.image},
      ... (this.images.length > 0) && {images: this.images},
      ... (this.voice) && {voice: this.voice},

      ... (this.tags.length > 0) && {tags: this.tags},

      ... (this.eventType && this.contentType == 'EVENT') && {eventType: this.eventType},
      ... (this.joinEventLink) && {joinEventLink: this.joinEventLink},
      ... (this.eventStartTime) && {eventStartTime: this.eventStartTime},
      ... (this.eventEndTime) && {eventEndTime: this.eventEndTime},
      ... (this.eventAddress) && {eventAddress: this.eventAddress},

      ... (this.availableUntil) && {availableUntil: this.availableUntil},
      ... (this.promo) && {promo: this.promo},
      ... (this.link) && {link: this.link},
    };
    return data;
  }
  constructor(private data: ISaveQuery) {}
}
