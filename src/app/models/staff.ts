import { environment } from "src/environments/environment";
import { IUserDetail } from "./user-detail";

export interface IStaff {
  _id?: string;
  center?: string | IUserDetail;
  userId?: IUserDetail | IUserDetail;
  createdAt?: string;
  isDeleted?: boolean;
  firstName?: string;
  profileImage?: string;
  product_description?: string;
  professional_title?: string;

  name?: string;
  isStatic?: boolean;
  title?: string;
  description?: string;
  linkToProfile?: string[]

  decode?: () => IStaff;
  updateWith?: (data: Staff) => void;
}

export class Staff implements IStaff {

  get _id() { return this.data._id; }
  get center() { return this.data.center; }

  get isStatic() { return !this.data.userId; }
  get name() { return this._name; }
  get title() { return this._title; }
  get profileImage() { return this._profileImage ? (environment.config.AWS_S3 + this._profileImage) : null; }
  get description() { return this._description; }
  get staffId() { return (this.isStatic || typeof this.data.userId == 'string') ? null : this.data.userId?._id || null; }
  get linkToProfile() { return this._linkToProfile; }

  decode() { return this.data; }
  
  private _name: string;
  private _title: string;
  private _description: string;
  private _profileImage: string;
  private _linkToProfile: string[] = null;

  constructor(private data: IStaff) {
    this._name = data.firstName || '';
    this._title = data.professional_title || '';
    this._description = data.product_description || '';
    this._profileImage = data.profileImage || null;

    if(!this.isStatic && typeof data.userId != 'string') {
      this._name = (data.userId.firstName + ' ' + data.userId.lastName).trim();
      this._title = data.userId.professional_title;
      this._profileImage = data.userId.profileImage;
      this._description = data.userId.product_description;
    }

    if(!this.isStatic) {
      this._linkToProfile = ['/community/profile', typeof data.userId == 'string' ? data.userId : data.userId._id] ;
    }
  }

  // this is used for updating static staff data
  updateWith(data: IStaff) {
    this._name = data.firstName;
    this.data.firstName = this._name;

    this._title = data.professional_title;
    this.data.professional_title = this._title;

    this._description = data.product_description;
    this.data.product_description = this._description;

    this._profileImage = data.profileImage;
    this.data.profileImage = this._profileImage;
  }
}