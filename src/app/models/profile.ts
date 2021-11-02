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
  followings: Profile[]; /** should be saved in socialService? */
  followers: Profile[]; /** should be saved in socialService? */
  followingTopics: any[];

  isC: boolean;
  isP: boolean;
  isSP: boolean;
  isSA: boolean;
  isU: boolean;
  isProvider: boolean;
  isApproved: boolean;
  isVerified: boolean; /** verified for badge */

  hasProfile: boolean;
  isEligibleToCreateNote: boolean;
  isEligibleToCreatePromo: boolean;
  isEligibleToCreateArticle: boolean;
  isEligibleToCreateEvent: boolean;

  linkToProfile: string;

  gender: string;

  eligibleCreateRecommendation: boolean;
}

export class Profile implements IProfile {
  get _id() { return this.data._id; }
  get email() { return this.data.email || ''; }
  get role() { return this.data.roles; }

  get firstName() { return (this.data.firstName || this.data.fname || '').trim(); }
  get lastName() { return (this.data.lastName || this.data.lname || '').trim(); }
  get name() { return [this.firstName, this.lastName].join(' ').trim() || this._noname(); } //fullname
  get nickname() { return this.firstName || this.lastName || this._noname(); }

  private _noname() { return 'User-' + this._id.substr(0,5); }

  get description() { return this.data.product_description || this.data.description || ''; }

  get profileImage() { return this._profileImage ? this._s3 + '350x220/' + this._profileImage : ''; }
  get profileImageFull() { return this._profileImage ? this._s3 + this._profileImage : ''; }
  get profileImageType() { return this._profileImageType; }

  get coverImage() { return this.data.cover ? this._s3 + this.data.cover : ''; }

  get followings() { return this._followings; };
  get followers() { return this._followers; }
  get followingTopics() { return this._followingTopics; }

  get numFollowing() { return this.data.follow.following || 0; }
  get numFollower() { return this.data.follow.followed || 0; }

  get isU() { return !!(this.role == 'U'); }
  get isC() { return !!(this.role == 'C'); }
  get isSP() { return !!(this.role == 'SP'); }
  get isProvider() { return !!(this.isC || this.isSP); }
  get isP() { return !!(this.role == 'P'); }
  get isSA() { return !!(this.role == 'SA'); }

  get hasProfile() { return !this.isU; }
  get isEligibleToCreateNote() { return this.isProvider || this.isSA; }
  get isEligibleToCreatePromo() { return this.isP; }
  get isEligibleToCreateArticle() { return (this.isProvider && this.isPaid) || this.isSA; }
  get isEligibleToCreateEvent() { return (!this.isU && this.isPaid) || this.isSA; }

  get isPaid() {
    return (
      this.data.isVipAffiliateUser || 
      (this.data.plan && this.data.plan.name.toLowerCase() != 'basic')
    );
  }


  get isApproved() { return this.isU || this.isSA || this.data.isApproved; }
  get isVerified() { return this.isSA || this.data.verifiedBadge || false; }

  get linkToProfile() { return !this.isU ? '/community/profile/' + this._id : null; }

  get gender() { return this.data.gender || ''; }

  get eligibleCreateRecommendation() { 
    return this.isSA ? 
      true : 
      this.isProvider && this.isApproved ?
        true :
        false;
  }

  private _profileImage: string;
  private _profileImageType: string;
  private _followings: IProfile['followings'] = null;
  private _followers: IProfile['followers'] = null;
  private _followingTopics: IProfile['followingTopics'] = null;

  protected _s3 = environment.config.AWS_S3;

  constructor(protected data: IUserDetail) {
    const image = (data.profileImage && data.profileImage.length > 0) ? 
      data.profileImage : 
      (data.image && typeof(data.image) == 'string' && data.image.length > 0) ? 
        data.image : 
        null;

    this._profileImage = image ? image + '?ver=2' : null;
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

  setFollowing(user: IUserDetail, countup: boolean = false) {
    // do only when _followings exists.
    if(this._followings) {
      this._followings.push(new Profile(user));
    }
    // if(!this._followings) {
    //   this._followings = [];
    // }
    // this._followings.push(new Profile(user));

    if(countup) {
      this.countupFollowing();
    }
  }

  removeFollowing(user: IUserDetail, countdown: boolean = false) {
    if(this._followings && this._followings.length == 0) {
      console.log('no one follows. you cannot remove this user from following list');
      return;
    }

    if (!this._followings) {
      console.log('following list is not ready yet. the user will not be added in following list for now');
    } else {
      const idx = this._followings.findIndex(item => item._id == user._id);
      if(idx >= 0) {
        this._followings.splice(idx, 1);
      }
    }

    if(countdown && this.data.follow.following > 0) {
      this.countdownFollowing();
    }
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

  setFollowingTopics(topics: string[]) {
    if(!this._followingTopics) {
      this._followingTopics = [];
    }
    topics.forEach(t => {
      this._followingTopics.push(t);
    })
  };

  countupFollowing() { this.data.follow.following = this.data.follow.following ? this.data.follow.following + 1 : 1; }
  countdownFollowing() { this.data.follow.following = this.data.follow.following > 0 ? this.data.follow.following - 1 : 0; }
  countupFollower() { this.data.follow.followed = this.data.follow.followed ? this.data.follow.followed + 1 : 1; }
  countdownFollower() { this.data.follow.followed = this.data.follow.followed > 0 ? this.data.follow.followed - 1 : 0; }

  decode(): IUserDetail { return this.data; }

}