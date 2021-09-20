import { ISocialPost } from "./social-post";
import { ISocialPostSearchQuery, SocialPostSearchQuery } from "./social-post-search-query";

export interface ISocialPostGetAllQuery extends ISocialPostSearchQuery {
  status?: ISocialPost['status'][];
}

export class SocialPostGetAllQuery extends SocialPostSearchQuery implements ISocialPostGetAllQuery {

  get status() { return this.data.status|| null; }

  toJson() {
    const data = super.toJson();
    if(this.status && this.status.length > 0) {
      data['status'] = this.status;
    }
    return data;
  }

  toQueryParamsString() {
    const paramsArray = [];
    const data = this.toJson();
    
    for(let key in data) {
      let val = data[key];
      if(Array.isArray(val) && val.length > 0) {
        paramsArray.push(key + '=' + val.join(','));
      } else {
        paramsArray.push(key + '=' + val);
      }
    }
    return '?' + paramsArray.join('&');
  }

  constructor(protected data: ISocialPostGetAllQuery) {
    super(data);
  }
}