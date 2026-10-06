import { IFAQItem } from '../_elements/faq-item/faq-item.component';
import { PRO_PRICE } from '../_elements/offer/offer-copy';

/*
 * /pro, Hedieh's section 5, and the membership screens of section 12, as she
 * wrote them (PromptHealth_1_Copy.docx, 2026-10-04) with straight quotes for
 * her curly ones. Kept apart from the component so the words can be checked
 * against her file in one place.
 */

export const PRO_PAGE = {
  seo: {
    title: 'PromptHealth Pro: Weekly Video and Post Ideas for Dental Clinics',
    description: 'A new video idea and post idea for your dental team every week, with filming instructions and examples. $149/month per clinic. Cancel anytime.',
  },
  hero: {
    heading: 'Never Wonder What Your Practice Should Film Again',
    text: 'PromptHealth Pro gives your team a new video idea and post idea at the start of every week, based on what works across 400+ dental videos. We tell you exactly what to film. Your team films it.',
  },
  joinButton: 'Join PromptHealth Pro',
  upgradeButton: 'Upgrade to Pro',
  comingSoon: 'Coming soon',
  memberButton: "Go to the Members' Library",
  rhythm: [
    {
      heading: 'At the start of every week',
      items: [
        'One video idea for your team to film that week, with filming instructions anyone can follow on a phone and a sample video showing how to make it',
        'One post idea for an image or graphic post, with an example showing how it should look',
      ],
    },
    {
      heading: 'Whenever a new trend appears',
      items: ["A trend alert, so your team can jump on it while it's current"],
    },
    {
      heading: 'Every month',
      items: [
        `A "what's working now" update: the hooks and formats performing best right now`,
        "New additions to the members' library",
      ],
    },
    {
      heading: 'Every three months',
      items: [
        "A live session with founder Hedieh Safiyari, a creator with 1.7 million followers: video reviews and Q&A. Can't make it? Every session is recorded.",
      ],
    },
  ],
  price: {
    heading: 'Price',
    text: `${PRO_PRICE.line}. Your whole team is included. Cancel anytime. Prices in CAD.`,
  },
  faqHeading: 'FAQ',
};

/* "Apply" opens the Growth application on this page: the FAQ catches a click
 * on its link by the address (ProComponent.onFaqClick). Not a data- attribute,
 * which Angular's sanitizer strips from the answer's HTML. */
export const PRO_FAQ: IFAQItem[] = [
  {
    q: 'Who is PromptHealth Pro for?',
    a: "It's currently for dental clinics whose team wants to make its own videos. If you'd rather we film and produce for you, see <a href=\"/for-dentists\">PromptHealth Growth</a>. Another type of healthcare professional? <a href=\"/pro?modal=growth-apply\">Apply</a> and let us know you're interested.",
    opened: false,
  },
  {
    q: 'How much time does it take?',
    a: 'Everything is planned for you, so filming fits into a normal clinic week.',
    opened: false,
  },
  {
    q: 'Do we need special equipment?',
    a: 'No. A phone is enough.',
    opened: false,
  },
  {
    q: 'How many people on our team can use it?',
    a: 'Your whole team, for one price per clinic.',
    opened: false,
  },
  {
    q: 'Can we cancel?',
    a: 'Yes, anytime. Monthly plans stop at the end of the current month.',
    opened: false,
  },
];

/* 12.1 */
export const PLAN_CHOICE = {
  heading: 'Choose Your PromptHealth Pro Plan',
  options: [
    { interval: 'month' as const, name: 'Monthly', price: PRO_PRICE.monthly, note: 'Cancel anytime' },
    { interval: 'year' as const, name: 'Yearly', price: '$1,490/year per clinic', note: 'Two months free' },
  ],
  button: 'Continue to Payment',
  small: 'Payments are processed securely by Stripe. Prices in CAD, plus applicable taxes.',
};

/* 12.2 */
export const WELCOME = {
  heading: 'Welcome to PromptHealth Pro!',
  text: "You're in. Your team's first video and post ideas arrive at the start of next week. In the meantime, explore the members' library.",
  button: "Go to the Members' Library",
};

/* 12.3 */
export const UPGRADE_BANNER = {
  text: 'Want your team to know exactly what to post every week? Upgrade to PromptHealth Pro.',
  button: 'Upgrade to Pro',
};
