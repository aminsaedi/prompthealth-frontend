import { IAddonPlan } from './addon-plan';
import { IDefaultPlan } from './default-plan';

export interface IStripeCheckoutData {
  cancel_url: string;
  success_url: string;
  userId: string;
  userType: string;
  email: string;
  plan: IAddonPlan | IDefaultPlan;
  isMonthly: boolean;
  type: string; /** default | addon */
  coupon?: string;
  metadata?: {
    _id?: string;
    userType?: ('SP' | 'C' | 'U' | 'P')[];
    item_text?: string;
    image?: string;
    color?: string;
  };
}
