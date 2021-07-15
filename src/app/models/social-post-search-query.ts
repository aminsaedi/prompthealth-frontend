import { BlogSearchQuery, IBlogSearchQuery } from "./blog-search-query";
import { IResponseData } from "./response-data";
import { ISocialPost } from "./social-post";

export interface ISocialPostSearchQuery extends IBlogSearchQuery {}

export class SocialPostSearchQuery extends BlogSearchQuery implements ISocialPostSearchQuery {

  constructor(protected data: ISocialPostSearchQuery) {
    super(data);
  }
}

export interface ISocialPostResult extends IResponseData {
  data: {
    data: ISocialPost[];
    total: number;
  }
}