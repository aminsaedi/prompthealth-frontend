import { ISocialPost } from "./social-post";

export interface ISocialContentSearchQuery {
  sort?: string; /** default: createdAt (desc only) */
  count?: number; /** default: 20 */
  page?: number; /** start with 1 */
  frontend?: string; /** if 1, get only data which status is true */
  tags?: string[]; /** object id list for tag (greedy) */
  timestamp?: string|Date;
  contentType?: ISocialPost['contentType'];
  hasMedia?: boolean;
  hasImage?: boolean;
  hasVoice?: boolean;
  authorId?: string;
}

export class SocialContentSearchQuery implements ISocialContentSearchQuery {

  get sort() { return this.data.sort || null; }
  get count() { return this.data.count || 20; }
  get page() { return this.data.page || null; }
  get frontend() { return this.data.frontend || '1'; }
  get tags() { return this.data.tags || null; }
  get hasMedia() { return this.data.hasMedia || null; }
  get hasImage() { return this.data.hasImage || null; }
  get hasVoice() { return this.data.hasVoice || null; }
  get timestamp() { return this.data.timestamp || null; }
  get authorId() { return this.data.authorId || null; }
  get contentType() { return this.data.contentType || null; }

  toJson() {
    const data: ISocialContentSearchQuery = {
      frontend: this.frontend,
      count: this.count,
      ... (this.sort) && {sort: this.sort},
      ... (this.page) && {page: this.page},
      ... (this.tags) && {tags: this.tags},
      ... (this.hasMedia) && {hasMedia: this.hasMedia},
      ... (this.hasImage) && {hasImage: this.hasImage},
      ... (this.hasVoice) && {hasVoice: this.hasVoice},
      ... (this.timestamp) && {timestamp: this.timestamp},
      ... (this.authorId) && {authorId: this.authorId},
      ... (this.contentType) && {contentType: this.contentType},
    };
    return data;
  }

  toQueryParams() {
    const paramsArray = [];
    const data = this.toJson();
    
    for(let key in data) {
      let val = data[key];
      if (key == 'tags') {
        paramsArray.push(key + '=' + val.join(','));
      } else {
        paramsArray.push(key + '=' + val);
      }
    }
    return '?' + paramsArray.join('&');
  }

  constructor(protected data: ISocialContentSearchQuery = {}) {}
}
