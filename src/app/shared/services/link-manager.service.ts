import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

export type LinkHealthStatus = 'UNKNOWN' | 'OK' | 'REDIRECT' | 'BROKEN' | 'UNREACHABLE' | 'BLOCKED';
export type LinkSource = 'MANUAL' | 'PROFILE' | 'BOOKING' | 'DISCOVERED' | 'CLICK';

export interface ILinkHealth {
  status?: LinkHealthStatus;
  statusCode?: number;
  finalUrl?: string;
  error?: string;
  responseMs?: number;
  checkedAt?: string;
  consecutiveFailures?: number;
}

export interface ILinkStats {
  clicks?: number;
  humanClicks?: number;
  botClicks?: number;
  lastClickAt?: string;
}

export interface ILinkRecord {
  _id?: string;
  code?: string;
  title?: string;
  description?: string;
  destinationUrl?: string;
  hostname?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  slugType?: string;
  source?: LinkSource;
  managed?: boolean;
  foundOn?: string;
  clinicId?: any;
  isActive?: boolean;
  isInternal?: boolean;
  lastSeenAt?: string;
  createdAt?: string;
  stats?: ILinkStats;
  health?: ILinkHealth;
}

export interface ILinkDashboard {
  days: number;
  inventory: {
    total: number;
    managed: number;
    active: number;
    hosts: number;
    bySource: { [key: string]: number };
    byType: { [key: string]: number };
  };
  totals: { total: number; humans: number; bots: number; mobile: number; desktop: number; unique: number };
  trend: { day: string; total: number; humans: number; bots: number }[];
  topLinks: { _id: string; code: string; title: string; destinationUrl: string; hostname: string; foundOn: string; total: number; humans: number }[];
  topHosts: { hostname: string; total: number; humans: number }[];
  health: { [key: string]: number };
  broken: ILinkRecord[];
}

export interface ILinkPolicyRecord {
  enabled: boolean;
  source: string;
  medium: string;
  defaultCampaign: string;
  routeRules: { pattern: string; campaign: string; label?: string }[];
  includeContent: boolean;
  overrideExisting: boolean;
  internalHosts: string[];
  excludeHosts: string[];
  beacon: boolean;
}

/* Link manager API, authenticated through SharedService. */
@Injectable({ providedIn: 'root' })
export class LinkManagerService {

  constructor(private shared: SharedService) {}

  dashboard(params: any = {}): Observable<any> {
    return this.shared.get(`link/dashboard${this.toQuery(params)}`);
  }
  getAll(params: any = {}): Observable<any> {
    return this.shared.get(`link/get-all${this.toQuery(params)}`);
  }
  getById(id: string): Observable<any> {
    return this.shared.get(`link/${id}`);
  }
  analytics(id: string, params: any = {}): Observable<any> {
    return this.shared.get(`link/analytics/${id}${this.toQuery(params)}`);
  }
  create(payload: Partial<ILinkRecord>): Observable<any> {
    return this.shared.post(payload, 'link/create');
  }
  update(id: string, payload: Partial<ILinkRecord>): Observable<any> {
    return this.shared.put({ id, ...payload }, 'link/update');
  }
  remove(id: string): Observable<any> {
    return this.shared.deleteContent(`link/${id}`);
  }
  getPolicy(): Observable<any> {
    return this.shared.get('link/policy');
  }
  updatePolicy(payload: Partial<ILinkPolicyRecord>): Observable<any> {
    return this.shared.put(payload, 'link/policy');
  }
  runHealthCheck(payload: any = {}): Observable<any> {
    return this.shared.post(payload, 'link/health-check');
  }
  runDiscovery(payload: any = {}): Observable<any> {
    return this.shared.post(payload, 'link/discover');
  }

  private toQuery(params: any = {}): string {
    const keys = Object.keys(params).filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '');
    if (!keys.length) { return ''; }
    return '?' + keys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
  }
}
