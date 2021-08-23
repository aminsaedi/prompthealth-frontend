import { ISocialPost, SocialPostBase } from "./social-post";

export class SocialNote extends SocialPostBase implements ISocialPost {
  get voice() { return this.data.voice ? (this._s3 + this.data.voice) : null; }
  get images() { return this._images; }
  
  private _images: string[];
  constructor(protected data: ISocialPost) {
    super(data);
    
    this._images = data.images ? data.images.map(image => this._s3 + image) : [];
  }
}