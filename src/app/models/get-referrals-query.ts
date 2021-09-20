import { GetQuery, IGetQuery } from "./get-query";

export interface IGetReferralsQuery extends IGetQuery{
  type?: 'recommend' | 'review';
}

export class GetReferralsQuery extends GetQuery implements IGetReferralsQuery {

  get type() { return this.data.type; }

  constructor(
    protected data: IGetReferralsQuery = {}
  ) {
    super(data);
  }

  toJson(): IGetReferralsQuery {
    return {
      ... super.toJson(),
      ... this.type && {type: this.type},
    }
  }
}