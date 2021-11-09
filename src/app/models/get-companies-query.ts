import { GetQuery, IGetQuery } from "./get-query";

export interface IGetCompaniesQuery extends IGetQuery {
  services?: string[];
  featured?: boolean;
  keyword?: string;
  frontend?: number;
  company_type?: string[];
}

export class GetCompaniesQuery extends GetQuery implements IGetCompaniesQuery {
  get services() { return this.data.services || []; }
  get featured() { return this.data.featured || false; }
  get keyword() { return this.data.keyword || ''; }
  get frontend() { return 1; }
  get company_type() { return this.data.company_type || []; }

  constructor(protected data: IGetCompaniesQuery = {}) {
    super(data);
  }

  toJson() {
    let data = super.toJson();
    data = {
      ...data,
      ... (this.services.length > 0) && { services: this.services },
      ... (this.company_type.length > 0) && { company_type: this.company_type },
      ... {frontend: this.frontend },
      ... (this.keyword) && { keyword: this.keyword },
      ... (this.featured) && {featured: this.featured },
    }
    return data;
  }

  toQueryParamsString() {
    return super.toQueryParamsString();
  }
}