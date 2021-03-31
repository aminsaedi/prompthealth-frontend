export interface IUserDetail {
  /** general */
  _id?: string;
  roles?: string; /** U | SP | C | P */

  firstName?: string;
  lastName?: string;
  profileImage?: string;
  email?: string;
  address?: string;
  city?: string
  state?: string;
  zipcode?: string;
  location?: number[]; /** [lat, lng] */
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

  /** for SP | C | P */
  services?: string[];
  product_description?: string;
  website?: string;
  viewCount?: number;
  isVerified?: string; /** Y |  */
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
  image?: string[];


  /** for subscriber */
  plan?: any;
  addOnPlans?: any;

  videos?: string[];

  socialLinks?: string[];
  facebookClickCount?: number;
  instagramClickCount?: number;
  linkedinClickCount?: number;
  twitterClickCount?: number;
  tiktokClickCount?: number;
  youtubeClickCount?: number;

  isPlanExpired?: boolean;
  paymentMethod?: string[];

  /** not used in front end? */
  // customer_health?: string[]
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
