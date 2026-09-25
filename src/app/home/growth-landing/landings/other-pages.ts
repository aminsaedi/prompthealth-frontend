/*
 * Hedieh's copy for the existing pages that lead to the growth landings, as the
 * TypeScript on those pages needs it: the plan card that /plans and
 * /for-practitioners both show and both describe in their structured data, the
 * paid-plan answer that /for-practitioners and /faq both carry, and the /plans
 * title and description, which the page's meta and its WebPage JSON-LD share.
 *
 * Taken from plan-specs/growth/dentists-landing-copy.json (otherPages) by a
 * script rather than typed, like dentists.ts. Edit wording there first and here
 * second, so the two agree. Text that appears once, in a template, is written in
 * that template instead.
 *
 * None of it states a price: nothing on this site says what PromptHealth charges,
 * and the terms defer to the service agreement.
 */

export const GROWTH_PLAN_CARD = {
  eyebrow: 'PROMPTHEALTH GROWTH',
  heading: 'Turn Your Practice Into New Patients',
  body: 'A full production day at your practice, a library of content, and targeted advertising that brings patients through your door. Built and managed for you.',
  flow: 'Creative → Ads → Leads → Patients',
  availability: 'Currently available for dental practices.',
  button: 'Explore Growth for Dentists',
  link: '/for-dentists',
};

/* Its answer is HTML: faq-item renders it as such, and each page's FAQPage
 * JSON-LD strips the tags. */
export const PAID_PLAN_FAQ = {
  q: 'Is there a paid plan for practitioners?',
  aHtml: 'Yes. PromptHealth Growth is our done-for-you patient acquisition service, starting with dental practices. Visit <a href="/for-dentists">/for-dentists</a> to learn more.',
};

/* Proposed wording, on her sign-off list (plan section 6). The page's H2 is
 * in its template. */
export const PLANS_PAGE = {
  title: 'Plans for Practitioners | PromptHealth',
  description: 'Create a free PromptHealth profile, or grow your practice with PromptHealth Growth: video production and targeted advertising, now available for dental practices.',
};
