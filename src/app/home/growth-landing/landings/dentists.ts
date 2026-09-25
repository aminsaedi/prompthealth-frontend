import { IGrowthLanding } from '../growth-landing.model';
import { GROWTH_LANDING_PATHS } from './paths';

/*
 * /for-dentists, the first growth landing.
 *
 * Every string here is Hedieh's Website-Copy-FINAL, taken from
 * plan-specs/growth/dentists-landing-copy.json by a script rather than typed,
 * with the house-style edits already applied there and listed for her sign-off
 * in the plan (section 6): no em dashes, straight apostrophes, and the $1,000
 * advertising FAQ reworded, because no price appears anywhere on the site. The
 * booking form's text and the two hidden headings are ours, proposed in the
 * same section. Edit wording there first and here second, so the two agree.
 *
 * booking.calendlyUrl stays empty until the 30-minute event exists. Until then
 * the form thanks the visitor and she follows up by email.
 */
export const DENTISTS_LANDING: IGrowthLanding = {
  key: 'dentists',
  path: GROWTH_LANDING_PATHS.dentists,
  seo: {
    title: 'Growth for Dentists | Video Creative & Patient Acquisition',
    description: 'A full production day at your practice, a six-month content library, and targeted Meta advertising that brings new patients. Book a 30-minute consultation.',
    image: '/assets/video/for-dentists-hero-poster.v1.jpg',
    imageWidth: 1280,
    imageHeight: 720,
    imageType: 'image/jpeg',
    imageAlt: "Patients are looking for you. They just don't know it yet.",
  },
  ctaLabel: 'Book a 30-Minute Consultation',
  hero: {
    heading: "We Bring You Patients Who Aren't Searching Yet",
    text: 'Most dental marketing competes for people already looking for a dentist. We reach the people near your practice before they start looking, and give them a reason to choose you.',
    video: {
      src: 'https://prompt-images.s3.us-east-2.amazonaws.com/landing/for-dentists/hero-720p-v1.mp4',
      poster: '/assets/video/for-dentists-hero-poster.v1.jpg',
      /* v2 lifts the first two cues off the video's own title card. */
      captions: '/assets/video/for-dentists-hero.v2.en.vtt',
      title: 'PromptHealth Growth: attract new patients',
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
      },
      {
        id: 'VDjztR1EzWU',
        title: 'Top 5 cosmetic dental issues',
      },
      {
        id: 'O2CQvxnX0P0',
        title: 'What happens when I delay a dental visit?',
      },
      {
        id: '_FFxjJ4Gn98',
        title: 'How Severely Worn Teeth Can Be Rebuilt | One of the Most Complex Dental Cases',
      },
    ],
    moreLabel: 'See More Dental Videos',
    moreUrl: 'https://www.youtube.com/@prompthealth2058',
  },
  steps: [
    {
      title: 'Step 1: Implementation',
      intro: 'Everything starts with one full production day at your practice.',
      items: [
        {
          text: 'Strategy session with you and your team',
        },
        {
          text: 'Your brand story: what makes your practice different',
        },
        {
          text: 'Full production day: video, photography and drone footage',
        },
        {
          text: 'A content library built to last six months',
        },
        {
          lead: "Your team's social playbook:",
          text: 'on-camera coaching so your team is confident on video, plus simple guidance and templates for what to post at the clinic between campaigns',
        },
        {
          lead: 'Your online presence checklist:',
          text: 'practical guidance on your Google Business Profile, reviews, and where your content should live',
        },
        {
          text: 'Campaign and lead capture setup',
        },
      ],
      note: 'Outside Greater Vancouver? We also offer a remote production option using AI-powered video.',
    },
    {
      title: 'Step 2: Growth',
      intro: 'Then we turn that content into patients, month after month.',
      items: [
        {
          text: 'Targeted Meta advertising to patients near your practice',
        },
        {
          text: 'New edited content released every month from your production day',
        },
        {
          text: 'Continuous creative testing and campaign optimization',
        },
        {
          text: 'Every lead captured and sent straight to your team',
        },
        {
          text: "A monthly report: leads, cost per lead, and what's next",
        },
        {
          text: 'Your videos published to your Instagram and Google Business Profile',
        },
      ],
    },
  ],
  stepsFootnote: "No long-term contract. Continue month to month, cancel with 30 days' notice.",
  hiddenHeadings: {
    howItWorks: 'How It Works',
    faq: 'Frequently Asked Questions',
  },
  faq: [
    {
      q: 'How much should we spend on advertising?',
      a: "Advertising spend is paid directly to Meta and is separate from our fees. We'll recommend the right monthly budget for your goals and your area on the call.",
      opened: false,
    },
    {
      q: 'Are we locked into a contract?',
      a: "No. After implementation, you continue month to month and can cancel with 30 days' notice. We do recommend giving campaigns at least three months, since advertising needs time to find your best patients.",
      opened: false,
    },
    {
      q: 'How much filming do we have to do?',
      a: 'One production day at your practice. We plan everything in advance and coach your team on camera, so nobody has to be a performer. That single day gives us about six months of content.',
      opened: false,
    },
    {
      q: 'Do you manage our social media or SEO?',
      a: 'No. We focus on one thing: creative and advertising that brings new patients. During implementation we show your team how to handle everyday posting and how to keep your Google Business Profile and reviews in good shape, and your campaign videos are published to your Instagram and Google Business Profile. We guide, your team runs it day to day.',
      opened: false,
    },
    {
      q: "What's a new patient worth to us?",
      a: "That's the number that matters most. Most practices find a single new patient covers the monthly investment several times over. We'll work it out together on the call.",
      opened: false,
    },
  ],
  final: {
    heading: 'Great Healthcare Professionals Deserve to Be Seen, Heard and Trusted.',
    text: "In 30 minutes we'll look at where your new patients come from today, and what a campaign could realistically bring you.",
  },
  booking: {
    calendlyUrl: '',
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
