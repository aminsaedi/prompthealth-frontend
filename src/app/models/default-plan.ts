export type PlanTypePractitioner = 'basic' | 'provider' | 'centre';
export type PlanTypeProduct = 'productBasic' | 'productCustom';
export type PlanType = PlanTypePractitioner | PlanTypeProduct;

export interface IPlanData {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  label: string;
  data: IDefaultPlan;
}

export interface IPlanFeatureData {
  item: string;
  targetPlan: PlanType[];
  detail: string;
}

/** default plan data type fetched from server by calling the api 'user/get-plans' */
export interface IDefaultPlan {
  _id: string;
  name: string;
  planName: string;
  price: number;
  yearlyPrice: number;
  usPrice: number;
  usYearlyPrice: number;
  userType: string[];
  status: boolean;
  isDeleted: boolean;
  isMonthly: boolean;
  affiliatePlan: boolean;

  ListAmenities: boolean;
  ListOfProviders: boolean;
  ListProductsOption: boolean;
  ListYourTypeOfCenterAndDifferentLocations: boolean;
  addressURLLogoPicture: boolean;
  performanceDashboard: boolean;
  professionalProfile: boolean;
  receiveMessagesForBooking: boolean;
  reviewsAndFeedback: boolean;
  videoUpload: boolean;
  sideBySideComparisons: boolean;
  socialMediaLink: boolean;
  verifiedBadge: boolean;
  featuredOnHomePage: boolean;

  isDefault: true;
  stripePriceId: string;
  stripeUSPriceId: string;
  stripeProductId: string;
  stripeYearlyPriceId: string;
  stripeUSYearlyPriceId: string;
  striperesponse: any;
  currency: string;
}
