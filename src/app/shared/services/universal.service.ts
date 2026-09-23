import { Injectable, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { CanonicalLinkService } from './link.service';
import { imageTypeOf } from 'src/app/_helpers/image-type';

const BASE_URL = 'https://www.prompthealth.ca';

interface ShareImage { url: string; type: string | null; width?: number; height?: number; alt: string; }

/* What a page shares when it names no image of its own. The file is 800x350;
 * this service and index.html declared 800x600 for years. */
const DEFAULT_SHARE_IMAGE: ShareImage = {
  url: BASE_URL + '/assets/img/prompthealth.png',
  type: 'image/png',
  width: 800,
  height: 350,
  alt: 'PromptHealth',
};

/* Sections that are never indexed, by first path segment. */
const NOINDEX_SECTIONS = /^\/(dashboard|dashboard-old|link-admin|auth|personal-match|compare-practitioners|invitation|unsubscribe|404|thankyou)(\/|$)/;

/**
 * The URL a page is known by, as a path: no query string, no fragment, no
 * matrix parameters.
 *
 * Most callers pass this._router.url, which is whatever the visitor arrived
 * with, so a campaign link made ?utm_source=...&fbclid=... part of the page's
 * canonical and og:url. Every ad variant then asked to be indexed as a page of
 * its own, and Facebook filed shares and reshares under the tagged URL.
 *
 * Nothing is kept, deliberately. No page renders different content for a query
 * parameter: the directory's filters and pg already canonicalize to the bare
 * listing, and the community feed's ?page=N renders page one on the server and
 * in the browser alike. So this needs no list of trackers (the one in
 * _helpers/tracking-params.ts decides what the server renders and caches, a
 * different question). If a page ever does render a parameter, give it an
 * allowlist here; a denylist of trackers is never finished.
 */
export function canonicalPathOf(path: string): string {
  const clean = (path || '/').split('#')[0].split('?')[0].replace(/;[^/]*/g, '');
  return clean || '/';
}

/* Scrapers resolve nothing against the page. The post and profile models fall
 * back to a site-relative placeholder, which went out as og:image unchanged. */
function absoluteUrlOf(url: string): string {
  if (/^https?:\/\//i.test(url)) { return url; }
  return BASE_URL + (url.charAt(0) === '/' ? '' : '/') + url;
}

@Injectable({
  providedIn: 'root'
})
export class UniversalService {

  public localStorage: LocalStorage;
  public sessionStorage: LocalStorage;

  constructor(
    @Inject(PLATFORM_ID) private p: Object,
    private _meta: Meta,
    private _title: Title,
    private _canonicalLink: CanonicalLinkService
  ) {
    if(this.isServer){
      this.localStorage = new LocalStorage();
      this.sessionStorage = new LocalStorage();
    }else{
      this.localStorage = localStorage;
      this.sessionStorage = sessionStorage;
    }
  }

  get isServer(){ return isPlatformServer(this.p); }
  get isBrowser() { return !isPlatformServer(this.p); }

  get isIphone() { return !!this.isBrowser && !!window.navigator.userAgent.toLowerCase().match('iphone'); }
  get isAndroid() { return !!this.isBrowser && !!window.navigator.userAgent.toLowerCase().match('android'); }
  get isAppAvailable() { return this.isIphone || this.isAndroid; }

  openApp(path: string) {
    if(this.isBrowser) {
      window.location.replace('prompthealth://' + path);
    }

    setTimeout(() => {
      if(this.isIphone) {
        window.location.replace('https://apps.apple.com/ca/app/prompthealth/id1532951934');
      } else if (this.isAndroid) {
        window.location.replace('https://play.google.com/store/apps/details?id=com.prompthealth&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1');
      }  
    },100);
  }

  setMeta(path: string, meta: MetaData = {}){
    const canonicalPath = canonicalPathOf(path);
    const canonicalUrl = BASE_URL + canonicalPath;

    if(!meta.title) {       meta.title = 'PromptHealth'; }
    if(!meta.description) { meta.description = ''; }
    if(!meta.keyword) {     meta.keyword = ''; }
    if(!meta.pageType) {    meta.pageType = 'website'; }

    if(!meta.robots) {
      /* Against the clean path and anchored to the first segment. Matched
       * anywhere in the raw URL, an article slug starting "auth" or a
       * client-side fragment such as #/auth was enough to noindex a page. */
      meta.robots = NOINDEX_SECTIONS.test(canonicalPath) ? 'noindex' : 'index, follow';
    }

    const image: ShareImage = meta.image ? {
      url: absoluteUrlOf(meta.image),
      type: imageTypeOf(meta.image, meta.imageType),
      width: meta.imageWidth,
      height: meta.imageHeight,
      /* Only the site default had fallbacks, so a page naming its own image
       * without an alt published the word "undefined". */
      alt: meta.imageAlt || meta.title,
    } : DEFAULT_SHARE_IMAGE;

    this._title.setTitle(meta.title);

    /* Twitter have to be first otherwise it's not updated. (I don't know why) */
    this._meta.updateTag({name: 'twitter:title', content: meta.title});
    this._meta.updateTag({name: 'twitter:description', content: meta.description});
    this._meta.updateTag({name: 'twitter:image', content: image.url});
    this._meta.updateTag({name: 'robots', content: meta.robots});
    this._meta.updateTag({name: 'title', content: meta.title});
    this._meta.updateTag({name: 'description', content: meta.description});
    this._meta.updateTag({property: 'og:url', content: canonicalUrl});
    this._meta.updateTag({property: 'og:type', content: meta.pageType});
    this._meta.updateTag({property: 'og:title', content: meta.title});
    this._meta.updateTag({property: 'og:description', content: meta.description});
    this._meta.updateTag({property: 'og:image', content: image.url});
    this.setOrRemoveProperty('og:image:type', image.type);
    /* Declared only as a measured pair. Facebook lays the card out from these
     * without fetching the image, so a wrong pair is worse than none. The old
     * lines were commented out (and wrote the width into the height), which
     * left index.html's 800x600 on every page. */
    const sized = image.width > 0 && image.height > 0;
    this.setOrRemoveProperty('og:image:width', sized ? String(image.width) : null);
    this.setOrRemoveProperty('og:image:height', sized ? String(image.height) : null);
    this._meta.updateTag({property: 'og:image:alt', content: image.alt});

    this._canonicalLink.addTag({ rel: 'canonical', href: canonicalUrl });
  }

  /* index.html ships a value for each of these, so leaving one unset does not
   * leave it empty: it leaves the home page's value describing another image. */
  private setOrRemoveProperty(property: string, content: string | null) {
    if (content) {
      this._meta.updateTag({property, content});
    } else {
      this._meta.removeTag(`property="${property}"`);
    }
  }

  /** Update only the robots meta tag without touching any other meta. */
  setRobots(content: string): void {
    this._meta.updateTag({ name: 'robots', content });
  }
}

class LocalStorage implements Storage {
  [name: string]: any;
  readonly length: number;
  clear(): void {}
  getItem(key: LocalStorageKeyType): string | null {return undefined;}
  key(index: number): string | null {return undefined;}
  removeItem(key: LocalStorageKeyType): void {}
  setItem(key: LocalStorageKeyType, value: string): void {}
}


export interface MetaData {
  title?: string;
  keyword?: string;
  description?: string;
  image?: string;
  imageType?: string;
  /** The file's real pixel size, as a pair. Omit both when unknown: setMeta
   *  then leaves og:image:width and og:image:height out rather than guess. */
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  pageType?: 'article' | 'website' | 'blog';
  robots?: string;
}

type TwitterCardType = 'summary' | 'summary_large_image';

type LocalStorageKeyType = 'hide_alert_being_approved' | string;