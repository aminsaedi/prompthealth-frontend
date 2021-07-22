import { IUserDetail } from "./user-detail";

export interface IResponseData {
  statusCode: number;
  message: string;
  data: any;
}

export interface IGetProfileResult extends IResponseData{
  data: IUserDetail[];
}