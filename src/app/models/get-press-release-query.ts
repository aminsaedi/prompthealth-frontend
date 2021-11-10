/** 
 * press release api does not follow page / order rule. 
 * 
*/
export interface IGetPressReleaseQuery {
  count?: number;
  skip?: number;
  sortBy?: string;
  order?: 1 | -1;
  search?: string;
}

export class GetPressReleaseQuery {
  get count() { return this.data.count || 20; };
  get skip() { return this.data.skip || null; }
  get sortBy() { return this.data.sortBy || null; }
  get order() { return (this.data.order == 1 || this.data.order == -1) ? this.data.order : null; }

  constructor(
    protected data: IGetPressReleaseQuery = {},
  ) {}

  toJson() {
    const json: IGetPressReleaseQuery = {
      count: this.count,
      ... this.skip && {skip: this.skip},
      ... this.sortBy && {sortBy: this.sortBy},
      ... (this.order !== null) && {order: this.order},
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