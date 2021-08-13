import { IDefaultPlan } from "./default-plan";
import { IUserDetail } from "./user-detail";

export interface IResponseData {
  statusCode: number;
  message: string;
  data: any;
}

export interface IGetProfileResult extends IResponseData{
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

export interface IGetPlansResult extends IResponseData {
  data: IDefaultPlan[]
}

export interface IGetFollowingsResult extends IResponseData {
  data: IUserDetail[];
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

export interface IUnfollowResult extends IResponseData {
  data: {
    deleted: boolean;
  }
}

export interface IContentCreateResult extends IResponseData {
  data: {

  }
}

export interface IUploadMultipleImagesResult extends IResponseData {
  data: string[];
}

export interface IUploadImageResult extends IResponseData {
  data: string;
}