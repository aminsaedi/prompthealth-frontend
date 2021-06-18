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

  categoryId: string;
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
  get summary() { return this._summary; }
  get readLength() { return this.data.readLength; }

  get image() { return (this.data.image) ? this.AWS_S3 + this.data.image : '/assets/img/no-image.jpg'; }
  get videoLinks() { return this.data.videoLinks; }
  get podcastLinks() { return this.data.podcastLinks; }
  get fistVideo() { return (this.data.videoLinks && this.data.videoLinks.length > 0) ? this.data.videoLinks[0] : null; }
  get firstPodcast() { return (this.data.podcastLinks && this.data.podcastLinks.length > 0) ? this.data.podcastLinks[0] : null; }

  get categoryId() { return this.data.categoryId; }
  get category() { return this._category ? this._category.title : null; }

  get tags() { return this.data.tags; }

  get author() { return this.data.author; }
  get authorImage() { return 'assets/img/logo-sm-square.png'}
  get createdAt() { return this.data.createdAt; }

  private _summary: string;
  private _category: IBlogCategory = null;
  private AWS_S3 = environment.config.AWS_S3;
  
  constructor(private data: IBlog, categories: IBlogCategory[] = []) {
    this._summary = data.description.replace(/<[^>]*>?/gm, '');
    for(let cat of categories) {
      if(cat._id == data.categoryId) {
        this._category = cat;
        break;
      }
    }
  }
}