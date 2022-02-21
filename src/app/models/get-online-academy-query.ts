export interface IGetOnlineAcademyQuery {
  count?: number;
  skip?: number;
  sortBy?: string;
  order?: 1 | -1;
  search?: string;
  category?: string;
  onlyFreeAcademy?: boolean;
}

export class GetOnlineAcademyQuery {
  get count() {
    return this.data.count || 20;
  }
  get skip() {
    return this.data.skip || null;
  }
  get sortBy() {
    return this.data.sortBy || null;
  }
  get order() {
    return this.data.order == 1 || this.data.order == -1
    ? this.data.order
    : null;
  }
  get category() {
    return this.data.category || null;
  }
  get onlyFreeAcademy() {
    return this.data.onlyFreeAcademy || false;
  }
  
  constructor(protected data: IGetOnlineAcademyQuery = {}) {}

  toJson() {
    const json: IGetOnlineAcademyQuery = {
      count: this.count,
      ...(this.skip && { skip: this.skip }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.order !== null && { order: this.order }),
      ...(this.category !== null && { category: this.category }),
      ...(this.onlyFreeAcademy !== false && { onlyFreeAcademy: this.onlyFreeAcademy }),
    };
    return json;
  }

  toQueryParamsString() {
    const paramsArray = [];
    const data = this.toJson();

    for (let key in data) {
      let val = data[key];
      if (Array.isArray(val)) {
        paramsArray.push(key + "=" + val.join(","));
      } else {
        paramsArray.push(key + "=" + val);
      }
    }
    return "?" + paramsArray.join("&");
  }
}
