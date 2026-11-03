import { Pro2ColourRole, Pro2PostStatus, Pro2TopicStatus } from 'src/app/shared/services/pro2.service';

/*
 * The Studio's words in one place. House style: Canadian spelling, no em or
 * en dashes, straight quotes. Nothing in the Studio is ever posted for the
 * member, so no label says "published" or "scheduled": a post waits for
 * approval, and an approved post is downloaded and shared by the member.
 */

export const COLOUR_ROLES: { role: Pro2ColourRole; label: string; help: string }[] = [
  { role: 'primary', label: 'Main colour', help: 'Headlines, buttons and the strongest shapes.' },
  { role: 'secondary', label: 'Second colour', help: 'Panels and supporting shapes.' },
  { role: 'accent', label: 'Accent', help: 'Small details, used sparingly.' },
  { role: 'ink', label: 'Text', help: 'Body text. It needs to read clearly on the background.' },
  { role: 'paper', label: 'Background', help: 'The base of most posts.' },
];

export const POSITIONING_QUESTIONS: { key: string; label: string; hint: string; suggested?: string }[] = [
  { key: 'idealClient', label: 'Who is your ideal client?', hint: 'For example: busy parents in Kitsilano who want more energy.', suggested: 'idealClient' },
  { key: 'knownFor', label: 'What do you want to be known for?', hint: 'One or two things people should remember you by.', suggested: 'knownFor' },
  { key: 'feel', label: 'How should people feel after reading your posts?', hint: 'For example: reassured, curious, ready to book.' },
  { key: 'different', label: 'What makes your practice different?', hint: 'Something true that a nearby practice could not say.', suggested: 'approach' },
  { key: 'tone', label: 'How would you describe your tone?', hint: 'For example: warm and plain, or calm and expert.', suggested: 'tone' },
  { key: 'avoid', label: 'Is there anything we should never say?', hint: 'Words, topics or claims you would rather leave out.' },
];

export const FACT_TYPE_LABELS: { [type: string]: string } = {
  'service': 'Services',
  'specialty': 'Specialties',
  'team-member': 'Team',
  'credential': 'Credentials',
  'philosophy': 'Approach',
  'differentiator': 'What sets you apart',
  'audience': 'Who you help',
  'location': 'Location',
  'contact': 'Contact',
  'hours': 'Hours',
  'booking': 'Booking',
  'pricing': 'Pricing',
  'offer': 'Offers',
  'facility': 'Your space',
  'technology': 'Equipment',
  'language': 'Languages',
  'faq': 'Common questions',
  'article': 'Articles',
  'other': 'Other',
};

/* The order groups appear in; anything else follows, then "Other". */
export const FACT_TYPE_ORDER = [
  'service', 'specialty', 'team-member', 'credential', 'philosophy', 'differentiator', 'audience',
  'location', 'hours', 'booking', 'contact', 'pricing', 'offer', 'facility', 'technology', 'language', 'faq', 'article',
];

export const LOGO_SOURCE_LABELS: { [source: string]: string } = {
  'header-img': 'Website header',
  'header-svg': 'Website header',
  'img-logo-attr': 'Your website',
  'jsonld': 'Website data',
  'og-image': 'Link preview image',
  'icon': 'Site icon',
  'profile-image': 'PromptHealth profile',
  'upload': 'Uploaded by you',
};

export const PHOTO_KIND_LABELS: { [kind: string]: string } = {
  'practitioner-portrait': 'Portrait',
  'team': 'Team',
  'clinic-interior': 'Inside the practice',
  'clinic-exterior': 'Outside the practice',
  'treatment-or-service': 'Treatment',
  'equipment': 'Equipment',
  'food-or-recipe': 'Food',
  'stock-or-generic': 'Stock photo',
  'graphic-or-text': 'Graphic with text',
  'badge-or-certificate': 'Badge or certificate',
  'other': 'Photo',
};

export const TOPIC_CATEGORY_LABELS: { [category: string]: string } = {
  'education-faq': 'Common question',
  'hours-booking': 'Booking',
  'service-highlight': 'Service',
  'team-introduction': 'Meet the team',
  'differentiator': 'What sets you apart',
  'facility-technology': 'Your space',
  'social-proof': 'Kind words',
  'custom': 'Your topic',
};

export const TOPIC_STATUS_LABELS: { [status in Pro2TopicStatus]: string } = {
  idea: 'Idea',
  queued: 'Preparing',
  ready: 'Ready to review',
  approved: 'Approved',
  rejected: 'Rejected',
  failed: 'Could not prepare',
};

export const POST_STATUS_LABELS: { [status in Pro2PostStatus]: string } = {
  generating: 'Preparing',
  awaiting_approval: 'Waiting for your approval',
  approved: 'Approved',
  rejected: 'Rejected',
  failed: 'Could not prepare',
};

/* Each topic allows this many new drafts after the first (the spec's
 * allowance semantics; the backend enforces it). */
export const REGENERATIONS_PER_TOPIC = 3;

/* Turns a dashed machine label into words, for any value the maps above do
 * not know yet. */
export function humanize(value: string): string {
  const text = String(value || '').replace(/[-_]+/g, ' ').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

export function label(map: { [key: string]: string }, key: string): string {
  return (key && map[key]) || humanize(key);
}
