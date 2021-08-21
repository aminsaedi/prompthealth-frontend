import { SafeHtml } from "@angular/platform-browser";
import { environment } from "src/environments/environment";
import { Profile } from "./profile";
import { IUserDetail } from "./user-detail";

export interface ISocialPost {
  _id: string;
  contentType: 'NOTE' | 'PROMO' | 'ARTICLE' | 'EVENT';
  authorId: string | IUserDetail;

  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  description?: string;

  title?: string;
  voice?: string;
  image?: string;  /** cover photo for article | event */
  images?: string[]; /** content photo for note | promo */

  joinEventLink?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventType?: 'ONLINE' | 'OFFLINE';
  eventAddress?: string;

  numComments?: number;
  numLikes?: number;

  tags?: string[];

  createdAt: string;

  comments: ISocialComment[];

  /** socialPostBase */
  author?: string;
  authorImage?: string;
  authorVerified?: boolean;
  descriptionSanitized?: SafeHtml;
  isNote?: boolean;
  isArticle?: boolean;
  isEvent?: boolean;
  isMoreShown?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  setComments?(s: ISocialComment[]): void;
  setComment?(s: ISocialComment): void;

  /** SocialArticle */
  imageType?: string;
  readLength?: number;
  readLengthLabel?: string;
  
  /** SocialEvent */
  startAt?: Date;
  endAt?: Date;
  duration?: number;
  link?: string;
  openStatus?: string;
  isFinished?: boolean;
  isVirtual?: boolean;
  venue?: string;
  setSanitizedDescription?(s: SafeHtml): void;

}

export class SocialPostBase implements ISocialPost {

  get _id() { return this.data._id; }
  get contentType() { return this.data.contentType; }
  get status() { return this.data.status || null; }

  get author() { return (this.data.authorId && typeof this.data.authorId != 'string') ? this.data.authorId.firstName : ''; } //author name
  get authorId(): string { return (typeof this.data.authorId == 'string') ? this.data.authorId : this.data.authorId ?  this.data.authorId._id : 'noid'; }
  get authorImage() { return (this.data.authorId && typeof this.data.authorId != 'string' && this.data.authorId.profileImage) ? this._s3 + '350x220/' + this.data.authorId.profileImage : 'assets/img/logo-sm-square.png'}
  get authorVerified() {return (this.data.authorId && typeof this.data.authorId != 'string' && this.data.authorId.verifiedBadge) ? true : false; }

  get description() { return this.data.description || ''; }
  get descriptionSanitized() { return this._description; }
  get summary() { return this._summary.substr(0, 256); }

  get tags() { return this.data.tags; }

  get createdAt() { return this.data.createdAt; }

  get isNote() { return this.contentType == 'NOTE'; }
  get isArticle() { return this.contentType == 'ARTICLE'; }
  get isEvent() { return this.contentType == 'EVENT'; }

  get isMoreShown() { return !!(this._summary.length > this.summary.length); }

  get numComments() { return this.data.numComments || 0; }
  get numLikes() { return this.data.numLikes || 0; }

  get comments() {
    return this._comments;
  };

  protected _s3 = environment.config.AWS_S3; 
  protected _summary: string;
  private _description: SafeHtml;


  _comments: SocialComment[];
  constructor(protected data: ISocialPost) {
    const desc = data.description || '';
    this._summary = desc.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s{2,}/, " ");
  }

  setSanitizedDescription(d: SafeHtml) {
    this._description = d;
  }

  setComments(comments: ISocialComment[]) {
    comments.forEach(c => {
      this.setComment(c);
    });
  }
  setComment(comment: ISocialComment) {
    if(!this._comments) {
      this._comments = [];
    }
    this._comments.push(new SocialComment(comment));
  }
}

export interface ISocialComment {
  _id: string;
  body?: string;
  like?: number;
  blogId?: string;
  authorId?: string;
  author?: IUserDetail;
  replyTo?: string;
  createdAt?: string|Date;

  comments?: ISocialComment[];
}

class SocialComment implements ISocialComment {

  get _id() { return this.data._id; }
  get body() { return this.data.body; }
  get like() { return this.data.like; }
  get authorId() { return this.data.authorId || null; }
  get author() { return this._author || {}}

  get replyTo() { return this.data.replyTo; }

  private _author: Profile;

  constructor(private data: ISocialComment) {
    this._author = new Profile(data.author);
  }
}