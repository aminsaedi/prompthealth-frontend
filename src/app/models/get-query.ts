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

  toJSON() {
    const json: IGetQuery = {
      count: this.count,
      page: this.page,
    };
    return json;
  }

  toQueryParamsString() {
    let str = '?';
    str += `count+${this.count}`;
    str += `page+${this.page}`;

    return str;
  }
}