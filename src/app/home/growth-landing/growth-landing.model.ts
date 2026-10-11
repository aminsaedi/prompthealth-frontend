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
  /** Registry key. Also the `landing` sent with a strategy call request, and
   *  the suffix of every analytics label ('growth-' + key, key + '-hero'). */
  key: string;
  /** The page's address, which is also its canonical. */
  path: string;
  seo: IGrowthSeo;
  /** The sections the page shows, top to bottom. A section named here must
   *  have its config below; one not named is not rendered, whatever is set.
   *  Her brief of 2026-10-11 split /for-dentists into an overview and a
   *  Growth page of its own, in different orders from the same pieces. */
  sections: GrowthSection[];
  hero: {
    /** Small capitals above the heading. */
    eyebrow?: string;
    heading: string;
    text: string;
    /** Scrolls to a section of this page, never away from it. */
    button: IGrowthScrollButton;
    /** Absent: words only, which is lighter on a phone. */
    video?: IGrowthVideo;
  };
  /** Who is behind the offer, with her photo. Without a heading it is the
   *  photo and one line. */
  meet?: {
    heading?: string;
    text: string;
    photo: { src: string; alt: string; width: number; height: number };
    /*
     * A dentist's words about working with her, for the Growth page, when she
     * sends one (her brief of 2026-10-11, section 3). Leave it out until then:
     * nothing is rendered without it, and a quote is never written for her.
     */
    quote?: { text: string; attribution: string };
  };
  whyUs?: {
    heading: string;
    points: { title: string; text: string }[];
  };
  work?: {
    heading: string;
    text: string;
    /** `title` names the player for screen readers; `caption` is the short
     *  topic line shown under the thumbnail. */
    videos: { id: string; title: string; caption: string }[];
    moreLabel: string;
    moreUrl: string;
  };
  /** Do it yourself or done for you, side by side (her briefs of 2026-10-08,
   *  -09 and -11). Each card links to its own page. Under the cards, the free
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
  /** A plain list of what the service includes, in her words. */
  included?: {
    heading: string;
    items: string[];
  };
  /** Under the How It Works heading, above Step 1. */
  stepsIntro?: string;
  steps?: IGrowthStep[];
  /** The contract line, under the steps. */
  stepsFootnote?: string;
  /** A smaller line after the contract line. */
  stepsFootnoteSmall?: string;
  headings: {
    howItWorks?: string;
    faq?: string;
  };
  /** A slim strip above the FAQ pointing to another page: secondary, never
   *  a pricing card. */
  linkBand?: {
    text: string;
    button: string;
    link: string;
  };
  faq?: IFAQItem[];
  final?: {
    heading: string;
    text: string;
    button: IGrowthScrollButton;
  };
  /** One line above the inline form. */
  applyNote?: string;
  /** The strategy call form, written into the page under #apply. */
  booking?: IGrowthBooking;
  /** Where an old link to the strategy call modal (?modal=book-consultation)
   *  goes, on a page that no longer has the form: that page's #apply. */
  bookingMovedTo?: string;
}

export type GrowthSection =
  'hero' | 'choice' | 'meet' | 'whyUs' | 'work' | 'included' | 'steps' | 'linkBand' | 'faq' | 'final' | 'apply';

/** A button that moves the reader down the same page. `target` is the id of
 *  the section it scrolls to. */
export interface IGrowthScrollButton {
  label: string;
  target: string;
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
  /** Pro's badge is dark blue, Growth's yellow, so the two read apart. */
  tone: 'pro' | 'growth';
  description: string;
  /** Shown for Pro, whose price is public; Growth's never is. */
  price?: string;
  button: string;
  /** Each offer's own page (her brief of 2026-10-11): nothing on this page
   *  starts a payment or opens a form for either. */
  link: string;
  /** A small line under the button that opens the application form for Pro,
   *  for a practitioner who is not a dentist. */
  applyPro?: string;
}

export interface IGrowthStep {
  title: string;
  intro: string;
  items: { lead?: string; text: string }[];
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
 * part of the page does the persuading. The backend accepts exactly these.
 * 'page' is the form written into the Growth page (her brief of 2026-10-11),
 * which no button opens, and the only one any page sends now. The others name
 * the buttons that opened it as a modal on /for-dentists until then ('steps'
 * was the Growth card's, 'direct' a link straight to the open modal), and stay
 * because stored requests carry them. */
export type GrowthCtaPosition = 'hero' | 'steps' | 'final' | 'sticky' | 'direct' | 'page';
