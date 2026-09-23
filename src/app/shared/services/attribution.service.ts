import { Injectable } from '@angular/core';
import { UniversalService } from './universal.service';
import { JourneyService } from './journey.service';
import { isGrowthLandingPath } from 'src/app/home/growth-landing/landings/paths';

const STORAGE_KEY = 'ph_attr';
/* How long a campaign is credited with what the reader does next. Thirty days
 * is the click-through window Meta itself reports on, so the two agree about
 * what an ad caused. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
/* The most the backend keeps of each (consultationrequests). Values are cut
 * here, not normalised: the server normalises UTMs first and cuts second, and
 * also keeps them exactly as they arrived, so she can read a Meta campaign name
 * verbatim. */
const UTM_MAX = 200;
const FBCLID_MAX = 500;
const HOST_MAX = 255;

const UTM_PARAMS: [string, keyof IAttribution][] = [
  ['utm_source', 'utmSource'],
  ['utm_medium', 'utmMedium'],
  ['utm_campaign', 'utmCampaign'],
  ['utm_content', 'utmContent'],
  ['utm_term', 'utmTerm'],
];

/* What a booking is told about the click that brought the reader. Only
 * non-empty values are present. */
export interface IAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  /** ISO time of the click that set fbclid, which is what Meta's fbc cookie
   *  encodes (fb.1.<ms>.<fbclid>) and what rebuilds it later. */
  attributedAt?: string;
  /** A registered growth landing, or nothing. Never an arbitrary path: an
   *  address on this site can carry a password reset token. */
  landingPath?: string;
  referrerHost?: string;
}

interface IStoredAttribution {
  v: 1;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  landingPath: string;
  referrerHost: string;
  attributedAt: string;
  /** When the record was made. It expires from here, so a later organic click
   *  that refreshes fbclid does not extend an old campaign's credit. */
  storedAt: number;
}

/*
 * Remembers the campaign that brought a reader, so a booking made later in the
 * same browser still says which ad or post produced it.
 *
 * JourneyService reads the landing campaign too, but only for the visit it
 * opens, and keeps nothing in the browser. A dentist who clicks an ad on
 * Monday and books on Thursday arrives on Thursday with a clean address.
 *
 * Last touch with a campaign wins: a later address with any utm_* replaces the
 * record. An fbclid alone does not, because Facebook and Instagram add fbclid to
 * organic links as well, and an organic click must not wipe a paid campaign. It
 * refreshes the click id and time on the record instead, or starts an
 * fbclid-only record when there is none.
 *
 * It holds only within one browser. The Instagram and Facebook in-app browsers
 * keep storage apart from Safari and Chrome, and iOS shortens script-written
 * storage after a click from facebook.com. Meta's own reporting is the
 * cross-browser view, and a booking's sessionId joins to its visit's first-touch
 * campaign in visitsessions as a fallback.
 */
@Injectable({ providedIn: 'root' })
export class AttributionService {

  private installed = false;
  /* The record for this page lifetime, so get() answers even where storage
   * throws (private browsing, a full quota, an embedded webview). */
  private record: IStoredAttribution = null;

  constructor(
    private _uService: UniversalService,
    private _journey: JourneyService,
  ) {}

  /* Called once from the app root, browser only, beside JourneyService.install
   * and for the same reason at the same moment: the address is still the one
   * the reader arrived on. An absolute redirectTo drops the query in Angular 9,
   * so by the time any page initializes the campaign may be gone. */
  install(): void {
    if (this.installed || !this._uService.isBrowser) { return; }
    this.installed = true;

    let search = '';
    let path = '/';
    let referrer = '';
    let ownHost = '';
    try {
      search = window.location.search || '';
      path = window.location.pathname || '/';
      ownHost = window.location.hostname || '';
      referrer = document.referrer || '';
    } catch (e) {
      /* nothing to capture */
    }

    /* A reader who asks not to be followed across visits keeps the record for
     * this visit only. One stored before they turned the signal on goes. */
    if (!this._journey.tracksAcrossVisits()) {
      this.remove(this._uService.localStorage as Storage);
    }

    this.record = this.read();

    let params: URLSearchParams;
    try {
      params = new URLSearchParams(search);
    } catch (e) {
      return;
    }
    const utm: { [key: string]: string } = {};
    let hasUtm = false;
    UTM_PARAMS.forEach(([from, to]) => {
      utm[to] = clip(params.get(from), UTM_MAX);
      if (utm[to]) { hasUtm = true; }
    });
    const fbclid = clip(params.get('fbclid'), FBCLID_MAX);
    if (!hasUtm && !fbclid) { return; }

    const now = Date.now();
    if (!hasUtm && this.record && isFresh(this.record, now)) {
      this.record.fbclid = fbclid;
      this.record.attributedAt = new Date(now).toISOString();
    } else {
      this.record = {
        v: 1,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
        utmContent: utm.utmContent,
        utmTerm: utm.utmTerm,
        fbclid,
        landingPath: isGrowthLandingPath(path) ? path.replace(/\/+$/, '') : '',
        referrerHost: offSiteHost(referrer, ownHost),
        attributedAt: new Date(now).toISOString(),
        storedAt: now,
      };
    }
    this.write(this.record);
  }

  /* The current record's non-empty values, or nothing once it is 30 days old. */
  get(): IAttribution {
    const r = this.record;
    const out: IAttribution = {};
    if (!r || !isFresh(r, Date.now())) { return out; }
    UTM_PARAMS.forEach(([, key]) => {
      const value = clip(r[key], UTM_MAX);
      if (value) { out[key] = value; }
    });
    const fbclid = clip(r.fbclid, FBCLID_MAX);
    if (fbclid) { out.fbclid = fbclid; }
    if (r.attributedAt && !isNaN(Date.parse(r.attributedAt))) { out.attributedAt = r.attributedAt; }
    if (r.landingPath && isGrowthLandingPath(r.landingPath)) { out.landingPath = r.landingPath; }
    const host = clip(r.referrerHost, HOST_MAX);
    if (host && /^[a-z0-9.-]+$/i.test(host)) { out.referrerHost = host; }
    return out;
  }

  /* localStorage when the reader allows being recognised across visits,
   * otherwise sessionStorage, which ends with the tab. */
  private get store(): Storage {
    return (this._journey.tracksAcrossVisits() ? this._uService.localStorage : this._uService.sessionStorage) as Storage;
  }

  private read(): IStoredAttribution {
    try {
      const parsed = JSON.parse(this.store.getItem(STORAGE_KEY) || 'null');
      if (parsed && parsed.v === 1 && typeof parsed.storedAt === 'number' && isFresh(parsed, Date.now())) {
        return parsed as IStoredAttribution;
      }
    } catch (e) {
      /* unreadable or unparseable: start again */
    }
    return null;
  }

  private write(record: IStoredAttribution): void {
    try {
      this.store.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      /* the record still lives in memory for this page */
    }
  }

  private remove(store: Storage): void {
    try {
      store.removeItem(STORAGE_KEY);
    } catch (e) {
      /* nothing stored, or nothing reachable */
    }
  }
}

function clip(value: any, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function isFresh(record: IStoredAttribution, now: number): boolean {
  const age = now - record.storedAt;
  return age >= 0 && age < MAX_AGE_MS;
}

/* The host of an off-site referrer, and only the host. Our own pages say
 * nothing about how the reader found us. */
function offSiteHost(referrer: string, ownHost: string): string {
  if (!referrer) { return ''; }
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    const bare = (h: string) => h.replace(/^www\./, '');
    if (!host || bare(host) === bare(ownHost.toLowerCase())) { return ''; }
    return /^[a-z0-9.-]+$/.test(host) ? host.slice(0, HOST_MAX) : '';
  } catch (e) {
    return '';
  }
}
