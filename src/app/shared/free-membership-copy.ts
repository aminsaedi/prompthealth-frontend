/*
 * Hedieh's brief of 2026-10-22 (plan-specs/source/brief-2026-10-22/brief.txt):
 * what a free member's dashboard offers, the Pro waitlist, and the switch from
 * a patient account to a professional one. Written once here because the
 * dashboard's panel, its Pro banner, the membership tab and the /pro/waitlist
 * page all say the same thing. The Pro waitlist sentence is hers, from the
 * Version B welcome email.
 */

export const PRO_WAITLIST = {
  button: 'Join the Pro waitlist',
  joined: "You're on the Pro waitlist. We'll let you know when it opens for you.",
  pitch: 'PromptHealth Pro is open to dental practices first, and we are preparing it for other health professionals next.',
  error: 'You could not be added to the Pro waitlist. Please try again.',
};

/* /pro/waitlist, where the welcome email's Join the Pro waitlist lands. */
export const PRO_WAITLIST_PAGE = {
  meta: {
    title: 'PromptHealth Pro Waitlist',
    description: 'Join the PromptHealth Pro waitlist.',
  },
  pending: 'Adding you to the Pro waitlist.',
  heading: "You're on the Pro waitlist",
  text: "You'll be among the first to hear when PromptHealth Pro opens for your profession.",
  dashboard: 'Go to your dashboard',
  growth: 'See PromptHealth Growth',
  errorHeading: "We couldn't add you to the Pro waitlist",
  errorText: 'This link may be incomplete or out of date.',
  contactLead: 'Please',
  contact: 'contact us',
  contactTail: 'and we will add you ourselves.',
};

/* The "Your free membership" panel (step 3). */
export const FREE_MEMBERSHIP = {
  label: 'PromptHealth Basic',
  heading: 'Your free membership',
  text: 'Your free profile comes with a directory listing, article publishing and the PromptHealth Academy.',
  viewProfile: 'View your profile',
  writeArticle: { button: 'Write an article', link: '/community/editor/article' },
  academy: { button: 'PromptHealth Academy', link: '/online-academy' },
  growth: { button: 'Book a Growth strategy call', link: '/for-dentists/growth', fragment: 'apply' },
  upgrade: { button: 'Upgrade to Pro', link: '/pro' },
};

/* The profile-completeness nudge (step 3). */
export const PROFILE_NUDGE = {
  heading: 'Complete your profile',
  text: 'A complete profile makes it easier for patients to choose you. Still missing:',
  items: {
    city: 'Add your city',
    photo: 'Add a profile photo',
    bio: 'Add a short bio',
    website: 'Add your website',
  },
  cityNote: "Profiles without a city don't appear on the city directory pages.",
};

/* A patient account that should have been a professional one (step 6). */
export const SWITCH_ACCOUNT = {
  prompt: 'Are you a practitioner or clinic?',
  promptLink: 'Switch to a professional account.',
  button: 'Switch to a practitioner account',
  heading: 'Switch to a practitioner account',
  intro: "Patient accounts don't appear in the PromptHealth directory. If you are a practitioner or a clinic, switch this account to a professional profile so people looking for care can find you.",
  keep: 'You keep the same email and password.',
  next: 'Next, you complete your profile. We review every new profile before it goes live.',
  question: 'Which are you?',
  practitioner: 'A practitioner',
  clinic: 'A clinic',
  confirm: 'Switch my account',
  cancel: 'Cancel',
  working: 'Switching your account.',
  error: 'Your account could not be switched. Please try again, or email info@prompthealth.ca.',
  cardText: 'Signed up as a patient by mistake? Practitioners and clinics need a professional account to appear in the directory.',
};
