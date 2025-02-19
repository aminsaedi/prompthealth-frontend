import { IBooking } from "./booking";
import { IDefaultPlan } from "./default-plan";
import { ISocialNotification } from "./notification";
import { IReferral } from "./referral";
import { IShowcase } from "./showcase";
import { ISocialComment, ISocialPost } from "./social-post";
import { IStaff } from "./staff";
import { IUserDetail } from "./user-detail";

export interface IResponseData {
  statusCode: number;
  message: string;
  data: any;
}

export interface IAuthResult extends IResponseData {
  statusCode: number;
  message: string;
  data: {
    _id: IUserDetail['_id'],
    email: IUserDetail['email'],
    loginToken: string,
    lastLogin: string,
    roles: IUserDetail['roles'],
    firstName: IUserDetail['firstName'],
    verifiedBadge: IUserDetail['verifiedBadge'],
    profileImage: IUserDetail['profileImage'],
    lastName: IUserDetail['lastName'],
    favouriteBy: IUserDetail['favouriteBy'],
    isVipAffiliateUser: IUserDetail['isVipAffiliateUser'],
  }
}

export interface IGetProfileResult extends IResponseData{
  data: IUserDetail;
}

export interface ISaveProfileResult extends IResponseData {
  data: IUserDetail;
}

export interface IGetPractitionersResult extends IResponseData {
  data: {
    dataArr: {
      userId: string,
      userData: IUserDetail,
      ans: {
        _id: string,
        item_text: string,
        subans: boolean,
      }[],  
    }[],
    filter_name: any[],
  }
}

export interface IGetCompaniesResult extends IResponseData {
  data: IUserDetail[];
}

export interface IGetPlansResult extends IResponseData {
  data: IDefaultPlan[]
}

export interface IGetBookingsResult extends IResponseData {
  data: {
    data: IBooking[];
    total: number;
  }
}

export interface IUpdateBookingResult extends IResponseData {
  data: IBooking;
}

export interface IGetFollowingsResult extends IResponseData {
  data: IUserDetail[];
}

export interface IGetFollowingTopicsResult extends IResponseData {
  data: string[];
}

export interface IGetFollowStatusResult extends IResponseData {
  data: {
    _id: string,
    following: string,
    followed: string,
  }
}

export interface IFollowResult extends IResponseData {
  data: {
    _id: string,
    following: string,
    followed: string,
  }
}

export interface IFollowMultipleResult extends IResponseData {
  data: IFollowResult['data'][];
}

export interface IUnfollowResult extends IResponseData {
  data: {
    deleted: boolean;
  }
}

export interface IBellResult extends IResponseData {
  data: {
    _id: string,
    belling: string,
    belled: string,
  }
}

export interface IUnbellResult extends IResponseData {
  data: {
    deleted: boolean;
  }
}

export interface IGetBellStatusResult extends IResponseData {
  data: {
    _id: string,
    belling: string,
    belled: string,
  }
}

export interface IContentCreateResult extends IResponseData {
  data: ISocialPost;
}

export interface IUploadMultipleImagesResult extends IResponseData {
  data: string[];
}

export interface IUploadImageResult extends IResponseData {
  data: string;
}

export interface IGetSocialContentsResult extends IResponseData {
  data: {
    data: (ISocialPost)[]
  }
}

export interface IGetSocialContentsByAuthorResult extends IResponseData {
  data: (ISocialPost)[]
}

export interface IGetSocialContentResult extends IResponseData {
  data: ISocialPost;
}

export interface IGetPressReleasesResult extends IResponseData {
    // data: ISocialPost[];
  data: {
    data: ISocialPost[];
    total: number;  
  }
}

export interface ICommentCreateResult extends IResponseData {
  data: {
    post: ISocialPost;
    comment: ISocialComment;
  };
}

export interface ISearchResult extends IResponseData {
  data: {
    users: IUserDetail[];
    blogs: ISocialPost[];
  }
}

export interface IGetNotificationsResult extends IResponseData {
  data: ISocialNotification[];
}

export interface IGetReferralsResult extends IResponseData {
  data: IReferral[];
}

export interface ICreateReferralResult extends IResponseData {
  data: IReferral;
}
export interface IGetStaffsResult extends IResponseData {
  data: IStaff[]
}

export interface IGetStaffResult extends IResponseData {
  data: IStaff
}

export interface ICreateStaffResult extends IResponseData {
  data: IStaff;
}

export interface IGetShowcaseResult extends IResponseData {
  data: {
    data: IShowcase[];
    total: number;
  }
}

export interface ICreateShowcaseResult extends IResponseData {
  data: IShowcase;
}

// export interface IMarkAllNotificationsAsReadResult extends IResponseData {
//   data: {
//     n: number,
//     nModified: number,
//     ok: number,
//   }
// }