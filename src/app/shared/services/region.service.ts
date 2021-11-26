import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegionService {

  statusChanged(): Observable<RegionStatusType> {
    setTimeout(() => { this.changeStatus(this.status); });   
    return this._statusChanged; 
  }

  private _statusChanged = new Subject<RegionStatusType>();
  private status: RegionStatusType = 'notReady';

  changeStatus(status: RegionStatusType) { 
    this.status = status;
    this._statusChanged.next(status);
  }

  constructor() { }
}

export type RegionType = 'CA' | 'US';
type RegionStatusType = 'checking' | 'ready' | 'notReady';
