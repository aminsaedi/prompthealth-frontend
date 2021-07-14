import { Blog, IBlog } from "./blog";

export interface ISocialPost extends IBlog {

}

export class SocialPost extends Blog implements ISocialPost {
  
  get summary() {
    return this._summary.substr(0, 256);
  }

  get isPost() {
    return !this.isEvent && !this.isArticle;
  }
  get isArticle() {
    return this.title && !this.isEvent;
  }

  get isMoreShown() {
    return !!(this._summary.length > this.summary.length)
  }



  constructor(protected data: ISocialPost) {
    super(data);
  }
}