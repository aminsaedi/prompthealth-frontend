import { IFAQItem } from '../_elements/faq-item/faq-item.component';

/*
 * One growth landing: every word, video and address the template renders.
 *
 * The template (GrowthLandingComponent) holds no copy of its own, so a landing
 * for another practitioner type is a new config and a route line, never a new
 * component. Analytics labels are built from `key` and the video addresses come
 * from `hero.video`, which is what keeps a second landing from reporting as the
 * first.
 */
export interface IGrowthLanding {
  /** Registry key. Also the `landing` sent with a booking, and the suffix of
   *  every analytics label ('growth-' + key, key + '-hero'). */
  key: string;
  /** The page's address, which is also its canonical. */
  path: string;
  seo: IGrowthSeo;
  ctaLabel: string;
  hero: {
    heading: string;
    text: string;
    video: IGrowthVideo;
  };
  whyUs: {
    heading: string;
    points: { title: string; text: string }[];
  };
  work: {
    heading: string;
    text: string;
    videos: { id: string; title: string }[];
    moreLabel: string;
    moreUrl: string;
  };
  steps: IGrowthStep[];
  stepsFootnote: string;
  /** Headings for screen readers only. Her copy gives these sections no visible
   *  heading, and the outline would skip from H2 to H3 without them. */
  hiddenHeadings: {
    howItWorks: string;
    faq: string;
  };
  faq: IFAQItem[];
  final: {
    heading: string;
    text: string;
  };
  booking: IGrowthBooking;
}

export interface IGrowthSeo {
  title: string;
  description: string;
  /** Site-relative; made absolute when it is published. */
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageType: string;
  imageAlt: string;
}

export interface IGrowthVideo {
  /** The MP4 on S3, served immutable, so a new cut ships under a new name. */
  src: string;
  /** Same-origin, like the captions. */
  poster: string;
  /** Same-origin because the bucket sends no CORS headers without an Origin,
   *  and a cross-origin <track> needs them. */
  captions: string;
  title: string;
  /** The encoded frame size. The player reserves this shape before anything
   *  loads, and a taller-than-wide video gets the hero's portrait layout. */
  width: number;
  height: number;
  /** True when the words are part of the picture. The captions track is then
   *  offered in the player's menu but starts off, or every line would be
   *  on screen twice. */
  captionsBurnedIn: boolean;
}

export interface IGrowthStep {
  title: string;
  intro: string;
  items: { lead?: string; text: string }[];
  note?: string;
}

export interface IGrowthBooking {
  /** Empty until the 30-minute event exists. Empty means the form thanks the
   *  visitor and ends there; set means a scheduling step follows the form. */
  calendlyUrl: string;
  formHeading: string;
  labels: IGrowthBookingText;
  validation: IGrowthBookingText;
  submitWithCalendly: string;
  submitWithoutCalendly: string;
  thanksWithCalendly: string;
  thanksWithoutCalendly: string;
  /** Once a time is booked, above Calendly's own confirmation. */
  thanksScheduled: string;
  errorGeneric: string;
}

export type GrowthBookingField = 'name' | 'practiceName' | 'email' | 'phone' | 'city' | 'patientSource';

export type IGrowthBookingText = { [field in GrowthBookingField]: string };

/* Which button opened the booking form. Stored with the request, so she can see
 * which part of the page does the persuading. 'direct' is a link or a reload
 * that lands on the open form without a button. The backend accepts exactly
 * these. */
export type GrowthCtaPosition = 'hero' | 'steps' | 'final' | 'sticky' | 'direct';

const CTA_POSITIONS: GrowthCtaPosition[] = ['hero', 'steps', 'final', 'sticky', 'direct'];

export function isGrowthCtaPosition(value: any): value is GrowthCtaPosition {
  return CTA_POSITIONS.indexOf(value) >= 0;
}
