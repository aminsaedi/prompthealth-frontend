import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { validators } from '../_helpers/form-settings';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  get isEditorLocked() { return this.editorLocked; }
  get form() { return this._form; }
  
  private editorLocked: boolean = false;
  private _form: FormGroup;

  constructor() { }

  lockEditor() {
    this.editorLocked = true;
  }
  unlockEditor() {
    this.editorLocked = false;
  }

  init(type: SocialEditorType): FormGroup {
    this.unlockEditor();

    if (type == 'event') {
      this._form = new FormGroup({
        authorId: new FormControl(null, validators.savePostAuthorId),
        title: new FormControl('', validators.savePostTitle),
        description: new FormControl('', validators.publishPostDescription),
        image: new FormControl('', ),

        eventStartTime: new FormControl('', validators.publishPostEventStartTime),
        eventEndTime: new FormControl('', validators.publishPostEventEndTime),
        joinEventLink: new FormControl(null, validators.savePostEventLink),  // set validator later
        address: new FormControl(null),
      });  
    } else if (type == 'article') {
      this._form = new FormGroup({
        authorId: new FormControl(null, validators.savePostAuthorId),
        title: new FormControl('', validators.savePostTitle),
        description: new FormControl('', validators.publishPostDescription),
        image: new FormControl('', ),
      })
    } else {
      this._form = new FormGroup({
        authorId: new FormControl(null, validators.savePostAuthorId),
        description: new FormControl('', validators.publishPostDescription),
      });
    }

    this._form.valueChanges.subscribe(() => {
      this.lockEditor();
    });

    return this.form;
  }
}

export type SocialEditorType = 'article' | 'event' | 'post';
