import { environment } from "src/environments/environment";
import { IDefaultPlan } from "./default-plan";
import { IReferral, Referral } from "./referral";
import { IShowcase, Showcase } from "./showcase";
import { IStaff, Staff } from "./staff";
import { IUserDetail, IVideo } from "./user-detail";

export interface IProfile {
  _id: IUserDetail['_id'];
  role: IUserDetail['roles'];

  firstName: IUserDetail['firstName'];
  lastName: IUserDetail['lastName'];
  name: string;
  nickname: string;

  description: string; /** practicePhilosophy | description of professionals belonging at the center */

  profileImage: IUserDetail['profileImage'];
  profileImageFull: IUserDetail['profileImage'];
  profileImageType: string;

  numFollowing: number;
  numFollower: number;
  followings: Profile[]; /** should be saved in socialService? */
  followers: Profile[]; /** should be saved in socialService? */

  videos: IVideo[];
  staffs: Staff[];
  showcases: Showcase[];
  socialLinks: IUserDetail['socialLinks'];

  doneInitStaffs: boolean;
  doneInitShowcases: boolean;

  isC: boolean;
  isP: boolean;
  isSP: boolean;
  isSA: boolean;
  isU: boolean;
  isProvider: boolean;
  isVerified: boolean; /** verified for badge */

  hasProfile: boolean;

  linkToProfile: string;

  gender: string;

  eligibleToManageTeam: boolean;
  eligibleToManageShowcase: boolean;
  eligibleToManageBadge: boolean;
  eligibleToManageVideo: boolean;
  eligibleToConnectSocial: boolean;
}

export class Profile implements IProfile {
  get _id() { return this.data._id; }
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

  get followings() { return this._followings; };
  get followers() { return this._followers; }

  get numFollowing() { return this.data.follow.following || 0; }
  get numFollower() { return this.data.follow.followed || 0; }

  get staffs() { return (this.eligibleToManageTeam) ? (this._staffs || []) : []; }
  get showcases() { return (this.eligibleToManageShowcase) ? (this._showcases || []) : []; }
  get videos() { return (this.eligibleToManageVideo) ? this.data.videos : []; } 
  get socialLinks() { return this.eligibleToConnectSocial ? this.data.socialLinks : []; }


   
  get isU() { return !!(this.role == 'U'); }
  get isC() { return !!(this.role == 'C'); }
  get isSP() { return !!(this.role == 'SP'); }
  get isProvider() { return !!(this.isC || this.isSP); }
  get isP() { return !!(this.role == 'P'); }
  get isSA() { return !!(this.role == 'SA'); }

  get hasProfile() { return !this.isU; }

  get isPaid() {
    return (
      this.data.isVipAffiliateUser || 
      (this.data.plan && this.data.plan.name.toLowerCase() != 'basic')
    );
  }

  get isVerified() { return this.isSA || (this.data.verifiedBadge && this.isPaid) || false; }

  get doneInitStaffs() { return !!this._staffs; }
  get doneInitShowcases() { return !!this._showcases; }

  get linkToProfile() { return !this.isU ? '/community/profile/' + this._id : null; }

  get gender() { return this.data.gender || ''; }


  get eligibleToManageTeam() { return this.isPaid && this.isC; }
  get eligibleToManageShowcase() { return this.isPaid && this.isC; }
  get eligibleToManageBadge() { return this.isPaid && this.isProvider; }
  get eligibleToManageVideo() { return this.isPaid && this.isC; }
  get eligibleToConnectSocial() { return (this.isPaid && (this.isProvider || this.isP)) || this.isSA;  }


  private _profileImage: string;
  private _profileImageType: string;
  private _followings: IProfile['followings'] = null;
  private _followers: IProfile['followers'] = null;
  private _staffs: Staff[] = null;
  private _showcases: Showcase[] = null;


  protected _s3 = environment.config.AWS_S3;

  constructor(protected data: IUserDetail) {
    this.initProfileImage();
  }

  initProfileImage() {
    const image = (this.data.profileImage && this.data.profileImage.length > 0) ? 
      this.data.profileImage : 
      (this.data.image && typeof(this.data.image) == 'string' && this.data.image.length > 0) ? 
        this.data.image : 
        null;

    this._profileImage = image ? image + '?ver=2.3' : null;
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

  // set staffs belonging to the user (centre)
  setStaffs(staffs: IStaff[]) { 
    if(!this._staffs) {
      this._staffs = [];
    }
    staffs.forEach(staff => {
      this.setStaff(staff);
    });
  }

  setStaff(staff: IStaff) {
    if(!this._staffs) {
      this._staffs = [];
    }
    this._staffs.push(new Staff(staff));
  }

  removeStaff(staff: IStaff) {
    if(this._staffs) {
      this._staffs = this._staffs.filter(item => staff._id != item._id);
    }
  }

  setShowcases(showcases: IShowcase[]) {
    if(!this._showcases) {
      this._showcases = [];
    }
    
    showcases.forEach(showcase => { this.setShowcase(showcase); });
  }

  setShowcase(showcase: IShowcase) {
    if(!this._showcases) {
      this._showcases = [];
    }
    
    this._showcases.push(new Showcase(showcase));
  }

  removeShowcase(showcase: IShowcase) {
    this._showcases = this._showcases.filter(item => showcase._id != item._id )
  }



  countupFollowing() { this.data.follow.following = this.data.follow.following ? this.data.follow.following + 1 : 1; }
  countdownFollowing() { this.data.follow.following = this.data.follow.following > 0 ? this.data.follow.following - 1 : 0; }
  countupFollower() { this.data.follow.followed = this.data.follow.followed ? this.data.follow.followed + 1 : 1; }
  countdownFollower() { this.data.follow.followed = this.data.follow.followed > 0 ? this.data.follow.followed - 1 : 0; }

  decode(): IUserDetail { return this.data; }

}