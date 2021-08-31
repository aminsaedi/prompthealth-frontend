import { environment } from "src/environments/environment";

export interface ISocialNotification {
  _id: string;
  title?: string;
  body?: string;
  userId?: string;
  isDeleted?: boolean;
  isRead?: boolean;
  image?: string;
  link?: string;
  iOSLink?: string;
  androidLink?: string;
  createdAt?: string | Date;

  markAsRead?(): void;
  markAsUnread?(): void;
}

export class SocialNotification implements ISocialNotification{
  get _id() {return this.data._id; }
  get title() { return this.data.title; }
  get body() { return this.data.body; }
  get userId() { return this.data.userId; }
  get isRead() { return this.data.isRead; }
  get image() { return this._s3 + this.data.image; }
  get link() { return this.data.link; }
  get createdAt() { return this.data.createdAt; }

  private _s3 = environment.config.AWS_S3;

  constructor(private data: ISocialNotification) {}

  markAsRead() {
    this.data.isRead = true;
  }

  markAsUnread() {
    this.data.isRead = false;
  }
}