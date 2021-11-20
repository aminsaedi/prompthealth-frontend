import { GetQuery, IGetQuery } from "./get-query";
import { IShowcase } from "./showcase";

export interface IGetShowcaseQuery extends IGetQuery{
  userId: string;
  frontend?: number
}

export class GetShowcaseQuery extends GetQuery implements IGetShowcaseQuery{
  get userId() { return this.data.userId; }
  get frontend() { return this.data.frontend ? 1 : 0; }

  constructor( protected data: IGetShowcaseQuery) {
    super(data);
  }

  toJson() {
    const json: IGetShowcaseQuery = {
      ...super.toJson(),
      userId: this.userId,
      frontend: this.frontend,
    };
    return json;
  }
}

export class SaveShowcaseQuery {
  constructor(private data: IShowcase) {}

  toJson() {
    return {
      userId: this.data.userId,
      title: this.data.title,
      images: this.data.images,
      price: this.data.price ? this.data.price : null, 
      description: this.data.description ? this.data.description : null,
    }
  }
}