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


  modalVisibilityChanged(): Observable<boolean> {
    setTimeout(() => { this.changeModalVisibility(this.isModalShown); });
    return this._modalVisibilityChanged;
  }

  private _modalVisibilityChanged = new Subject<boolean>();
  private isModalShown = false;

  changeModalVisibility(show: boolean) {
    this.isModalShown = show;
    this._modalVisibilityChanged.next(show);
  }

  formatRegion(type: RegionType) {
    let result: string;
    switch(type) {
      case 'CA': result = 'Canada'; break;
      case 'US': result = 'United States'; break;
    }    
    return result;
  }


  constructor() { }

}

export type RegionType = 'CA' | 'US';
type RegionStatusType = 'checking' | 'ready' | 'notReady';
