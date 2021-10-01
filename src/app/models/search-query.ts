import { GetQuery, IGetQuery } from "./get-query";

export interface ISearchQuery extends IGetQuery {
  // sortBy?: string; /** default: createdAt*/
  // order?: 'desc' | 'asc';
  
  include?: ('users' | 'blogs')[];
  advanced?: boolean;
}

export class SearchQuery extends GetQuery implements ISearchQuery {
  // get sortBy() { return this.data.sortBy || null; }
  // get order() { return this.data.order || null; }

  get include() { return this.data.include || null; }
  get advanced() { return this.data.advanced === true ? true : false; }

  constructor(protected data: ISearchQuery) {
    super(data);
  }

  toJson() {
    const data: ISearchQuery = {
      ... super.toJson(),
      // ... (this.sortBy) && {sortBy: this.sortBy},
      // ... (this.order) && {order: this.order},
      ... (this.page) && {page: this.page},
      ... (this.include) && {include: this.include},
      ... (this.advanced) && {advanced: this.advanced},
    }
    return data;
  }
}