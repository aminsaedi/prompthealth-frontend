import { IGrowthLanding } from '../growth-landing.model';
import { GROWTH_LANDING_PATHS } from './paths';
import { FREE_PROFILE, NOT_A_DENTIST_APPLY_FOR_PRO, PRO_JOIN } from '../../_elements/offer/offer-copy';

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
 * The captions are ours, shortened from the videos' own titles; she asked for
 * the topic, and a clinic's name only where it has agreed to be named, so none
 * are named.
 *
 * The hero video is her own vertical cut, filmed on a production day, with the
 * words already in the picture. booking.calendlyUrl is her 30-minute Discovery
 * Call; emptied, the form thanks the visitor and she follows up by email.
 */
export const DENTISTS_LANDING: IGrowthLanding = {
  key: 'dentists',
  path: GROWTH_LANDING_PATHS.dentists,
  seo: {
    title: 'PromptHealth Growth for Dentists | Video Filming, Coaching & Local Ads',
    description: 'Professional videos of you and your team, filmed every three months and promoted to people near your practice. By application. Book a 30-minute consultation.',
    /* The share card is landscape, as every network crops to; the vertical
     * poster alone would be cut to a strip. */
    image: '/assets/img/share/for-dentists-share.v1.jpg',
    imageWidth: 1200,
    imageHeight: 630,
    imageType: 'image/jpeg',
    imageAlt: 'Hedieh Safiyari on set at a practice, with 1.7M followers and 400+ dental videos',
  },
  ctaLabel: 'Book a 30-Minute Consultation',
  hero: {
    eyebrow: 'For Dental Practices',
    heading: 'Let Patients Get to Know You Before They Ever Book',
    text: 'We film, coach and produce videos that show people near your practice who you are and why to trust you. Then we put your best video in front of them every month.',
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
    cards: [
      {
        name: 'PromptHealth Growth',
        line: 'We film, produce and run your videos',
        price: 'By application',
        button: 'Book a 30-Minute Consultation',
      },
      {
        name: 'PromptHealth Pro',
        line: 'Your team creates, with weekly guidance from Hedieh',
        price: '$149/month per clinic',
        button: PRO_JOIN.button,
        link: PRO_JOIN.link,
        queryParams: PRO_JOIN.queryParams,
        applyPro: NOT_A_DENTIST_APPLY_FOR_PRO,
      },
    ],
    /* Her brief of 2026-10-08: the path is a free profile first, then Pro
     * when a practice wants more. The sentence is ours, from her words. */
    freeProfile: {
      text: 'Not ready yet? Start with a free PromptHealth profile, then upgrade to Pro when you want more.',
      button: FREE_PROFILE.button,
      link: FREE_PROFILE.link,
    },
  },
  stepsIntro: 'PromptHealth Growth is by application only.',
  steps: [
    {
      title: 'Step 1: Implementation',
      intro: 'Everything starts with strategy and your first production day.',
      items: [
        { text: 'Strategy session with you and your team' },
        { text: 'Your brand story' },
        { text: 'First production day: video, photos and drone' },
        { text: 'On-camera coaching and a social playbook for your team' },
        { text: 'Online presence checklist (Google Business Profile, reviews)' },
        { text: 'Meta ad account and tracking setup' },
      ],
      note: 'Filming is in person for clinics in Greater Vancouver. Outside Greater Vancouver? We offer a remote option using an AI video clone of you.',
    },
    {
      title: 'Step 2: Growth, every month',
      intro: 'Then we keep your practice visible, month after month.',
      items: [
        {
          text: '4 professionally edited videos every month',
        },
        {
          text: 'Filming at your practice every 3 months',
        },
        {
          text: 'Scripts and on-camera coaching for every shoot',
        },
        {
          text: 'Your videos posted for you on your Instagram and Google Business Profile',
        },
        {
          text: "Your videos shared as collaboration posts with PromptHealth's Instagram, followed by 21,000+ people interested in health",
        },
        {
          text: 'Your best video each month run as a Meta ad to people near your practice, with tracking set up',
        },
        {
          text: 'A monthly report: reach, views, messages and calls, and cost per message',
        },
      ],
    },
  ],
  stepsFootnote: 'No contract. Billed in 3-month cycles, each built around one production day. Cancel anytime before your next cycle.',
  headings: {
    howItWorks: 'How It Works',
    faq: 'Frequently Asked Questions',
  },
  linkBand: {
    text: 'Want your team to make its own content? Get a new video idea and post idea every week.',
    button: 'See PromptHealth Pro',
    link: '/pro',
  },
  faq: [
    {
      q: "What's the difference between Growth and Pro?",
      a: 'Growth is done for you: we plan, film, edit and post your videos and run your ads. Pro is for teams who want to make their own content, with a new video idea and post idea from Hedieh every week, for $149/month per clinic.',
      opened: false,
    },
    {
      q: 'How much does PromptHealth Growth cost?',
      a: "It depends on your practice and goals. We'll go through pricing on your 30-minute consultation.",
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
      a: 'No. PromptHealth Growth is billed in 3-month cycles, and each cycle is built around one production day at your practice. You can cancel anytime before your next cycle starts. We recommend at least two cycles, so your videos and ads have time to work.',
      opened: false,
    },
    {
      q: 'How much filming do we have to do?',
      a: 'For clinics in Greater Vancouver, one production day at your practice every three months. We plan everything in advance and coach your team on camera, so nobody has to be a performer. Outside Greater Vancouver, we offer a remote option using an AI video clone of you.',
      opened: false,
    },
    {
      q: 'Do you manage our social media or SEO?',
      a: "No. We focus on video. We publish your videos to your Instagram and Google Business Profile and show your team how to handle everyday posting. We don't do SEO, websites, or replies to comments and messages.",
      opened: false,
    },
    {
      q: 'Do we approve the videos?',
      a: "Yes. Your practice reviews and approves every video and ad before it's published. We keep content educational and accurate, without discounts, guarantees or patient testimonials in ads.",
      opened: false,
    },
  ],
  final: {
    heading: 'Great Healthcare Professionals Deserve to Be Seen, Heard and Trusted.',
    text: "In 30 minutes, we'll look at how patients find you today and whether PromptHealth Growth is the right fit.",
  },
  booking: {
    calendlyUrl: 'https://calendly.com/hediehsafiyari/generalmeeting',
    formHeading: 'Book a 30-Minute Consultation',
    labels: {
      name: 'Name',
      practiceName: 'Practice name',
      email: 'Email',
      phone: 'Phone',
      city: 'City',
      patientSource: 'How do patients find you today?',
    },
    validation: {
      name: 'Please enter your name.',
      practiceName: 'Please enter your practice name.',
      email: 'Please enter a valid email address.',
      phone: 'Please enter your phone number.',
      city: 'Please enter your city.',
      patientSource: 'Please tell us how patients find you today.',
    },
    submitWithCalendly: 'Continue',
    submitWithoutCalendly: 'Send',
    thanksWithCalendly: 'Thank you. Choose a time for your consultation below.',
    thanksWithoutCalendly: "Thank you. We'll be in touch shortly to book your consultation.",
    thanksScheduled: 'Thank you. Your consultation is booked.',
    errorGeneric: 'Your request could not be sent. Please try again, or email info@prompthealth.ca.',
  },
};
