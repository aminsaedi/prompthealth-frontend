import { Injectable, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class UniversalService {

  public localStorage: LocalStorage;
  public sessionStorage: LocalStorage;

  constructor(
    @Inject(PLATFORM_ID) private p: Object,
    private _meta: Meta,
    private _title: Title
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

    if(!meta.title) {       meta.title = 'PromptHealth'; }
    if(!meta.description) { meta.description = ''; }
    if(!meta.keyword) {     meta.keyword = ''; }
    if(!meta.pageType) {    meta.pageType = 'website'; }

    if(!meta.robots) {
      meta.robots = 
      (path.match(/\/(dashboard|auth|personal-match|compare-practitioners|invitation|unsubscribe|404|thankyou)/)) ? 'noindex' :
      'index, follow';
    }

    if(!meta.image) { 
      meta.image = 'https://prompthealth.ca/assets/img/prompthealth.png?ver=2.3'; 
      meta.imageType = 'image/png';
      meta.imageWidth = 800;
      meta.imageHeight = 600;
      meta.imageAlt = 'PromptHealth';
    }

    const baseUrl = 'https://prompthealth.ca';
    this._title.setTitle(meta.title);

    /* Twitter have to be first otherwise it's not updated. (I don't know why) */
    this._meta.updateTag({name: 'twitter:title', content: meta.title});
    this._meta.updateTag({name: 'twitter:description', content: meta.description});
    this._meta.updateTag({name: 'twitter:image', content: meta.image});
    this._meta.updateTag({name: 'robots', content: meta.robots});
    this._meta.updateTag({name: 'title', content: meta.title});
    this._meta.updateTag({name: 'description', content: meta.description});
    this._meta.updateTag({property: 'og:url', content: (baseUrl + path)});
    this._meta.updateTag({property: 'og:type', content: meta.pageType});
    this._meta.updateTag({property: 'og:title', content: meta.title});
    this._meta.updateTag({property: 'og:description', content: meta.description});
    this._meta.updateTag({property: 'og:image', content: meta.image});
    this._meta.updateTag({property: 'og:image:type', content: meta.imageType});
    // this._meta.updateTag({property: 'og:image:width', content: meta.imageWidth.toString()});
    // this._meta.updateTag({property: 'og:image:height', content: meta.imageWidth.toString()});
    this._meta.updateTag({property: 'og:image:alt', content: meta.imageAlt});
    this._meta.updateTag({name: 'apple-itunes-app', content: 'app-id=1532951934' + (meta.iosLink ? `, app-argument=prompthealth://${meta.iosLink}` : '')});
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
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  pageType?: 'article' | 'website' | 'blog';
  robots?: string;
  iosLink?: string;
}

type TwitterCardType = 'summary' | 'summary_large_image';

type LocalStorageKeyType = 'hide_alert_being_approved' | string;