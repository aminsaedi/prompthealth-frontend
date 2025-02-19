/** addon plan data type fetched from server by calling the api 'addonplans/get-all' */
export interface IAddonPlan {
  _id?: string;
  userType: ('SP' | 'P' | 'C' | 'U')[];
  name: string;
  description: string;
  price?: number;
  yearlyPrice?: number;
  stripePriceId?: string;
  stripeYearlyPriceId?: string;
  stripeProductId?: string;
  createdAt?: string;
  updatedAt?: string; 
  status?: boolean;
  isDeleted?: boolean;
}

export class AddonPlan {
}
