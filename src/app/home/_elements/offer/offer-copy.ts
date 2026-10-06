/*
 * Hedieh's Offer v2 copy (2026-10-04, PromptHealth_1_Copy.docx): PromptHealth
 * Basic, PromptHealth Pro and PromptHealth Growth, wherever more than one page
 * shows them. The plan section is the same on /for-practitioners and /plans
 * (her section 2), and the paid-plan answer is on /for-practitioners and /faq,
 * so each is written once here. The source is kept in
 * plan-specs/source/offer-v2/; the only edit is the house one, straight quotes
 * for her curly ones.
 *
 * Prices are shown again by her decision, for Pro only. The Growth price is
 * never shown, and Growth's own text never mentions Pro (her checklist).
 *
 * Kept out of growth-landing/ and pro/: the sitemap dates those pages by the
 * last change under their directories, and this is not only their text.
 */

export const PRO_PRICE = {
  monthly: '$149/month per clinic',
  yearly: '$1,490/year',
  /* As her card and the /pro page write it. */
  line: '$149/month per clinic or $1,490/year (two months free)',
};

export const PLAN_SECTION = {
  heading: 'Choose How You Want to Grow',
  subheading: 'Join a membership and do it yourself, or apply for our done-for-you plan.',
  memberships: {
    heading: 'Memberships',
    line: 'Do it yourself, with our tools and guidance. Cancel anytime.',
  },
  doneForYou: {
    heading: 'Done-for-You Plan',
    line: 'We do it for you and your team. By application only.',
  },
};

export interface IMembershipCard {
  key: 'basic' | 'pro';
  label: string;
  name: string;
  price: string;
  description: string;
  bullets: { lead: string; text: string }[];
  note?: string;
  button: string;
  link: string;
}

export const BASIC_CARD: IMembershipCard = {
  key: 'basic',
  label: 'FREE MEMBERSHIP',
  name: 'PromptHealth Basic',
  price: 'Free',
  description: 'Get found online and give your team the basics.',
  bullets: [
    { lead: 'A provider profile on a trusted health platform:', text: 'a place for patients to find you online.' },
    { lead: 'Publish articles in the PromptHealth community:', text: "each article links back to your clinic's website, which can help your practice show up on Google and AI search." },
    { lead: 'Free training videos for your team:', text: 'the basics of social media and online presence.' },
  ],
  button: 'Create Free Profile',
  link: '/auth/registration/sp',
};

export const PRO_CARD: IMembershipCard = {
  key: 'pro',
  label: 'PAID MEMBERSHIP',
  name: 'PromptHealth Pro',
  price: PRO_PRICE.line,
  description: "Your team's weekly video playbook, with expert guidance. Your team never has to guess what to post again.",
  bullets: [
    { lead: 'Know exactly what to post every week:', text: 'one video idea and one post idea at the start of each week.' },
    { lead: 'See how to make it:', text: 'filming instructions and a sample video for every video idea, and an example for every post idea, so your team can follow along.' },
    { lead: 'Use what already works:', text: 'the best-performing hooks and formats from 400+ dental videos, updated every month.' },
    { lead: 'Stay current without the research:', text: 'trend alerts whenever a new trend is worth jumping on.' },
    { lead: 'Get expert feedback:', text: 'a live session every three months with founder Hedieh Safiyari, a creator with 1.7 million followers.' },
    { lead: "Build your whole team's confidence:", text: 'everyone on your team is included, so anyone can step in front of the camera.' },
    { lead: '', text: 'Everything in PromptHealth Basic.' },
  ],
  note: 'Currently for dental clinics.',
  button: 'See PromptHealth Pro',
  link: '/pro',
};

export const GROWTH_PANEL = {
  label: 'DONE-FOR-YOU PLAN · BY APPLICATION ONLY',
  name: 'PromptHealth Growth',
  heading: 'We Film and Produce for You and Your Team',
  description: 'For practices that want it done for them, with an expert guiding them at every step.',
  bullets: [
    { lead: 'Nothing for you to organize:', text: 'we handle the strategy, the scripts and the filming at your practice every three months.' },
    { lead: 'Look and sound confident on camera:', text: 'personal coaching for you and your team at every shoot.' },
    { lead: 'Fresh videos every month, posted for you:', text: '4 professionally edited videos, published to your Instagram and Google Business Profile.' },
    { lead: 'Extra reach on PromptHealth:', text: "your videos are shared as collaboration posts with PromptHealth's Instagram, followed by 21,000+ people interested in health." },
    { lead: 'Reach people near your practice:', text: 'each month, your best video runs as a Meta ad to people nearby, with tracking set up from day one.' },
    { lead: 'See what your videos are doing:', text: 'a monthly report on reach, views, messages and calls.' },
    { lead: '', text: 'No contract.' },
  ],
  availability: 'In-person filming for clinics in Greater Vancouver. Outside Greater Vancouver, we offer a remote option using an AI video clone.',
  button: 'Currently available for dentists. See how it works',
  link: '/for-dentists',
  lineUnderButton: "Other health practitioners: we're now taking applications.",
  applyButton: 'Apply',
};

/* Her section 4. The answer is HTML: faq-item renders it as such, and each
 * page's FAQPage JSON-LD strips the tags. */
export const PAID_PLAN_FAQ = {
  q: 'Is there a paid plan for practitioners?',
  aHtml: 'Yes. <a href="/pro">PromptHealth Pro</a> is our paid membership: your team gets a new video idea and post idea every week, for $149/month per clinic. <a href="/for-dentists">PromptHealth Growth</a> is our done-for-you plan, by application only, where we film and produce videos for you. Both are currently available for dental practices.',
};

/* For the plans' structured data. Pro carries its price; Growth never does. */
export const OFFER_CATALOG_ITEMS = [
  {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: BASIC_CARD.name,
      description: BASIC_CARD.description,
    },
    price: '0',
    priceCurrency: 'CAD',
  },
  {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: PRO_CARD.name,
      description: PRO_CARD.description,
      url: 'https://www.prompthealth.ca/pro',
    },
    price: '149.00',
    priceCurrency: 'CAD',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '149.00',
      priceCurrency: 'CAD',
      unitText: 'MONTH',
      valueAddedTaxIncluded: false,
    },
  },
  {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: GROWTH_PANEL.name,
      description: GROWTH_PANEL.description,
      url: 'https://www.prompthealth.ca/for-dentists',
    },
  },
];
