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
 * Her brief of 2026-10-07: Pro is priced as "$149/month per clinic" and
 * nothing else, wherever it is priced. The yearly plan is offered only at
 * checkout, in the plan choice on /pro (pro-copy.ts), so the yearly figure
 * lives there and nowhere on this side of it. Pro and Growth both carry
 * "For Dental Clinics" where they are offered, so a physio or naturopath does
 * not sign up by mistake.
 *
 * Kept out of growth-landing/ and pro/: the sitemap dates those pages by the
 * last change under their directories, and this is not only their text.
 */

export const PRO_PRICE = {
  monthly: '$149/month per clinic',
};

/* The label on every Pro and Growth offer (her brief, 2026-10-07). */
export const FOR_DENTAL_CLINICS = 'For Dental Clinics';

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
  /* A badge above everything else on the card, for an offer that is not for
   * every practitioner. */
  badge?: string;
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
  badge: FOR_DENTAL_CLINICS,
  label: 'PAID MEMBERSHIP',
  name: 'PromptHealth Pro',
  price: PRO_PRICE.monthly,
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

/* The dark panel, as her brief of 2026-10-07 rewrites it: the
 * behind-the-scenes photo from /for-dentists and the Apply button in the left
 * column, five points on the right. The old main button ("Currently available
 * for dentists. See how it works") is gone, because the eyebrow now says who
 * Growth is for and the button she asked for is Apply. The path to
 * /for-dentists it carried stays, as a quieter link under Apply. */
export const GROWTH_PANEL = {
  label: 'DONE-FOR-YOU · BY APPLICATION · FOR DENTAL CLINICS',
  name: 'PromptHealth Growth',
  heading: 'Patients Who Feel Like They Already Know You',
  description: 'We film, edit and run your content, with Hedieh guiding you and your team at every step.',
  /* The top of the /for-dentists hero video's poster, Hedieh directing a
   * shoot at a practice, cut above the figures laid over the frame. */
  photo: {
    src: '/assets/img/offer/growth-behind-the-scenes.v1.webp',
    alt: 'Hedieh Safiyari directing a video shoot at a practice',
    width: 576,
    height: 548,
  },
  bullets: [
    { lead: 'Nothing to organize:', text: 'we plan, script and film at your practice every three months.' },
    { lead: 'Confident on camera:', text: 'personal coaching for you and your team at every shoot.' },
    { lead: '4 videos a month,', text: 'posted for you on Instagram and your Google Business Profile.' },
    { lead: 'Extra reach:', text: "shared with PromptHealth's 21,000+ Instagram followers." },
    { lead: 'New patients nearby:', text: 'your best video runs as a local Meta ad, with a monthly report on reach, views, messages and calls.' },
  ],
  availability: 'No contract. In-person filming in Greater Vancouver; remote option with an AI video clone elsewhere.',
  applyButton: 'Apply for Growth →',
  howItWorks: 'See how it works',
  link: '/for-dentists',
  waitlist: 'Not a dentist? Join the waitlist →',
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
