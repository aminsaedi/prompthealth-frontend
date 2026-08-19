import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

export interface ILinkRecord {
  _id?: string;
  code?: string;
  title?: string;
  description?: string;
  destinationUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  slugType?: string;
  clinicId?: any;
  isActive?: boolean;
  isInternal?: boolean;
  createdAt?: string;
}

/* Admin/owner service for the built-in link tracker (uses SharedService auth headers). */
@Injectable({ providedIn: 'root' })
export class TrackedLinkAdminService {

  constructor(private shared: SharedService) {}

  create(payload: Partial<ILinkRecord>): Observable<any> {
    return this.shared.post(payload, 'link/create');
  }
  update(id: string, payload: Partial<ILinkRecord>): Observable<any> {
    return this.shared.post({ id, ...payload }, 'link/update');
  }
  getAll(params: any = {}): Observable<any> {
    return this.shared.get(`link/get-all${this.toQuery(params)}`);
  }
  getById(id: string): Observable<any> {
    return this.shared.get(`link/get-by-id/${id}`);
  }
  remove(id: string): Observable<any> {
    return this.shared.deleteContent(`link/remove/${id}`);
  }
  analytics(id: string, params: any = {}): Observable<any> {
    return this.shared.get(`link/analytics/${id}${this.toQuery(params)}`);
  }

  private toQuery(params: any = {}): string {
    const keys = Object.keys(params).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '');
    if (keys.length === 0) return '';
    return '?' + keys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  }
}
