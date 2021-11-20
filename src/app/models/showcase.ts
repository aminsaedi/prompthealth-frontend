import { environment } from "src/environments/environment";

export interface IShowcase {
  _id?: string;
  defaultImage?: string;
  images?: string[];
  description?: string;
  price?: number;
  title?: string;
  userId?: string;

  decode?: () => IShowcase;
  updateWith?: (data: IShowcase) => void;
}

export class Showcase implements IShowcase {

  get _id() { return this.data._id; }
  get defaultImage() { return this.images?.length > 0 ? this._s3 + this.images[0] + '?ver=2.3' : null; }
  get images() { return this.data.images; }
  get description() { return this.data.description; }
  get title() { return this.data.title; }
  get price() {return this.data.price; }

  private _s3 = environment.config.AWS_S3;

  constructor(private data: IShowcase) {
  }

  decode() { return this.data; }

  updateWith(data: IShowcase) {
    this.data = data;  
  }
}