import { SafeHtml } from "@angular/platform-browser";
import { ISocialPost, SocialPost } from "./social-post";

export interface ISocialNote extends ISocialPost{
  voice?: string;
  images?: string[];
}

export class SocialNote extends SocialPost implements ISocialNote {
  get voice() { return this.data.voice || null; }
  get images() { return this._images; }
  
  private _images: string[];
  constructor(protected data: ISocialNote) {
    super(data);
    
    this._images = data.images ? data.images.map(image => this._s3 + image) : [];
  }
}

export interface ISocialPromotion extends ISocialNote {
  
}

export class SocialPoromotion extends SocialNote implements ISocialPromotion {
  
}

export interface ISocialArticle extends ISocialPost {
  title: string;
  
  image?: string;  
  readLength: number;
}

export class SocialArticle extends SocialPost implements ISocialArticle {
  get title() { return this.data.title; }
  
  get image() { return (this.data.image) ? this._s3 + this.data.image : '/assets/img/logo-square-primary-light.png'; }
  get imageType() {
    let imageType: string = '';
    if(this.data.image) {
      const regex = /\.(jpe?g|png)$/;
      const match = this.data.image.match(regex);
      imageType = match ? ('image/' + match[1]) : '';  
    }
    return imageType;
  }
  
  get readLength() { return this._readLength; } /** UNIT: minute */
  
  private _readLength: number;
  
  constructor(protected data: ISocialArticle) {
    super(data);
    
    /** calculate readLength if it's 0 */
    if(data.readLength > 0) {
      this._readLength = data.readLength;
    } else {
      const words = data.title + this._summary;
      this._readLength = Math.ceil(words.length / 200);
    }    
  }
}

export interface ISocialEvent extends ISocialArticle {
  joinEventLink?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventType?: 'ONLINE' | 'OFFLINE';
  eventAddress?: string;
  
  startAt: Date;
  endAt: Date;
  duration: number;
  link: string;
  openStatus: string;
  isFinished: boolean;
  isVirtual: boolean;
  venue: string;
}

export class SocialEvent extends SocialArticle implements ISocialEvent {
  
  get startAt(): Date { return this._startAt; }
  get endAt(): Date { return this._endAt; }
  get duration(): number { return (this._endAt.getTime() - this._startAt.getTime()) / 1000 / 60; /** unit: minute */ }
  
  get link() { return this.data.joinEventLink; }
  get openStatus() { return this._openStatus; }
  get isFinished() { return (this.openStatus == 'finished'); }
  get isVirtual() { return this.data.eventType == 'ONLINE'; }
  get venue() { return this.isVirtual ? this.getVenueFromURL() : this.data.eventAddress; }
  
  private _startAt: Date;
  private _endAt: Date;
  private _openStatus: string;
  
  constructor(protected data: ISocialEvent) {
    super(data);
    
    this._startAt = (this.data.eventStartTime) ?  new Date(this.data.eventStartTime) : null;
    this._endAt = (this.data.eventEndTime) ? new Date(this.data.eventEndTime) : null;
    
    const now = new Date();
    let status: string;
    if(!this._startAt || !this._endAt) {
      status = null;
    } else if (this._startAt.getTime() - now.getTime() > 60 * 60 * 1000) {
      status = 'upcoming';
    } else if (this._startAt.getTime() - now.getTime() > 0) {
      status = 'open soon';
    } else if (this._endAt.getTime() - now.getTime() > 0) {
      status = 'on going';
    } else {
      status = 'finished';
    }
    this._openStatus = status;
  }
  
  getVenueFromURL() {
    let venue: string = null;
    
    if(this.data.joinEventLink) {
      let path = this.data.joinEventLink;
      let host = null;
      host = path.replace(/http(s)?:\/\/(www\.)?/, '').replace(/\/.*$/, '');
      
      const match = host.match(/(eventbrite|zoom|meet)/);
      
      switch(true) {
        case /eventbrite/.test(host):
          venue = 'Eventbrite';
          break;
        case /easywebinar/.test(host):
          venue = 'Easywebinar';
          break;
        case /zoom/.test(host):
          venue = 'Zoom';
          break;
        case /meet\.google/.test(host):
          venue = 'Google Meet';
          break;
        case /teams/.test(host):
          venue = 'Teams';
          break;
        case /clubhouse/.test(host):
          venue = 'Clubhouse';
          break;
        case /twitter\.com\/i\/spaces/.test(path):
          venue = 'Spaces';
          break;
        case /fb\.me|facebook/.test(host):
          venue = 'Facebook';
          break;
        case /meetup/.test(host):
          venue = 'Meetup';
          break;
        case /instagram/.test(host):
          venue = 'Instagram';
          break;
        default: 
          venue = null;
      }
      
    }
    
    return venue;
  }
}