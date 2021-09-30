import { SafeHtml } from "@angular/platform-browser";
import { environment } from "src/environments/environment";
import { Profile } from "./profile";
import { IUserDetail } from "./user-detail";

export interface ISocialPost {
  _id: string;
  contentType: 'NOTE' | 'PROMO' | 'ARTICLE' | 'EVENT';
  authorId?: string;

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

  isDeleted?: boolean;

  liked?: boolean;
  likes?: IUserDetail[];

  mentions?: any[];

  numComments?: number;
  numLikes?: number;

  tags?: string[];

  createdAt: string;

  comments: ISocialComment[];

  /** socialPostBase */
  author?: IUserDetail;
  authorName?: string;
  authorImage?: string;
  authorVerified?: boolean;
  descriptionSanitized?: SafeHtml;
  summary?: string;
  isNote?: boolean;
  isArticle?: boolean;
  isEvent?: boolean;
  isMoreShown?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isCommentDoneInit?: boolean;
  coverImage?: string;
  coverImageType?: string;
  linkToPost?: string;
  setComments?(s: ISocialComment[]): void;
  setComment?(s: ISocialComment, updateNumCommentTo?: number): void;
  updateCommentCount?(s: number): void;
  like?(updateNumLikes?: boolean, numLikes?: number): void;
  unlike?(updateNumLikes?: boolean, numLikes?: number): void;
  getImageTypeOf?(s: string): string;

  /** SocialArticle */
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
  decode?(): ISocialPost;
  updateWith?(data: ISocialPost): void;
}

export class SocialPostBase implements ISocialPost {

  get _id() { return this.data._id; }
  get contentType() { return this.data.contentType; }
  get status() { return this.data.status || null; }

  get authorName() { 
    let name = ''
    if(this.data.author) {
      name = [this.data.author.firstName, this.data.author.lastName].join(' ').trim();
      if(!name) {
        name = 'User-' + this.authorId.substr(0,5);
      }
    }
    return name;      
  }
  get authorId(): string { return (typeof this.data.author == 'string') ? this.data.author : this.data.author ?  this.data.author._id : 'noid'; }
  get authorImage() { return (this.data.author && typeof this.data.author != 'string' && this.data.author.profileImage) ? this._s3 + '350x220/' + this.data.author.profileImage : 'assets/img/logo-sm-square.png'}
  get authorVerified() {return (this.data.author && typeof this.data.author != 'string' && this.data.author.verifiedBadge) ? true : false; }

  get coverImage() { return this.data.image ? this._s3 + this.data.image : (this.data.images && this.data.images.length > 0) ? this._s3 + this.data.images[0] : '/assets/img/logo-square-primary-light.png'; }
  get coverImageType() { return this.getImageTypeOf(this.coverImage); }

  get description() { return this.data.description || ''; }
  get descriptionSanitized() { return this._description; }
  get summary() { return this._summary.substr(0, 256); }

  get tags() { return this.data.tags; }

  get createdAt() { return this.data.createdAt; }

  get isNote() { return this.contentType == 'NOTE'; }
  get isArticle() { return this.contentType == 'ARTICLE'; }
  get isEvent() { return this.contentType == 'EVENT'; }

  get isLiked() { return !!this.data.liked; }

  get isMoreShown() { return !!(this._summary.length > this.summary.length); }
  get isCommentDoneInit() { return !!this._comments; }

  get numComments() { return this.data.numComments || 0; }
  get numLikes() { return this.data.numLikes || 0; }

  get comments() { return this._comments; };

  get linkToPost() { 
    const type = this.isNote ? 'note' : this.isArticle ? 'article' : this.isEvent ? 'event' : 'content';
    return `/community/${type}/${this._id}`; 
  }

  protected _s3 = environment.config.AWS_S3; 
  protected _summary: string;
  private _description: SafeHtml;


  _comments: SocialComment[] = null;


  constructor(protected data: ISocialPost) {
    this.setSummary(data.description || '');
  }

  setSummary(desc: string) {
    this._summary = desc.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s{2,}/, " ");
  }

  setSanitizedDescription(d: SafeHtml) {
    this._description = d;
  }

  setComments(comments: ISocialComment[]) {
    if(!this._comments) {
      this._comments = [];
    }
    comments.forEach(c => {
      this.setComment(c);
    });
  }
  setComment(comment: ISocialComment, updateNumCommentTo?: number) {
    if(!this._comments) {
      this._comments = [];
    }
    this._comments.push(new SocialComment(comment));
    if(updateNumCommentTo) {
      this.updateNumComments(updateNumCommentTo);
    }
  }

  updateNumComments(numComments?: number) {
    if(!numComments) {
      numComments = this.comments ? this.comments.length : 0;
    }
    this.data.numComments = numComments;
  }

  like(changeNumLikes: boolean = false, numLikes?: number) {
    this.data.liked = true;
    if(changeNumLikes) {
      this.updateNumLikes(numLikes);
    }
  }
  unlike(changeNumLikes: boolean = false, numLikes?: number) {
    this.data.liked = false;
    if(changeNumLikes) {
      this.updateNumLikes(numLikes);
    }
  }

  updateNumLikes(numLikes: number) {
    this.data.numLikes = numLikes;
  }

  getImageTypeOf(s: string) {
    let imageType: string = '';
    if(s) {
      const regex = /\.(jpe?g|png)$/;
      const match = s.match(regex);
      imageType = match ? ('image/' + match[1]) : '';  
    }
    return imageType;
  }

  decode() {
    return this.data;
  }

  updateWith(data: ISocialPost) {
    this.data.status = data.status;
    this.data.image = data.image;
    this.data.description = data.description;
    this.setSummary(data.description || '');
    this.data.tags = data.tags || [];
  }
}

export interface ISocialComment {
  _id: string;
  body?: string;
  like?: number;
  blogId?: string;
  authorId?: string;
  author?: IUserDetail | Profile;
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
  get createdAt(): Date { return new Date(this.data.createdAt as string); }

  private _author: Profile;

  constructor(private data: ISocialComment) {
    this._author = new Profile(data.author as IUserDetail);
  }
}