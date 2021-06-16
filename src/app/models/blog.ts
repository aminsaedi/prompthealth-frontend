export interface IBlog {
  categoryId: string;
  createdAt: string; /** could be Date? */
  description: string;
  image: string;
  isDeleted?: boolean; /** not used in frontend */
  slug: string;
  status?: boolean;
  title: string;
  _id?: string;
}

export class Blog implements IBlog {
  
  get categoryId() { return this.data.categoryId; }
  get createdAt() { return this.data.createdAt; }
  get description() { return this.data.description; }
  get image() { return this.data.image; }
  get slug() { return this.data.slug; }
  get title() { return this.data.title; }
  get _id() { return this.data._id; }
  get summary() { return this._summary; }

  private _summary: string;
  
  constructor(private data: IBlog) {
    this._summary = data.description.replace(/<[^>]*>?/gm, '');
  }
}