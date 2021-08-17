import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { validators } from '../_helpers/form-settings';
import * as RecordRTC from 'recordrtc';
import { Profile } from '../models/profile';
import { IBlog } from '../models/blog';
import { formatStringToDate } from '../_helpers/date-formatter';
import { ISocialPost, SocialPost } from '../models/social-post';
import { ISocialEvent } from '../models/social-note';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  get isEditorLocked() { return this.editorLocked; }
  get form() { return this._form; }
  
  private editorLocked: boolean = false;
  private _form: FormGroup;
  private editorType: SocialPost['contentType'];

  constructor() { }

  lockEditor() {
    this.editorLocked = true;
  }
  unlockEditor() {
    this.editorLocked = false;
  }

  init(type: SocialPost['contentType'], profile: Profile): FormGroup {
    this.unlockEditor();
    this.editorType = type;

    if (type == 'EVENT') {
      this._form = new FormGroup({
        status: new FormControl('DRAFT'),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        title: new FormControl(null, validators.savePostTitle),
        description: new FormControl(null),
        image: new FormControl(null),

        eventStartTime: new FormControl(null),  // set validator later
        eventEndTime: new FormControl(null),  // set validator later
        joinEventLink: new FormControl(null),  // set validator later
        eventAddress: new FormControl(null),
      });  
    } else if (type == 'ARTICLE') {
      this._form = new FormGroup({
        status: new FormControl('DRAFT'),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        title: new FormControl(null, validators.savePostTitle),
        description: new FormControl(null), // set validator later
        image: new FormControl('', ),
      })
    } else {
      this._form = new FormGroup({
        status: new FormControl('APPROVED'),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        description: new FormControl('', validators.publishPostDescription),
      });
    }

    this._form.valueChanges.subscribe(() => {
      this.lockEditor();
    });

    return this.form;
  }

  validate(published: boolean = false) {
    const f = this.form.controls;
    f.description.clearValidators();
    f.description.setValidators( published ? validators.publishPostDescription : validators.savePostDescription);
    f.description.updateValueAndValidity();

    if(this.editorType == 'EVENT') {
      f.eventStartTime.clearValidators();
      f.eventEndTime.clearValidators();
      f.joinEventLink.clearValidators();

      f.eventStartTime.setValidators( published ? validators.publishPostEventStartTime : validators.savePostEventStartTime);
      f.eventEndTime.setValidators( published ? validators.publishPostEventEndTime : validators.savePostEventEndTime);
      f.joinEventLink.setValidators( published ? validators.publishPostEventLink : validators.savePostEventLink);
      f.eventStartTime.updateValueAndValidity();
      f.eventEndTime.updateValueAndValidity();
      f.joinEventLink.updateValueAndValidity();  
    }

  }
}

export type SocialEditorType = 'article' | 'event' | 'note';


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
  eventType?: ISocialEvent['eventType'];
  joinEventLink?: string;
  eventAddress?: string;
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

      ... (this.eventType) && {eventType: this.eventType},
      ... (this.joinEventLink) && {joinEventLink: this.joinEventLink},
      ... (this.eventStartTime) && {eventStartTime: this.eventStartTime},
      ... (this.eventEndTime) && {eventEndTime: this.eventEndTime},
    };
    return data;
  }
  constructor(private data: ISaveQuery) {}
}
