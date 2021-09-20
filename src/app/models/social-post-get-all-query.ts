import { GetQuery, IGetQuery } from "./get-query";
import { ISocialPost } from "./social-post";
import { ISocialPostSearchQuery, SocialPostSearchQuery } from "./social-post-search-query";

export interface ISocialPostGetAllQuery extends IGetQuery {
  status?: ISocialPost['status'][];
  contentType?: ISocialPost['contentType'][];
}

export class SocialPostGetAllQuery extends GetQuery implements ISocialPostGetAllQuery {

  get status() { return this.data.status|| null; }
  get contentType() { return this.data.contentType || null; }

  toJson() {
    const data = super.toJson();

    return {
      ...data,
      ...(this.status && this.status.length > 0) && {status: this.status},
      ...(this.contentType && this.contentType.length > 0) && {contentType: this.contentType},
    };
  }

  constructor(protected data: ISocialPostGetAllQuery) {
    super(data);
  }
}