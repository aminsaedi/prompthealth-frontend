import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadObserverService {

  constructor() { }

  private _isUploading = false;
  private _isUploadingInBackground = false;

  private _uploadingStatusChanged = new Subject<UploadingStatus>();

  get isUploading() { return this._isUploading; }
  get isUploadingInBackground() { return this._isUploadingInBackground; }

  uploadingStatusChanged(): Observable<UploadingStatus> {
    return this._uploadingStatusChanged.asObservable();
  }

  markAsUploading() {
    this._isUploading = true;
    this._uploadingStatusChanged.next('start');
  }

  markAsUploadingInBackground() {
    this._isUploading = true;
    this._isUploadingInBackground = true;
    this._uploadingStatusChanged.next('background');
  }

  markAsUploadDone() {
    this._isUploading = false;
    this._isUploadingInBackground = false;
    this._uploadingStatusChanged.next('done');
  }
}

export type UploadingStatus = 'start' | 'done' | 'background';
