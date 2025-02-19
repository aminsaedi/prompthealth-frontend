import { Booking, IBooking } from "./booking";
import { IDefaultPlan } from "./default-plan";
import { Profile } from "./profile";
import { IReferral, Referral } from "./referral";
import { SocialArticle } from "./social-article";
import { SocialEvent } from "./social-event";
import { SocialNote } from "./social-note";
import { ISocialPost, SocialPostBase } from "./social-post";
import { IUserDetail } from "./user-detail";

export interface IMyProfile {

  email: IUserDetail['email'];
  coverImage: string;

  plan: IDefaultPlan;

  viewCount: number;
  followingTopics: any[];

  isApproved: boolean;
  isEligibleToCreateNote: boolean;
  isEligibleToCreatePromo: boolean;
  isEligibleToCreateArticle: boolean;
  isEligibleToCreateEvent: boolean;
  isEligibleToHaveDraft: boolean;
  eligibleToRecommend: boolean;
  eligibleToManageBookings: boolean;
  eligibleToSeePerformance: boolean;
  isEligibleToSeePremiumAcademy: boolean;


  bookmarks: ISocialPost[];
  isBookmarksChanged: boolean;
  setBookmarks(posts: ISocialPost[]): void;
  setBookmark(post: ISocialPost): void;
  removeBookmark(post: ISocialPost): void;
  markAsBookmarkChanged(): void;
  disposeBookmarks(): void;

  bookingsAsClient: Booking[];
  bookingsAsProvider: Booking[];
  setBookingsAsClient(bookings: IBooking[]): void;
  setBookingAsClient(booking: IBooking): void;

  recommendationsByMe: Referral[];
  doneInitRecommendationsByMe: boolean;
  setRecommendationsByMe(recomemendations: IReferral[]): void;
  setRecommendationByMe(recommendation: IReferral): void;
}

export class MyProfile extends Profile implements IMyProfile {

  get email() { return this.data.email || ''; }
  get coverImage() { return this.data.cover ? this._s3 + this.data.cover + '?ver=2.3' : ''; }

  get viewCount() { return this.isU || !this.isPaid ? 0 : this.data.viewCount; }
  get followingTopics() { return this._followingTopics; }

  get isApproved() { return this.isU || this.isSA || this.data.isApproved; }
  get isEligibleToCreateNote() { return this.isProvider || this.isSA; }
  get isEligibleToSeePremiumAcademy() { return this.isPaid || this.isSA; }
  get isEligibleToCreatePromo() { return this.isP; }
  get isEligibleToCreateArticle() { return (this.isProvider) || this.isSA; }
  get isEligibleToCreateEvent() { return (!this.isU) || this.isSA; }
  get isEligibleToHaveDraft() { return this.isEligibleToCreateArticle || this.isEligibleToCreateEvent; }

  get eligibleToManageBookings() { return this.isProvider; }
  get eligibleToSeePerformance() { return (this.isProvider) || this.isSA; }
  get eligibleToRecommend() {
    return this.isSA ?
      true :
      (this.isProvider || this.isP) && this.isApproved ?
        true :
        false;
  }

  get bookmarks() { return this._bookmarks; }
  get isBookmarksChanged() { return this._isBookmarksChanged; }

  get bookingsAsClient() { return this._bookingsAsClient; }
  get bookingsAsProvider() { return this._bookingsAsPractitioner; }

  get recommendationsByMe() { return this._recommendationsByMe || []; }
  get doneInitRecommendationsByMe() { return !!this._recommendationsByMe; }


  get plan() { return this.data.plan || null; }

  private _followingTopics: IMyProfile['followingTopics'] = null;

  private _bookmarks: ISocialPost[] = null;
  private _isBookmarksChanged: boolean = false;
  private _bookingsAsClient: any = null;
  private _bookingsAsPractitioner: any = null;
  private _recommendationsByMe: Referral[] = null;


  constructor(protected data: IUserDetail) {
    super(data);
  }

  setFollowingTopics(topics: string[]) {
    if (!this._followingTopics) {
      this._followingTopics = [];
    }
    topics.forEach(t => {
      this._followingTopics.push(t);
    })
  };

  setBookmarks(posts: ISocialPost[]) {
    if (!this._bookmarks) {
      this._bookmarks = [];
    }
    posts.forEach(post => {
      this.setBookmark(post);
    });
  }

  setBookmark(post: ISocialPost) {
    if (!this._bookmarks) {
      this._bookmarks = [];
    }

    this._bookmarks.push(
      post.contentType == 'NOTE' ? new SocialNote(post) :
        post.contentType == 'ARTICLE' ? new SocialArticle(post) :
          post.contentType == 'EVENT' ? new SocialEvent(post) :
            new SocialPostBase(post)
    )
  }

  removeBookmark(post: ISocialPost) {
    const idx = this._bookmarks.findIndex(item => item._id == post._id);
    this._bookmarks.splice(idx, 1);
  }

  markAsBookmarkChanged() {
    this._isBookmarksChanged = true;
  }

  disposeBookmarks() {
    this._bookmarks = null;
    this._isBookmarksChanged = false;
  }

  setBookingsAsClient(bookings: IBooking[]) {
    if (!this._bookingsAsClient) {
      this._bookingsAsClient = [];
    }
    bookings.forEach(b => {
      this.setBookingAsClient(b);
    });
  }

  setBookingAsClient(booking: IBooking) {
    if (!this._bookingsAsClient) {
      this._bookingsAsClient = [];
    }
    this._bookingsAsClient.push(new Booking(booking));
  }

  setRecommendationsByMe(recommendations: IReferral[]) {
    if (!this._recommendationsByMe) {
      this._recommendationsByMe = [];
    }
    recommendations.forEach(r => {
      this.setRecommendationByMe(r);
    });
  }

  setRecommendationByMe(recommendation: IReferral) {
    if (!this._recommendationsByMe) {
      this._recommendationsByMe = [];
    }
    this._recommendationsByMe.push(new Referral(recommendation));
  }

  update(data: IUserDetail) {
    Object.keys(data).forEach(key => {
      if (key != '_id') {
        this.data[key] = data[key];
      }
    });
    super.initProfileImage();
  }
}