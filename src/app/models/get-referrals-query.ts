import { GetQuery, IGetQuery } from "./get-query";

export interface IGetReferralsQuery extends IGetQuery{
  type?: 'recommend' | 'review';
  roles?: string[] | string,
}

export class GetReferralsQuery extends GetQuery implements IGetReferralsQuery {

  get type() { return this.data.type; }
  get roles(){ return typeof this.data.roles == 'string' ? this.data.roles.split(',') : this.data.roles as string[] || []; }

  constructor(
    protected data: IGetReferralsQuery = {}
  ) {
    super(data);
  }

  toJson(): IGetReferralsQuery {
    return {
      ... super.toJson(),
      ... this.type && {type: this.type},
      ... this.roles.length > 0 && {roles: this.roles.join(',')}
    }
  }
}