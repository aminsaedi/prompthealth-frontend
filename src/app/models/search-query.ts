export interface ISearchQuery {
  // sortBy?: string; /** default: createdAt*/
  // order?: 'desc' | 'asc';
  count?: number; /** default: 20 */
  page?: number; /** start with 1 */
  
  include?: ('users' | 'blogs')[];
  advanced?: boolean;
}

export class SearchQuery implements ISearchQuery {
  // get sortBy() { return this.data.sortBy || null; }
  // get order() { return this.data.order || null; }
  get count() { return this.data.count || 20; }
  get page() { return this.data.page || null; }
  get include() { return this.data.include || null; }
  get advanced() { return this.data.advanced === true ? true : false; }

  constructor(private data: ISearchQuery) { }

  toJson() {
    const data: ISearchQuery = {
      count: this.count,
      // ... (this.sortBy) && {sortBy: this.sortBy},
      // ... (this.order) && {order: this.order},
      ... (this.page) && {page: this.page},
      ... (this.include) && {include: this.include},
      ... (this.advanced) && {advanced: this.advanced},
    }
    return data;
  }

  toQueryParams() {
    const paramsArray = [];
    const data = this.toJson();
    
    for(let key in data) {
      let val = data[key];
      if (key == 'include') {
        paramsArray.push(key + '=' + val.join(','));
      } else {
        paramsArray.push(key + '=' + val);
      }
    }
    return '?' + paramsArray.join('&');
  }
}