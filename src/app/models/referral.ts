import { Profile } from "./profile";
import { IUserDetail } from "./user-detail";

export interface IReferral {
  to?: IUserDetail | string;
  from?: IUserDetail | string
  body?: string;
  rating?: number;
  type?: 'review' | 'recommend';
  createdAt?: string | Date;

  toName?: string;
  toImage?: string;
  toLinkToProfile?: string;
  fromName?: string;
  fromImage?: string;
  fromLinkToProfile?: string;
  isRecommend?: boolean;
  isReview?: boolean;
}

export class Referral implements IReferral {
  
  get to() { return (this._to ? this._to._id : this.data.to) as string; }
  get toName() { return this._to ? this._to.nickname : null; }
  get toImage() { return this._to ? this._to.profileImage : null; }
  get toLinkToProfile() { return this._to ? this._to.linkToProfile : null; }
  get from() { return (this._from ? this._from._id : this.data.from) as string; }
  get fromName() { return this._from ? this._from.nickname : null; }
  get fromImage() { return this._from ? this._from.profileImage : null; }
  get fromLinkToProfile() { return this._from ? this._from.linkToProfile : null; }
  get body() { return this.data.body; }
  get rating() { return this.data.rating; }
  get isRecommend() { return this.data.type == 'recommend'; }
  get isReview() { return this.data.type == 'review'; }
  get createdAt() { return this.data.createdAt; }

  private _to: Profile;
  private _from: Profile;
  constructor(private data: IReferral) {
    this._to = typeof data.to != 'string' ? new Profile(data.to) : null;
    this._from = typeof data.from != 'string' ? new Profile(data.from) : null;
  }
}
