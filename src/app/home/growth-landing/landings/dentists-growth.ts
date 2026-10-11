import { IGrowthLanding } from '../growth-landing.model';
import { GROWTH_LANDING_PATHS } from './paths';

/*
 * /for-dentists/growth, PromptHealth Growth's own page (Hedieh's brief of
 * 2026-10-11, plan-specs/source/brief-2026-10-11/brief.txt, section 3), which
 * its Meta ads point at. /for-dentists is the overview of both offers.
 *
 * In her order: the headline and her description, the four clinic videos
 * with the channel link, what is included, How It Works, her photo with one
 * line, the line about practices outside Greater Vancouver, and the form.
 *
 * Her rule for this page: no price, no number of videos and no AI clone
 * video, the title and description included. How It Works is the one moved
 * from /for-dentists (her brief of 2026-10-09) with the edits that rule needs:
 * the AI-assisted and on-site tiles and their note are gone, Step 1's
 * production choice is the quarterly shoot, Step 2 no longer counts the videos
 * or promises video without filming, and the contract line no longer calls
 * on-site production optional.
 *
 * The headline is her approved Growth heading from the plan section
 * (GROWTH_PANEL in offer-copy.ts), written out here rather than imported so
 * an edit to that section cannot change this page. "What's Included" is her
 * list, word for word, sentence-cased. The videos, their captions and the
 * strategy call form moved here unchanged.
 */
export const DENTISTS_GROWTH_LANDING: IGrowthLanding = {
  key: 'dentists-growth',
  path: GROWTH_LANDING_PATHS['dentists-growth'],
  seo: {
    title: 'Dental Clinic Videos and Meta Ads | PromptHealth Growth',
    description: 'Customized professional videos for your dental clinic, scripted and coached by Hedieh, filmed in a quarterly shoot and run as a Meta ad that we manage.',
    /* Her behind-the-scenes photo, without the figures the /for-dentists
     * card lays over its frame. */
    image: '/assets/img/share/for-dentists-growth-share.v1.jpg',
    imageWidth: 1200,
    imageHeight: 630,
    imageType: 'image/jpeg',
    imageAlt: 'Hedieh Safiyari directing a video shoot at a dental practice',
  },
  sections: ['hero', 'work', 'included', 'steps', 'meet', 'apply'],
  hero: {
    eyebrow: 'PromptHealth Growth · For Dental Clinics',
    heading: 'Patients Who Feel Like They Already Know You',
    text: 'Customized professional videos for your clinic, scripted and coached by Hedieh, filmed in a quarterly production shoot. Your best-performing video becomes a Meta ad that we run and manage, with a monthly snapshot of how it performed.',
    button: { label: 'Book a Strategy Call', target: 'apply' },
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
  included: {
    heading: "What's Included",
    items: [
      'Strategy and scripts',
      'On-camera coaching for staff',
      'Quarterly professional shoot with photos and drone',
      'Managed Meta ad',
      'Monthly snapshot',
    ],
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
        { text: 'A quarterly professional shoot at your practice' },
        { text: 'Content planning, creative direction and team guidance' },
        { text: 'Online presence checklist (Google Business Profile, reviews)' },
        { text: 'Meta ad account and tracking setup' },
      ],
    },
    {
      title: 'Step 2: Growth, every month',
      intro: 'Then we keep your practice visible, month after month.',
      items: [
        { text: 'Personalized, professionally produced videos' },
        { text: 'Custom scripts based on your expertise, services and patient questions' },
        { text: 'Your videos posted for you on Instagram and Google Business Profile' },
        { text: "Your videos shared as collaboration posts with PromptHealth's Instagram, followed by 21,000+ people interested in health" },
        { text: 'Your strongest video each month promoted through targeted Meta advertising to people near your practice' },
        { text: 'Monthly performance report: reach, views, messages, calls and cost per message' },
      ],
    },
  ],
  stepsFootnote: 'No long-term contract. Billed in 3-month cycles. Cancel anytime before your next cycle. Advertising spend is separate.',
  stepsFootnoteSmall: 'Advertising management outside Canada is confirmed during your strategy call.',
  headings: {
    howItWorks: 'How It Works',
  },
  /* Her photo and one line (her brief, section 3). The dentist quote she may
   * send goes in meet.quote; until then nothing is shown for it. */
  meet: {
    text: 'Hedieh has directed around 400 dental videos.',
    photo: {
      src: '/assets/img/for-dentists/hedieh-safiyari.v1.webp',
      alt: 'Hedieh Safiyari, founder of PromptHealth',
      width: 544,
      height: 544,
    },
  },
  applyNote: "Outside Greater Vancouver? Apply anyway, and we'll talk about remote options.",
  /* Her brief of 2026-10-09, update 4, unchanged. The heading, description,
   * button, thank-you and privacy line are hers; the field messages are ours. */
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
