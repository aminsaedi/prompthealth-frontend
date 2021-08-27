export interface IGetQuery {
  count?: number;
  page?: number;
}

export class GetQuery {
  get count() { return this.data.count || 20; };
  get page() { return this.data.page || 1; };

  constructor(
    protected data: IGetQuery = {},
  ) {}

  toJson() {
    const json: IGetQuery = {
      count: this.count,
      page: this.page,
    };
    return json;
  }

  toQueryParamsString() {
    const paramsArray = [];
    const data = this.toJson();
    
    for(let key in data) {
      let val = data[key];
      paramsArray.push(key + '=' + val);
    }
    return '?' + paramsArray.join('&');
  }
}