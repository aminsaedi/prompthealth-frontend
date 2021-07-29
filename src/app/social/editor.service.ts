import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { validators } from '../_helpers/form-settings';
import * as RecordRTC from 'recordrtc';
import { Profile } from '../models/profile';
import { IBlog } from '../models/blog';
import { formatStringToDate } from '../_helpers/date-formatter';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  get isEditorLocked() { return this.editorLocked; }
  get form() { return this._form; }
  
  private editorLocked: boolean = false;
  private _form: FormGroup;
  private editorType: SocialEditorType;

  constructor() { }

  lockEditor() {
    this.editorLocked = true;
  }
  unlockEditor() {
    this.editorLocked = false;
  }

  init(type: SocialEditorType, profile: Profile): FormGroup {
    this.unlockEditor();
    this.editorType = type;

    if (type == 'event') {
      this._form = new FormGroup({
        status: new FormControl('DRAFT'),
        authorId: new FormControl(profile._id, validators.savePostAuthorId),
        title: new FormControl(null, validators.savePostTitle),
        description: new FormControl(null),
        image: new FormControl(null),

        eventStartTime: new FormControl(null),  // set validator later
        eventEndTime: new FormControl(null),  // set validator later
        joinEventLink: new FormControl(null),  // set validator later
        address: new FormControl(null),
      });  
    } else if (type == 'article') {
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

    if(this.editorType == 'event') {
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
  // _id?: string,
  status: IBlog['status'];
  title: string;
  authorId: string;
  author: string;

  // slug?: string;
  description?: string;
  categoryId?: string;
  tags?: string[],
  readLength?: number;

  eventStartTime?: string | Date;
  eventEndTime?: string | Date;
  joinEventLink?: string;
  
  image?: string;
  videoLinks?: {
    title: string;
    url: string;
  }[];
  podcastLinks?: ISaveQuery['videoLinks'];

  headliner?: boolean;
}

export class SaveQuery implements ISaveQuery {
  get status() { return this.data.status || 'DRAFT'; }
  get title() { return this.data.title || null; }
  get authorId() { return this.data.authorId || null; }
  get author() { return this.data.author || 'test'; }
  get description() { return this.data.description || ''; }
  get categoryId() { return this.data.categoryId || ''; }
  get tags() { return (this.data.tags && this.data.tags.length > 0) ? this.data.tags : []; }
  
  get eventStartTime() { return this.data.eventStartTime ? formatStringToDate(this.data.eventStartTime as string) : null; }
  get eventEndTime() { return this.data.eventEndTime ? formatStringToDate(this.data.eventEndTime as string) : null; }
  get joinEventLink() { return this.data.joinEventLink || null; }
  
  get image() { return this.data.image || ''; }
  get videoLinks() { 
    let res: ISaveQuery['videoLinks'] = [];
    if(this.data.videoLinks && this.data.videoLinks.length > 0) {
      const data = this.data.videoLinks[0];
      if(data.url) {
        res = [{title: 'video', url: data.url}];
      }
    }
    return res;
  }
  get podcastLinks() {
    let res: ISaveQuery['podcastLinks'] = [];
    if(this.data.podcastLinks && this.data.podcastLinks.length > 0) {
      const data = this.data.podcastLinks[0];
      if(data.url) {
        res = [{title: 'podcast', url: data.url}];
      }
    }
    return res;
   }

  toJson() { 
    const data: ISaveQuery = {
      status: this.status,
      authorId: this.authorId,
      author: this.author,

      title: this.title,
      description: this.description,
      
      categoryId: this.categoryId || 'test',
      tags: this.tags,
      
      joinEventLink: this.joinEventLink,
      eventStartTime: this.eventStartTime,
      eventEndTime: this.eventEndTime,

      image: this.image,
      videoLinks: this.videoLinks,
      podcastLinks: this.podcastLinks,
      headliner: false,
    };
    return data;
  }
  constructor(private data: ISaveQuery) {}
}
