import { IFAQItem } from '../_elements/faq-item/faq-item.component';
import { FOR_DENTAL_CLINICS, PRO_PRICE } from '../_elements/offer/offer-copy';

/*
 * /pro, Hedieh's section 5, and the membership screens of section 12, as she
 * wrote them (PromptHealth_1_Copy.docx, 2026-10-04) with straight quotes for
 * her curly ones. Kept apart from the component so the words can be checked
 * against her file in one place.
 *
 * The hero, the three cards, the testimonial, the price block, the two new
 * questions and the welcome line are her brief of 2026-10-07 (plan-specs/
 * source/brief-2026-10-07/brief.txt), section 1.
 */

export const PRO_PAGE = {
  seo: {
    title: 'PromptHealth Pro: Weekly Video and Post Ideas for Dental Clinics',
    description: 'A new video idea and post idea for your dental team every week, with filming instructions and examples. $149/month per clinic. Cancel anytime.',
  },
  hero: {
    eyebrow: 'PromptHealth Pro · For Dental Clinics',
    heading: 'Never Wonder What Your Practice Should Film Again',
    text: 'Every week, Hedieh gives your team one video idea and one post idea, based on what works across 400+ dental videos. We tell you exactly what to film. Your team films it.',
    bold: 'One video. One post. Done.',
    small: `${PRO_PRICE.monthly}. Includes a live group training every three months.`,
    /* Her Week 1 instructional video. Swap the id when she sends a newer
     * sample. */
    video: {
      id: 'Xp5oEO7qJys',
      title: 'A sample week of PromptHealth Pro',
      label: 'See a sample week',
    },
  },
  joinButton: 'Join PromptHealth Pro',
  upgradeButton: 'Upgrade to Pro',
  comingSoon: 'Coming soon',
  memberButton: "Go to the Members' Library",
  cardsHeading: 'What Your Team Gets',
  /* Three cards, the first larger. "New additions to the members' library"
   * is gone: members unlock a new week every 7 days now, not a monthly batch. */
  cards: [
    {
      heading: 'Every week',
      highlighted: true,
      items: [
        'One video idea, with a short video from Hedieh showing exactly what to film',
        'One post idea, with a ready-to-use Canva template',
      ],
    },
    {
      heading: 'As things change',
      highlighted: false,
      items: [
        "Trend alerts, so your team can jump on a trend while it's current",
        `A monthly "what's working now" update on the hooks and formats performing best`,
      ],
    },
    {
      heading: 'Every three months',
      highlighted: false,
      items: [
        "A live group training with Hedieh Safiyari, a creator with 1.7 million followers: video reviews and Q&A. Can't make it? Every session is recorded.",
      ],
    },
  ],
  /* Shown at the end of the third card when the API names the next session. */
  nextSessionPrefix: 'Next session:',
  price: {
    label: FOR_DENTAL_CLINICS,
    heading: PRO_PRICE.monthly,
    text: 'Your whole team is included. Cancel anytime. Prices in CAD, plus tax.',
  },
  faqHeading: 'FAQ',
};

/* One quote under the cards. The attribution is its own constant so a name
 * and company can be added without touching the quote. */
export const PRO_TESTIMONIAL_QUOTE = "Our team felt really empowered by Hedieh's live training sessions. They looked forward to every one, and they started posting videos and posts on their own afterward.";
export const PRO_TESTIMONIAL_ATTRIBUTION = 'Regional Manager, multi-location dental group';

/* "Apply" opens the application on this page, for Pro (her brief of
 * 2026-10-08: other practitioners apply for Pro, and a dentist who does is
 * offered the plan choice): the FAQ catches a click on its link by the
 * address (ProComponent.onFaqClick). Not a data- attribute, which Angular's
 * sanitizer strips from the answer's HTML. */
export const PRO_FAQ: IFAQItem[] = [
  {
    q: 'What happens after I join?',
    a: "Your first week arrives right away: one video idea and one post idea. A new week unlocks every 7 days after that, by email and in your members' library.",
    opened: false,
  },
  {
    q: 'Do I get all the past content when I join?',
    a: 'Everyone starts at Week 1 and moves through the weeks in order, so your team builds up step by step instead of facing a pile of ideas at once.',
    opened: false,
  },
  {
    q: 'Who is PromptHealth Pro for?',
    a: "It's currently for dental clinics whose team wants to make its own videos. If you'd rather we film and produce for you, see <a href=\"/for-dentists\">PromptHealth Growth</a>. Another type of healthcare professional? <a href=\"/pro?modal=growth-apply&interest=pro\">Apply for Pro</a> and let us know you're interested.",
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

/* 12.1. The one place the yearly plan is offered (her brief of 2026-10-07:
 * the annual option appears at checkout only). */
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
  text: "Your first week is ready now: check your email and the members' library.",
  button: "Go to the Members' Library",
};

/* 12.3 */
export const UPGRADE_BANNER = {
  text: 'Want your team to know exactly what to post every week? Upgrade to PromptHealth Pro.',
  button: 'Upgrade to Pro',
};
