import { IAddonPlan } from "./addon-plan";
import { IDefaultPlan } from "./default-plan";

/** user data type fetched from server by calling the api 'user/get-profile | partner/get | user/filter | partner/get-all */
export interface IUserDetail {
  /** general */
  _id?: string;
  userId?: string;
  roles?: 'U' | 'SP' | 'C' | 'P' | 'SA';

  firstName?: string;
  lastName?: string;
  fname?: string;
  lname?: string;
  profileImage?: string;
  email?: string;
  displayEmail?: string;
  address?: string;
  city?: string
  state?: string;
  zipcode?: string;
  location?: number[]; /** [lng, lat] */
  placeId?: string; /** google place id */
  
  phone?: string;

  isApproved?: boolean;
  isDeleted?: boolean;
  isLicensed?: boolean;
  isTestAccount?: boolean;
  status?: boolean;
  isVipAffiliateUser?: boolean;

  accredited_provide_canada?: boolean;
  t_c?: boolean;
  hear_from?: string;
  
  customer_health?: string[];
  services?: string[];

  /** for U | SP */
  gender?: string;

  /** for C */
  business_kind?: string;

  /** for SP | C */
  age_range?: string[];
  favouriteBy?: string[];
  hideAddress?: boolean;
  languages?: string[];
  professional_title?: string;
  ratingAvg?: number;
  ratingBy?: string[];
  serviceOfferIds?: string[];
  verifiedBadge?: boolean;
  typical_hours?: string[];
  bookingURL?: string;
  calcDistance?: number;
  provideVirtual?: boolean;
  years_of_experience?: string;
  professional_organization?: string;
  certification?: string;
  exactPricing?: number;
  price_per_hours?: string;



  /** for SP | C | P */
  product_description?: string; /** practicePhilosophy */
  description?: string; /** partner description | description of professional belonging at centre */
  website?: string;
  viewCount?: number;
  isVerified?: string; /** Y |  */
  questionnaireCompleted?: boolean;
  // date_verified?: string;


  /** for P */
  messageToPlatform?: string; 
  isFree?: boolean;
  priceLevel?: number;
  price1?: number;
  price2?: number;
  signupURL?: string;
  couponLink?: string;
  freeSampleLink?: string;
  affiliateLink?: string;
  phListedLink?: string;
  trialLink?: string;

  /** for P | professionals at C (subscriber) */
  image?: string[] /** used for product images of partner */ | string /** used for professionals belonging at centre */;


  /** for subscriber */
  plan?: IDefaultPlan;
  addOnPlans?: IAddonPlan[];

  videos?: IVideo[];

  socialLinks?: {_id: string, link: string, type: string}[];
  facebookClickCount?: number;
  instagramClickCount?: number;
  linkedinClickCount?: number;
  twitterClickCount?: number;
  tiktokClickCount?: number;
  youtubeClickCount?: number;

  isPlanExpired?: boolean;
  paymentMethod?: string[];

  /** not used in front end? */
  // exp_date?: any;

  /** points info */
  // refererencePointEarned?: number;
  // trendingPoints?: number;
  // pointEarned?: number;

  /** login info (not used in front end) */
  // socialToken?: string;
  // social_id?: string;
  // lastLogin?: string;
  // loginType?: string;
  // date_registered?: string;
}


export interface IVideo {
  _id: string;
  title: string;
  url: string;
}
