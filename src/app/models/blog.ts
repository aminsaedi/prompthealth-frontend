import { SafeHtml } from "@angular/platform-browser";
import { environment } from "src/environments/environment";
import { IBlogCategory } from "./blog-category";
import { EventData } from "./event-data";
import { IUserDetail } from "./user-detail";

export interface IBlog {
  _id: string;
  slug: string;
  title: string;
  description: string;
  author: string; // name (used in admin)
  authorId: string | {firstName: string, lastName: string, profileImage: string, _id: string };

  readLength?: number;

  image: string;
  videoLinks?: {title: string, url: string}[];
  podcastLinks?: {title: string, url: string}[];

  eventEndTime?: string;
  eventStartTime?: string;
  joinEventLink?: string;
  
  categoryId?: IBlogCategory;
  tags?: IBlogCategory[];

  createdRole?: IUserDetail['roles'];
  
  createdAt: string; /** could be Date? */

  isDeleted?: boolean; /** not used in frontend */
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
}

export class Blog implements IBlog {

  get _id() { return this.data._id; }
  get status() { return this.data.status || 'DRAFT'; }
  get slug() { return this.data.slug; }  
  get title() { return this.data.title; }
  get description() { return this.data.description; }
  get descriptionSanitized() { return this._description; }
  get summary() { return this._summary; }
  get readLength() { return this._readLength; } /** UNIT: minute */
  get readLengthFormatted(): string { return this.getFormattedTime(this._readLength);} 

  get isVideo() { return !!(this.videosEmbedded.length > 0); }
  get isPodcast() { return !!(this.podcastsEmbedded.length > 0); }
  get isEvent() { return (this.catTitle && this.catTitle.toLowerCase().match(/event/)); }
  
  get image() { return (this.data.image) ? this.AWS_S3 + this.data.image : '/assets/img/logo-square-primary-light.png'; }
  // get imageSmall() { return (this.data.image) ? this.AWS_S3 + '350x220/' + this.data.image : '/assets/img/logo-square-primary-light.png';}
  get _image() { return (this.data.image) ? this.data.image : null };
  get imageType() {
    let imageType: string = '';
    if(this.data.image) {
      const regex = /\.(jpe?g|png)$/;
      const match = this.data.image.match(regex);
      imageType = match ? ('image/' + match[1]) : '';  
    }
    return imageType;
  }
  get videoLinks() { return this.data.videoLinks || []; }
  get podcastLinks() { return this.data.podcastLinks || []; }
  get videosEmbedded() { return this._videosEmbedded; }
  get podcastsEmbedded() { return this._podcastsEmbedded; }
  get videoAsThumbnail() { return this._videoAsThumbnail;}

  get category() { return this.data.categoryId ? this.data.categoryId : null; }
  get catTitle() { return this.data.categoryId ? this.data.categoryId.title : null; }
  get catId() { return this.data.categoryId ? this.data.categoryId._id : null;}

  get tags() { return this.data.tags; }

  get author() { return (typeof this.data.authorId != 'string' && this.data.createdRole != 'SA') ? this.data.authorId.firstName : this.data.author; } //author name
  get authorId(): string { return (typeof this.data.authorId == 'string') ? this.data.authorId : this.data.authorId._id; }
  get authorRole(): IBlog['createdRole'] { return this.data.createdRole || null; }
  get authorImage() { return (typeof this.data.authorId != 'string' && this.data.createdRole != 'SA' && this.data.authorId.profileImage) ? this.AWS_S3 + '350x220/' + this.data.authorId.profileImage : 'assets/img/logo-sm-square.png'}

  get createdAt() { return this.data.createdAt; }

  get event() { return this._eventData; }


  private AWS_S3 = environment.config.AWS_S3;

  private _readLength: number;
  private _summary: string;
  private _description: SafeHtml;
  private _videosEmbedded: SafeHtml [] = [];
  private _podcastsEmbedded: SafeHtml [] = [];

  private _videoAsThumbnail: SafeHtml;

  private _eventData: EventData;

 
  constructor(protected data: IBlog) {
    const desc = data.description || '';
    this._summary = desc.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s{2,}/, " ");

    /** calculate readLength if it's 0 */
    if(data.readLength > 0) {
      this._readLength = data.readLength;
    } else {
      const words = data.title + this._summary;
      this._readLength = Math.ceil(words.length / 200);
    }

    this._eventData = new EventData(data);
  }

  setSanitizedDescription(d: SafeHtml) {
    this._description = d;
  }

  addEmbedVideo(v: SafeHtml) {
    this._videosEmbedded.push(v);
  }

  addEmbedPodcast(v: SafeHtml) {
    this._podcastsEmbedded.push(v);
  }

  setEmbedVideoAsThumbnail(v: SafeHtml) {
    this._videoAsThumbnail = v;
  }

  getFormattedTime(minutes: number) { 
    let res: string = '';
    if(minutes >= 60) {
      const h = Math.ceil(minutes / 60 * 100) / 100;
      res = h + 'hour' + (h > 1 ? 's' : '');
    } else {
      res = minutes + 'min' + (minutes > 1 ? 's' : '');      
    }
    return res;
  }

  /** this is used in post-editor only */
  hide() {
    this.data.status = 'HIDDEN';
  }
  draft() {
    this.data.status = 'DRAFT';
  }
}