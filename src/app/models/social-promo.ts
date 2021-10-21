import { ISocialPost } from "./social-post";
import { SocialNote } from './social-note'

export class SocialPromo extends SocialNote implements ISocialPost {
  get promo() { return this.data.promo; }

  get availableUntil(): Date { return this.data.availableUntil ? new Date(this.data.availableUntil) : null; }
  get isAvailable() {
    const now = new Date();
    return this.data.availableUntil ? this.availableUntil.getTime() - now.getTime() > 0 : true;
  }

  get link() { return this.data.link || null; }

  constructor(protected data: ISocialPost) {
    super(data);
  }
}