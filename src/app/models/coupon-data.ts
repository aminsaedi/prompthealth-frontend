export interface ICouponData {
  id: string,
  amount_off: number;
  currency: string,
  duration: 'once' | 'repeating' | 'forever';
  duration_in_months: number,
  name: string;
  object: 'coupon',
  percent_off: number;
  times_redeemed: number;
  valid: boolean;
  metadata: {
    logo: string;
    message: string;
    roles: string;
  };
}