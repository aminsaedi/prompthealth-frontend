import { IBlog } from "./blog";
import { IResponseData } from "./response-data";

export interface IBlogSearchQuery {
  sort?: string; /** default: createdAt (desc only) */
  count?: number; /** default: 20 */
  page?: number; /** start with 1 */
  frontend?: string; /** if 1, get only data which status is true */
  categoryId?: string; /** object id for category */
  tags?: string[]; /** object id list for tag (greedy) */
  search?: string; /** title search */
  existVideo?: boolean;
  existPodcast?: boolean;
}

export class BlogSearchQuery implements IBlogSearchQuery {

  get sort() { return this.data.sort || null; }
  get count() { return this.data.count || null; }
  get page() { return this.data.page || 1; }
  get frontend() { return this.data.frontend || '1'; }
  get search() { return this.data.search || null; }
  get categoryId() { return this.data.categoryId || null; }
  get tags() { return this.data.tags || null; }
  get existVideo() { return this.data.existVideo || null; }
  get existPodcast() { return this.data.existPodcast || null; }

  get json() {
    const data: IBlogSearchQuery = {
      frontend: this.frontend,
    };
    data.count = this.count || 12;
    if(this.sort) { data.sort = this.sort; }
    if(this.page) { data.page = this.page; }
    if(this.search) { data.search = this.search; }
    if(this.categoryId) { data.categoryId = this.categoryId; }
    if(this.tags) { data.tags = this.tags; }
    if(this.existVideo) { data.existVideo = true; }
    if(this.existPodcast) { data.existPodcast = true; }
    return data;
  }

  get queryParams() {
    const paramsArray = [];
    const data = this.json;
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

  constructor(protected data: IBlogSearchQuery = {}) {}
}

export interface IBlogSearchResult extends IResponseData {
  data: {
    data: IBlog[];
    total: number;  
  }
}