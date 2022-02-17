import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { validators } from '../_helpers/form-settings';
import { Profile } from '../models/profile';
import { formatDateToDateTimeData, formatDateToString, formatStringToDate, formatStringToDateTimeData } from '../_helpers/date-formatter';
import { ISocialPost } from '../models/social-post';


@Injectable({
  providedIn: 'root'
})
export class EditorService {

  get isEditorLocked() { return this.editorLocked; }
  get existsData() { return !!this._originalData; }
  get originalData() { return this._originalData; }
  get form() { return this._form; }
  
  private _originalData: ISocialPost;
  private editorLocked: boolean = false;
  private _form: FormGroup;
  private editorType: ISocialPost['contentType'];
  private userId: string;

  constructor() { }

  dispose() {
    this._form = null;
    this._originalData = null;
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

  setData(data: ISocialPost) {
    this._originalData = data;
  }

  init(type: ISocialPost['contentType'], profile: Profile): FormGroup {
    this.unlockEditor();
    this.editorType = type;
    this.userId = profile._id;

    const d: ISocialPost = this._originalData;
    
    if (type == 'EVENT') {
      const startTime = d && d.eventStartTime ? formatDateToString(new Date(d.eventStartTime)) : null;
      const endTime = d && d.eventEndTime ? formatDateToString(new Date(d.eventEndTime)) : null;

      this._form = new FormGroup({
        status: new FormControl(d ? d.status : 'DRAFT'),
        contentType: new FormControl(type),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        title: new FormControl(d ? d.title : null, validators.savePostTitle),
        description: new FormControl(d ? d.description || '' : ''),
        image: new FormControl(d ? d.image || '' : ''),

        eventStartTime: new FormControl(startTime),  // set validator later
        eventEndTime: new FormControl(endTime),  // set validator later
        eventType: new FormControl(d? d.eventType : 'ONLINE'),
        joinEventLink: new FormControl(d ? d.joinEventLink || '' : ''),  // set validator later
        eventAddress: new FormControl(d ? d.eventAddress || '' : ''),
        tags: new FormControl(d?.tags ? d.tags :[], validators.topics),
      });  
    } else if (type == 'ARTICLE') {
      let rolesRestrictedTo = null;
      if(d?.rolesRestrictedTo) {
        rolesRestrictedTo = d.rolesRestrictedTo.map(item => item == 'SP' || item == 'C' ? 'SP+C' : item);
        rolesRestrictedTo = Array.from(new Set(rolesRestrictedTo));
      }
      this._form = new FormGroup({
        status: new FormControl(d ? d.status : 'DRAFT'),
        contentType: new FormControl(type),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        title: new FormControl(d ? d.title : null, validators.savePostTitle),
        description: new FormControl(d ? d.description : null), // set validator later
        image: new FormControl(d ? d.image || '' : ''),
        tags: new FormControl(d?.tags ? d.tags :[], validators.topics),
        isNews: new FormControl(d?.isNews ? d.isNews : false),
        online_academy_category: new FormControl(d?.online_academy_category ? d.online_academy_category : 'templates'),
        isAcademy: new FormControl(d?.isAcademy ? d.isAcademy : false),
        isFreeAcademy: new FormControl(d?.isFreeAcademy ? d.isFreeAcademy : false),
        rolesRestrictedTo: new FormControl(rolesRestrictedTo),
      });
    } else if (type == 'NOTE') {
      this._form = new FormGroup({
        contentType: new FormControl(type),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        description: new FormControl(d ? d.description : null, validators.noteDescription),

        // value type: string (path in S3 | blob)
        images: new FormControl(d?.images?.length > 0 ? d.images[0] : null), 

        // value type: string (path in S3 | AudioData)
        voice: new FormControl(d?.voice ? d.voice : null),
        tags: new FormControl(d?.tags ? d.tags :[], validators.topics),
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
        tags: new FormControl(d?.tags ? d.tags :[], validators.topics),
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

    if(f.rolesRestrictedTo?.value?.length == 0) {
      f.rolesRestrictedTo.setValue(null);
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

    // note doesn't have to change validation because it doesn't have status DRAFT
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

  isNews?: boolean;
  online_academy_category?: string;
  isAcademy?: boolean;
  isFreeAcademy?: boolean;
  rolesRestrictedTo?: string[];
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
  get eventAddress() { return this.data.eventType == 'OFFLINE' && this.data.eventAddress ? this.data.eventAddress : null; }
  
  get image() { return this.data.image || null; }
  get images() { return this.data.images || []; }
  get voice() { return this.data.voice || null; }

  get availableUntil() { return this.data.availableUntil || null; }
  get promo() { return this.data.promo || null; }
  get link() { return this.data.link || null; }
  
  get isNews() { return this.data.isNews || false; }
  get online_academy_category() { return this.data.online_academy_category || 'templates'; }
  get isAcademy() { return this.data.isAcademy || false; }
  get isFreeAcademy() { return this.data.isFreeAcademy || false; }
  get rolesRestrictedTo() { return this.data.rolesRestrictedTo || null; }

  toJson() { 
    const data: ISaveQuery = {
      contentType: this.contentType,
      authorId: this.authorId,

      description: this.description?.length > 0 ? this.description : null,

      ... (this._id) && {_id: this._id},

      ... (this.images.length > 0) && {images: this.images},
      ... (this.voice) && {voice: this.voice},
      ... (this.tags.length > 0) && {tags: this.tags},
     
      ... (this.contentType == 'ARTICLE') && {
        rolesRestrictedTo: this.rolesRestrictedTo,
        isNews: this.isNews,
        online_academy_category: this.online_academy_category,
        isAcademy: this.isAcademy,
        isFreeAcademy: this.isFreeAcademy,
      },
      ... (this.contentType == 'ARTICLE' || this.contentType == 'EVENT') && {
        status: this.status,
        image: this.image,
        title: this.title,
      }, 

      ... (this.contentType == 'EVENT') && {
        eventType: this.eventType,
        joinEventLink: this.joinEventLink,
        eventStartTime: this.eventStartTime,
        eventEndTime: this.eventEndTime,
        eventAddress: this.eventAddress,
      },

      ... (this.availableUntil) && {availableUntil: this.availableUntil},
      ... (this.promo) && {promo: this.promo},
      ... (this.link) && {link: this.link},
    };
    return data;
  }
  constructor(private data: ISaveQuery) {}
}
