import { ISocialPost } from "./social-post";

export interface ISocialPostSearchQuery {
  sortBy?: string; /** default: createdAt*/
  order?: 'desc' | 'asc';
  count?: number; /** default: 20 */
  tags?: string[]; /** object id list for tag (greedy) */
  timestamp?: string|Date; /** search contents created before the timestamp */
  eventTimeRange?: (string|Date)[]; /** [from, to?] search events which START in this time range*/
  contentType?: ISocialPost['contentType'];
  hasMedia?: boolean;
  hasImage?: boolean;
  hasVoice?: boolean;
  authorId?: string;
  excludeExpiredPromo?: boolean;
  excludePastEvent?: boolean;

}

export class SocialPostSearchQuery implements ISocialPostSearchQuery {

  get sortBy() { return this.data.sortBy || null; }
  get order() { return this.data.order || null; }
  get count() { return this.data.count || 20; }
  get tags() { return this.data.tags || null; }
  get hasMedia() { return this.data.hasMedia || null; }
  get hasImage() { return this.data.hasImage || null; }
  get hasVoice() { return this.data.hasVoice || null; }
  get timestamp() { return this.data.timestamp || null; }
  get eventTimeRange() { return this.data.eventTimeRange || null; }
  get authorId() { return this.data.authorId || null; }
  get contentType() { return this.data.contentType || null; }
  get excludeExpiredPromo() { return this.data.excludeExpiredPromo || null; }
  get excludePastEvent() { return this.data.excludePastEvent || null; }

  toJson() {
    const data: ISocialPostSearchQuery = {
      count: this.count,
      ... (this.sortBy) && {sortBy: this.sortBy},
      ... (this.order) && {order: this.order},
      ... (this.tags) && {tags: this.tags},
      ... (this.hasMedia) && {hasMedia: this.hasMedia},
      ... (this.hasImage) && {hasImage: this.hasImage},
      ... (this.hasVoice) && {hasVoice: this.hasVoice},
      ... (this.timestamp) && {timestamp: this.timestamp},
      ... (this.eventTimeRange) && {eventTimeRange: this.eventTimeRange},
      ... (this.authorId) && {authorId: this.authorId},
      ... (this.contentType) && {contentType: this.contentType},
      ... (this.excludeExpiredPromo) && {excludeExpiredPromo: this.excludeExpiredPromo},
      ... (this.excludePastEvent) && {excludePastEvent: this.excludePastEvent},
    };
    return data;
  }

  toQueryParams() {
    const paramsArray = [];
    const data = this.toJson();
    
    for(let key in data) {
      let val = data[key];
      if (key == 'tags' || key == 'eventTimeRange') {
        paramsArray.push(key + '=' + val.join(','));
      } else {
        paramsArray.push(key + '=' + val);
      }
    }
    return '?' + paramsArray.join('&');
  }

  constructor(protected data: ISocialPostSearchQuery = {}) {}
}
