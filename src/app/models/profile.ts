import { environment } from "src/environments/environment";
import { IUserDetail } from "./user-detail";

export interface IProfile {
  _id: IUserDetail['_id'];
  role: IUserDetail['roles'];
  email: IUserDetail['email'];

  firstName: IUserDetail['firstName'];
  lastName: IUserDetail['lastName'];
  name: string;
  nickname: string;

  description: string; /** practicePhilosophy | description of professionals belonging at the center */

  profileImage: IUserDetail['profileImage'];
  profileImageFull: IUserDetail['profileImage'];
  profileImageType: string;
  coverImage: string;

  numFollowing: number;
  numFollower: number;
  followings: Profile[];
  followers: Profile[];

  isC: boolean;
  isP: boolean;
  isSP: boolean;
  isSA: boolean;
  isU: boolean;
  isProvider: boolean;
  isApproved: boolean;
  isVerified: boolean; /** verified for badge */

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
  get nickname() {
    let name = '(No Name)';
    if (this.firstName.length > 0) { 
      name = this.firstName; 
    } else if (this.lastName.length > 0) {
      name = this.lastName;
    }
    return name;
  }

  get description() { return this.data.product_description || this.data.description || ''; }

  get profileImage() { return this._profileImage ? this._s3 + '350x220/' + this._profileImage : ''; }
  get profileImageFull() { return this._profileImage ? this._s3 + this._profileImage : ''; }
  get profileImageType() { return this._profileImageType; }

  get coverImage() { return null; }

  get followings() { return this._followings; };
  get followers() { return this._followers; }

  get numFollowing() { return this.data.follow.following || 0; }
  get numFollower() { return this.data.follow.followed || 0; }

  get isU() { return !!(this.role == 'U'); }
  get isC() { return !!(this.role == 'C'); }
  get isSP() { return !!(this.role == 'SP'); }
  get isProvider() { return !!(this.isC || this.isSP); }
  get isP() { return !!(this.role == 'P'); }
  get isSA() { return !!(this.role == 'SA'); }

  get isApproved() { return this.isU || this.isSA || this.data.isApproved; }
  get isVerified() { return this.isSA || this.data.verifiedBadge || false; }

  get linkToProfile() { return !this.isU ? '/community/profile/' + this._id : null; }

  get gender() { return this.data.gender || ''; }

  private _profileImage: string;
  private _profileImageType: string;
  private _followings: Profile[] = null;
  private _followers: Profile[] = null;

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

  setFollowings(users: IUserDetail[]) {
    if(!this._followings) {
      this._followings = [];
    }
    users.forEach(user => {
      this.setFollowing(user);
    });
  }

  setFollowing(user: IUserDetail) {
    if(!this._followings) {
      this._followings = [];
    }

    this._followings.push(new Profile(user));
  }

  setFollowers(users: IUserDetail[]) {
    if(!this._followers) {
      this._followers = [];
    }
    users.forEach(user => {
      this.setFollower(user);
    });
  }

  setFollower(user: IUserDetail) {
    if(!this._followers) {
      this._followers = [];
    }

    this._followers.push(new Profile(user));
  }
}