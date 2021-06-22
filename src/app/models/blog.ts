import { SafeHtml } from "@angular/platform-browser";
import { environment } from "src/environments/environment";
import { IBlogCategory } from "./blog-category";

export interface IBlog {
  _id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  readLength: number;

  image: string;
  videoLinks?: {title: string, url: string}[];
  podcastLinks?: {title: string, url: string}[];

  categoryId?: {_id: string, title: string};
  createdAt: string; /** could be Date? */

  tags: {_id: string, title: string}[];

  isDeleted?: boolean; /** not used in frontend */
  status?: boolean;
}

export class Blog implements IBlog {

  get _id() { return this.data._id; }
  get slug() { return this.data.slug; }  
  get title() { return this.data.title; }
  get description() { return this.data.description; }
  get descriptionSanitized() { return this._description; }
  get summary() { return this._summary; }
  get readLength() { return this.data.readLength; }

  get isEyecatchVideo() { return !!(this.videosEmbedded.length > 0); }
  get isEyecatchPodcast() { return (this.videosEmbedded.length == 0 && this.podcastsEmbedded.length > 0); }
  get isEyecatchImage() { return (this.videosEmbedded.length == 0 && this.podcastsEmbedded.length == 0 && this.image); }
  
  get image() { return (this.data.image) ? this.AWS_S3 + this.data.image : '/assets/img/logo-square-primary-light.png'; }
  get videoLinks() { return this.data.videoLinks || []; }
  get podcastLinks() { return this.data.podcastLinks || []; }
  get videosEmbedded() { return this._videosEmbedded; }
  get podcastsEmbedded() { return this._podcastsEmbedded; }

  // get categoryId() { return this.data.categoryId; }
  get category() { return this.data.categoryId ? this.data.categoryId : null; }
  get catTitle() { return this.data.categoryId ? this.data.categoryId.title : null; }
  get catId() { return this.data.categoryId ? this.data.categoryId._id : null;}

  get tags() { return this.data.tags; }

  get author() { return this.data.author; }
  get authorImage() { return 'assets/img/logo-sm-square.png'}
  get createdAt() { return this.data.createdAt; }

  private AWS_S3 = environment.config.AWS_S3;

  private _summary: string;
  private _description: SafeHtml;

  private _videosEmbedded: SafeHtml [] = [];
  private _podcastsEmbedded: SafeHtml [] = [];
  
  
  constructor(private data: IBlog, categories: IBlogCategory[] = []) {
    const desc = data.description || '';
    this._summary = desc.replace(/<\/?[^>]+(>|$)/g, '');    
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

}