import { IGrowthLanding } from '../growth-landing.model';
import { GROWTH_LANDING_PATHS } from './paths';
import { FREE_PROFILE, NOT_A_DENTIST_APPLY_FOR_PRO, PRO_PRICE } from '../../_elements/offer/offer-copy';

/*
 * /for-dentists, the first growth landing.
 *
 * Every string here is Hedieh's. The hero, How It Works, the link band, the
 * FAQ, the closing line and the title and description are her offer v2 copy
 * (2026-10-04, plan-specs/source/offer-v2/PromptHealth_1_Copy.txt, sections
 * 6 to 11) with straight quotes for her curly ones; the rest is her
 * Website-Copy-FINAL (plan-specs/growth/dentists-landing-copy.json). The
 * advertising answer states the $500 to $1,000 she recommends: since offer v2
 * the site shows prices again, except Growth's own. The booking form's text
 * is ours.
 *
 * Her brief of 2026-10-07 adds the hero's eyebrow, Meet Hedieh, the six short
 * Step 1 points, a caption under each video, the two questions at the top of
 * the FAQ and "Two Ways to Work With Us" (plan-specs/source/
 * brief-2026-10-07/brief.txt, section 1). Her brief of 2026-10-08 (section 1)
 * moves "Two Ways to Work With Us" up to follow the hero, takes the booking
 * button out of the hero so it appears only with Growth, has Pro's card say
 * "Join PromptHealth Pro" with "Not a dentist? Apply for Pro." under it, and
 * offers the free profile under both, as the way to start before Pro.
 *
 * Her brief of 2026-10-09 (plan-specs/source/brief-2026-10-09/brief.txt)
 * repositions Growth: personalized video, made with AI-assisted production
 * anywhere or filmed at the practice in Greater Vancouver, rather than a
 * filming day every quarter. It rewrites the hero text, the title and
 * description, How It Works, the closing line and the FAQ, puts Pro first in
 * "Two Ways to Work With Us" with a badge on each card, brings the hero's
 * button back, and makes every Growth button "Book a Strategy Call", which
 * opens an inquiry form in place of the Calendly booking. Her copy is word for
 * word, with the house edits: a middle dot for the dash in each card's badge.
 *
 * The captions are ours, shortened from the videos' own titles; she asked for
 * the topic, and a clinic's name only where it has agreed to be named, so none
 * are named.
 *
 * The hero video is her own vertical cut, with the words already in the
 * picture.
 *
 * Her brief of 2026-10-11 (plan-specs/source/brief-2026-10-11/brief.txt,
 * section 1) makes this page the overview, because Pro and Growth each get an
 * ad of their own pointing at a page of their own: /pro, and Growth's at
 * /for-dentists/growth (dentists-growth.ts). The hero keeps its video. Its
 * button and the closing one become "Find the right option for your clinic",
 * which scrolls to the two cards. Each card's button is "Learn more", to its
 * own page: nothing here starts a payment or opens the strategy call form. The
 * clinic videos, the channel link and How It Works moved to the Growth page,
 * and the form with them; an old link to it here is sent there (bookingMovedTo,
 * and a 301 in server.ts).
 */
/* The hero's and the closing button (her brief of 2026-10-11): down to the
 * two cards, whose section is #options. */
const FIND_THE_RIGHT_OPTION = { label: 'Find the right option for your clinic', target: 'options' };

export const DENTISTS_LANDING: IGrowthLanding = {
  key: 'dentists',
  path: GROWTH_LANDING_PATHS.dentists,
  seo: {
    title: 'PromptHealth Growth for Dentists | Personalized Video & Local Ads',
    description: 'Personalized videos for dental practices, made with AI-assisted production or professional filming in Greater Vancouver, and promoted to people near you. Book a strategy call.',
    /* The share card is landscape, as every network crops to; the vertical
     * poster alone would be cut to a strip. */
    image: '/assets/img/share/for-dentists-share.v1.jpg',
    imageWidth: 1200,
    imageHeight: 630,
    imageType: 'image/jpeg',
    imageAlt: 'Hedieh Safiyari on set at a practice, with 1.7M followers and 400+ dental videos',
  },
  sections: ['hero', 'choice', 'meet', 'whyUs', 'linkBand', 'faq', 'final'],
  hero: {
    eyebrow: 'For Dental Practices',
    heading: 'Let Patients Get to Know You Before They Ever Book',
    text: 'We create personalized videos that show people near your practice who you are and why to trust you. Then we put your best video in front of them every month.',
    button: FIND_THE_RIGHT_OPTION,
    video: {
      src: 'https://prompt-images.s3.us-east-2.amazonaws.com/landing/for-dentists/hero-vertical-v2.mp4',
      poster: '/assets/video/for-dentists-hero-vertical-poster.v1.jpg',
      captions: '/assets/video/for-dentists-hero-vertical.v1.en.vtt',
      title: 'PromptHealth Growth, with Hedieh Safiyari',
      width: 576,
      height: 1024,
      captionsBurnedIn: true,
    },
  },
  meet: {
    heading: 'Meet Hedieh Safiyari',
    text: "Before building PromptHealth, Hedieh trained as a health practitioner and educator. She has since built an audience of 1.7 million and directed more than 400 videos inside dental practices. PromptHealth Growth is built on what she's learned about content that earns patients' trust.",
    /* The About page's portrait, the sharpest copy there is (588px), cut
     * inside its rounded corners. */
    photo: {
      src: '/assets/img/for-dentists/hedieh-safiyari.v1.webp',
      alt: 'Hedieh Safiyari, founder of PromptHealth',
      width: 544,
      height: 544,
    },
  },
  whyUs: {
    heading: "Creative That Works, From Someone Who's Made It Work",
    points: [
      {
        title: '400+ dental videos directed',
        text: "We've worked inside dental practices, with dentists and their teams, across dozens of clinics.",
      },
      {
        title: 'Millions of views',
        text: 'Individual videos have reached over 2.5 million people. We know what makes someone stop scrolling.',
      },
      {
        title: 'Built by a creator, not an ad buyer',
        text: 'Anyone can run ads. The hard part is finding the story that makes a patient trust you and pick up the phone.',
      },
    ],
  },
  choice: {
    heading: 'Two Ways to Work With Us',
    label: 'For Dental Clinics',
    /* Her brief of 2026-10-09: Pro first, the same size as Growth, and above
     * it on a phone. */
    cards: [
      {
        name: 'PromptHealth Pro',
        label: 'DIY · We Guide You',
        description: 'Weekly content ideas, ready-to-use templates, practical training, and ongoing guidance to help your team create and manage its own social media content.',
        tone: 'pro',
        price: PRO_PRICE.monthly,
        button: 'Learn more',
        link: '/pro',
        applyPro: NOT_A_DENTIST_APPLY_FOR_PRO,
      },
      {
        name: 'PromptHealth Growth',
        label: 'Done For You · We Handle It',
        tone: 'growth',
        description: 'From strategy and personalized video production to publishing and Meta advertising, we handle your content and marketing so you can focus on your patients.',
        button: 'Learn more',
        link: GROWTH_LANDING_PATHS['dentists-growth'],
      },
    ],
    /* Her brief of 2026-10-08: the path is a free profile first, then Pro
     * when a practice wants more. Her brief of 2026-10-09 approves the
     * sentence and links "free PromptHealth profile" to the registration. */
    freeProfile: {
      before: 'Not ready yet? Start with a ',
      linkText: 'free PromptHealth profile',
      after: ', then upgrade to Pro when you want more.',
      button: FREE_PROFILE.button,
      link: FREE_PROFILE.link,
    },
  },
  headings: {
    faq: 'Frequently Asked Questions',
  },
  linkBand: {
    text: 'Want your team to make its own content? Get a new video idea and post idea every week.',
    button: 'See PromptHealth Pro',
    link: '/pro',
  },
  /* Her brief of 2026-10-09, update 5: nine questions in this order. Three,
   * six and eight are kept as they were. */
  faq: [
    {
      q: "What's the difference between Growth and Pro?",
      a: 'Growth is done for you. We develop your content strategy, create your videos, publish them and manage your Meta advertising. Pro gives your team weekly guidance and ideas to create its own content.',
      opened: false,
    },
    {
      q: 'How much does PromptHealth Growth cost?',
      a: "Pricing depends on your practice, content needs and preferred production approach. We'll recommend the right solution during your strategy call.",
      opened: false,
    },
    {
      q: 'How much should we spend on advertising?',
      a: "Ad spend is paid directly to Meta and is separate from our fees. We recommend $500 to $1,000 a month so the results are meaningful, and we'll suggest the right budget for your area on the call.",
      opened: false,
    },
    {
      q: 'What results will we see?',
      a: "Every month you'll see how many people your videos reached, how many watched, and how many messaged or called. Your front desk asks new patients how they heard about you, so you can see which ones came from your videos. We don't promise a number of new patients, because that also depends on how your clinic follows up.",
      opened: false,
    },
    {
      q: 'Are we locked into a contract?',
      a: 'No long-term contract. Growth is billed in 3-month cycles, and you can cancel before your next cycle begins. We recommend allowing at least two cycles to evaluate content and advertising performance.',
      opened: false,
    },
    {
      q: 'Do we need to be on camera?',
      a: 'Not necessarily. We offer AI-assisted video production, available worldwide, so you can create personalized content without ongoing filming. For practices that prefer traditional video, we also offer professional on-site filming in Greater Vancouver.',
      opened: false,
    },
    {
      q: 'Will AI videos look and sound like us?',
      a: 'If you choose a personalized AI presenter, we can create videos using your approved digital likeness and voice. Alternatively, your practice can use a fictional virtual presenter. You review and approve all content before publication, and AI-generated presenters are clearly identified.',
      opened: false,
    },
    {
      q: 'Do you manage our social media or SEO?',
      a: "No. We focus on video. We publish your videos to your Instagram and Google Business Profile and show your team how to handle everyday posting. We don't do SEO, websites, or replies to comments and messages.",
      opened: false,
    },
    {
      q: 'Do we approve the videos?',
      a: 'Yes. Your practice reviews and approves every video and advertisement before publication. We ensure the content reflects your practice and follows applicable healthcare advertising standards. We keep content educational and accurate, without discounts, guarantees or patient testimonials in ads.',
      opened: false,
    },
  ],
  final: {
    heading: 'Great Healthcare Professionals Deserve to Be Seen, Heard and Trusted.',
    text: "Tell us about your practice, and we'll look at how patients find you today and whether PromptHealth Growth is the right fit.",
    button: FIND_THE_RIGHT_OPTION,
  },
  bookingMovedTo: GROWTH_LANDING_PATHS['dentists-growth'],
};
