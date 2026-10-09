import { IGrowthLanding } from '../growth-landing.model';
import { GROWTH_LANDING_PATHS } from './paths';
import { FREE_PROFILE, NOT_A_DENTIST_APPLY_FOR_PRO, PRO_JOIN, PRO_PRICE } from '../../_elements/offer/offer-copy';

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
 */
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
  ctaLabel: 'Book a Strategy Call',
  hero: {
    eyebrow: 'For Dental Practices',
    heading: 'Let Patients Get to Know You Before They Ever Book',
    text: 'We create personalized videos that show people near your practice who you are and why to trust you. Then we put your best video in front of them every month.',
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
  work: {
    heading: 'See What We Create',
    text: 'Real practitioners. Real stories. Creative designed to get attention and build trust.',
    videos: [
      {
        id: '177N3ZJs19k',
        title: "Most people think tooth like this can't be saved...",
        caption: "Saving a tooth most people think can't be saved",
      },
      {
        id: 'VDjztR1EzWU',
        title: 'Top 5 cosmetic dental issues',
        caption: 'Top 5 cosmetic dental issues',
      },
      {
        id: 'O2CQvxnX0P0',
        title: 'What happens when I delay a dental visit?',
        caption: 'What happens when you delay a dental visit',
      },
      {
        id: '_FFxjJ4Gn98',
        title: 'How Severely Worn Teeth Can Be Rebuilt | One of the Most Complex Dental Cases',
        caption: 'Rebuilding severely worn teeth',
      },
    ],
    moreLabel: 'See More Dental Videos',
    moreUrl: 'https://www.youtube.com/@prompthealth2058',
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
        price: PRO_PRICE.monthly,
        button: PRO_JOIN.button,
        link: PRO_JOIN.link,
        queryParams: PRO_JOIN.queryParams,
        applyPro: NOT_A_DENTIST_APPLY_FOR_PRO,
      },
      {
        name: 'PromptHealth Growth',
        label: 'Done For You · We Handle It',
        description: 'From strategy and personalized video production to publishing and Meta advertising, we handle your content and marketing so you can focus on your patients.',
        button: 'Book a Strategy Call',
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
  stepsIntro: 'We create personalized videos that help patients get to know your practice, understand your expertise, and build trust before they book. From content strategy to video production and targeted advertising, we handle it all.',
  steps: [
    {
      title: 'Step 1: Implementation',
      intro: 'Everything starts with understanding your practice, your story, and the patients you want to reach.',
      items: [
        { text: 'Strategy session with you and your team' },
        { text: 'Your brand story and what makes your practice different' },
        { text: 'Personalized video content strategy' },
        { text: 'Your choice of AI-assisted video production or professional on-site filming' },
        { text: 'Content planning, creative direction and team guidance' },
        { text: 'Online presence checklist (Google Business Profile, reviews)' },
        { text: 'Meta ad account and tracking setup' },
      ],
      /* AI-assisted first, and neither marked as recommended (her brief). */
      options: [
        {
          heading: 'AI-Assisted Video Production',
          area: 'Available Worldwide',
          text: 'Personalized videos created using AI technology, featuring your approved digital likeness or a virtual presenter. No ongoing filming required.',
        },
        {
          heading: 'Professional On-Site Filming',
          area: 'Greater Vancouver',
          text: 'Professional filming at your practice, featuring you, your team and your environment, with creative direction and on-camera coaching.',
        },
      ],
      optionsNote: 'Professional on-site filming is available as a premium production option.',
    },
    {
      title: 'Step 2: Growth, every month',
      intro: 'Then we keep your practice visible, month after month.',
      items: [
        { text: '4 personalized, professionally produced videos every month' },
        { text: 'Custom scripts based on your expertise, services and patient questions' },
        { text: 'Consistent video creation without the need for monthly filming' },
        { text: 'Your videos posted for you on Instagram and Google Business Profile' },
        { text: "Your videos shared as collaboration posts with PromptHealth's Instagram, followed by 21,000+ people interested in health" },
        { text: 'Your strongest video each month promoted through targeted Meta advertising to people near your practice' },
        { text: 'Monthly performance report: reach, views, messages, calls and cost per message' },
      ],
    },
  ],
  stepsFootnote: 'No long-term contract. Billed in 3-month cycles. Cancel anytime before your next cycle. Advertising spend and optional on-site production are separate.',
  /* So the page does not imply that Meta ads are managed everywhere AI-assisted
   * production is offered (her brief, proposed and approved). */
  stepsFootnoteSmall: 'Advertising management outside Canada is confirmed during your strategy call.',
  headings: {
    howItWorks: 'How It Works',
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
  },
  /* Her brief of 2026-10-09, update 4. The heading, description, button,
   * thank-you and privacy line are hers; the field messages are ours. */
  booking: {
    formHeading: "Let's Talk About Your Practice",
    description: "Tell us a little about your practice and how we can reach you. We'll be in touch to discuss your goals and how PromptHealth can help.",
    labels: {
      firstName: 'First Name',
      lastName: 'Last Name',
      practiceName: 'Practice Name',
      email: 'Email Address',
      phone: 'Phone Number',
      preferredTime: 'Preferred Time to Reach You',
    },
    optionalLabel: '(optional)',
    validation: {
      firstName: 'Please enter your first name.',
      lastName: 'Please enter your last name.',
      practiceName: 'Please enter your practice name.',
      email: 'Please enter a valid email address.',
      phone: 'Please enter a valid phone number.',
      preferredTime: '',
    },
    submit: 'Request a Strategy Call',
    privacy: {
      before: "We'll only use your details to respond to your inquiry. See our ",
      link: 'Privacy Policy',
      after: '.',
      path: '/policy',
    },
    thanks: "Thank you for reaching out! We've received your request and will be in touch soon.",
    errorGeneric: 'Your request could not be sent. Please try again, or email info@prompthealth.ca.',
  },
};
