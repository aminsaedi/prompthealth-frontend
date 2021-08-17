import { environment } from "src/environments/environment";
import { IUserDetail } from "./user-detail";

export interface IProfile {
  _id: IUserDetail['_id'];
  role: IUserDetail['roles'];
  email: IUserDetail['email'];

  firstName: IUserDetail['firstName'];
  lastName: IUserDetail['lastName'];
  name: string;

  profileImage: IUserDetail['profileImage'];
  profileImageFull: IUserDetail['profileImage'];
  profileImageType: string;

  followData: {
    followed: {
      data: IUserDetail[];
      total: number;
    };
    following: IProfile['followData']['followed'];
  }

  isApproved: boolean;
  isFollowDataReady: boolean;

  linkToProfile: string;

  gender: string;


}

export class Profile implements IProfile {
  get _id() { return this.data._id; }
  get email() { return this.data.email || ''; }
  get role() { return this.data.roles; }

  get firstName() { return (this.data.firstName || this.data.fname || '').trim(); }
  get lastName() { return (this.data.lastName || this.data.lname || '').trim(); }
  get name() {
    const nameArray = [];
    if(this.firstName.length > 0) { nameArray.push(this.firstName); }
    if(this.lastName.length > 0) { nameArray.push(this.lastName); }
    return nameArray.join(' ').trim();
  }

  get profileImage() { return this._profileImage ? this._s3 + '350x220/' + this._profileImage : ''; }
  get profileImageFull() { return this._profileImage ? this._s3 + this._profileImage : ''; }
  get profileImageType() { return this._profileImageType; }

  get isApproved() { return this.role == 'U' || this.role == 'SA' || this.data.isApproved; }

  get linkToProfile() { return this.role != 'U' ? '/community/profile/' + this._id : null; }

  get gender() { return this.data.gender || ''; }

  get followData() { return this._followData; }
  get isFollowDataReady() { return this._followDataInitDone; }

  private _profileImage: string;
  private _profileImageType: string;
  private _followData: IProfile['followData'] = null;
  private _followDataInitDone = false;

  protected _s3 = environment.config.AWS_S3;

  constructor(protected data: IUserDetail) {
    const image = (data.profileImage && data.profileImage.length > 0) ? 
      data.profileImage : 
      (data.image && typeof(data.image) == 'string' && data.image.length > 0) ? 
        data.image : 
        null;

    this._profileImage = image ? image + '?ver=1.0.2' : null;
    let imageType = '';
    if(image) {
      const regex = /\.(jpe?g|png)$/;
      const match = image.match(regex);
      imageType = match ? ('image/' + match[1]) : '';  
    }
    this._profileImageType = imageType;
  }
}