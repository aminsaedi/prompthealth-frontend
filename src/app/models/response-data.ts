import { IUserDetail } from "./user-detail";

export interface IResponseData {
  statusCode: number;
  message: string;
  data: any;
}

export interface IGetProfileResult extends IResponseData{
  data: IUserDetail[];
}

export interface IGetPractitionersResult extends IResponseData {
  data: {
    userId: string,
    userData: IUserDetail,
    ans: {
      _id: string,
      item_text: string,
      subans: boolean,
    }[],
  }[]
}