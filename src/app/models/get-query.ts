export interface IGetQuery {
  count?: number;
  page?: number;
  sortBy?: string;
  order?: 'desc' | 'asc';
}

export class GetQuery {
  get count() { return this.data.count || 20; };
  get page() { return this.data.page || 1; };
  get order() { return this.data.order || null; }
  get sortBy() { return this.data.sortBy || null; }

  constructor(
    protected data: IGetQuery = {},
  ) {}

  toJson() {
    const json: IGetQuery = {
      count: this.count,
      page: this.page,
      ... this.sortBy && {sortBy: this.sortBy},
      ... this.order && {order: this.order},
    };
    return json;
  }

  toQueryParamsString() {
    const paramsArray = [];
    const data = this.toJson();
    
    for(let key in data) {
      let val = data[key];
      if(Array.isArray(val)) {
        paramsArray.push(key + '=' + val.join(','));
      } else {
        paramsArray.push(key + '=' + val);
      }
    }
    return '?' + paramsArray.join('&');
  }
}