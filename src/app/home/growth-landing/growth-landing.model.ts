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
    /** Small capitals above the heading. */
    eyebrow?: string;
    heading: string;
    text: string;
    video: IGrowthVideo;
  };
  /** Right after the hero: who is behind the offer, with her photo. */
  meet?: {
    heading: string;
    text: string;
    photo: { src: string; alt: string; width: number; height: number };
  };
  whyUs: {
    heading: string;
    points: { title: string; text: string }[];
  };
  work: {
    heading: string;
    text: string;
    /** `title` names the player for screen readers; `caption` is the short
     *  topic line shown under the thumbnail. */
    videos: { id: string; title: string; caption: string }[];
    moreLabel: string;
    moreUrl: string;
  };
  /** Do it yourself or done for you, side by side, straight after the hero
   *  (her briefs of 2026-10-08 and 2026-10-09). A card without a link opens the
   *  strategy call form; one with a link goes there. Under the cards, the free
   *  profile as the way to start: the sentence is split around the words that
   *  link to it, and the button follows. */
  choice?: {
    heading: string;
    label?: string;
    cards: IGrowthChoiceCard[];
    freeProfile?: {
      before: string;
      linkText: string;
      after: string;
      button: string;
      link: string;
    };
  };
  /** Under the How It Works heading, above Step 1. */
  stepsIntro?: string;
  steps: IGrowthStep[];
  /** The contract line, under the steps. */
  stepsFootnote: string;
  /** A smaller line after the contract line. */
  stepsFootnoteSmall?: string;
  /** Section headings. Her first copy gave these sections none, and they were
   *  for screen readers only; offer v2 (2026-10) names both, so they show. */
  headings: {
    howItWorks: string;
    faq: string;
  };
  /** A slim strip above the FAQ pointing to another page: secondary, never
   *  a pricing card. */
  linkBand?: {
    text: string;
    button: string;
    link: string;
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

export interface IGrowthChoiceCard {
  name: string;
  /** The badge above the name. */
  label: string;
  description: string;
  /** Shown for Pro, whose price is public; Growth's never is. */
  price?: string;
  button: string;
  /** Absent: the button opens the booking form. */
  link?: string;
  queryParams?: { [key: string]: string };
  /** A small line under the button that opens the application form for Pro,
   *  for a practitioner who is not a dentist. */
  applyPro?: string;
}

export interface IGrowthStep {
  title: string;
  intro: string;
  items: { lead?: string; text: string }[];
  /** Equal tiles under the points, side by side from tablet width, in the
   *  order given: the production options in Step 1. */
  options?: { heading: string; area: string; text: string }[];
  /** A small line under the tiles. */
  optionsNote?: string;
  note?: string;
}

/* The strategy call form (her brief of 2026-10-09, update 4), which replaced
 * the consultation booking: no calendar, no automatic booking. The request
 * is saved and emailed to info@, and she follows up. */
export interface IGrowthBooking {
  formHeading: string;
  description: string;
  labels: IGrowthBookingText;
  /** Shown beside a label for a field that may be left empty. */
  optionalLabel: string;
  validation: IGrowthBookingText;
  submit: string;
  /** Under the submit button; `link` is the words linked to `path`. */
  privacy: { before: string; link: string; after: string; path: string };
  /** Replaces the form once the request is saved. */
  thanks: string;
  errorGeneric: string;
}

export type GrowthBookingField = 'firstName' | 'lastName' | 'practiceName' | 'email' | 'phone' | 'preferredTime';

export type IGrowthBookingText = { [field in GrowthBookingField]: string };

/* Which button opened the form. Stored with the request, so she can see which
 * part of the page does the persuading. 'direct' is a link or a reload that
 * lands on the open form without a button, which is how /plans and
 * /for-practitioners reach it. The backend accepts exactly these. The hero's
 * button, removed on 2026-10-08, is back since her brief of 2026-10-09, so
 * 'hero', 'steps' (the Growth card in "Two Ways to Work With Us", a name kept
 * from a button removed on 2026-09-27 so the backend's list did not have to
 * change) and 'final' are the three on the page. 'sticky' stays because
 * stored requests and old addresses carry it. */
export type GrowthCtaPosition = 'hero' | 'steps' | 'final' | 'sticky' | 'direct';

const CTA_POSITIONS: GrowthCtaPosition[] = ['hero', 'steps', 'final', 'sticky', 'direct'];

export function isGrowthCtaPosition(value: any): value is GrowthCtaPosition {
  return CTA_POSITIONS.indexOf(value) >= 0;
}
