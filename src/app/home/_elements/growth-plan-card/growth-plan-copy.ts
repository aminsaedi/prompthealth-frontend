/*
 * Hedieh's copy for PromptHealth Growth where existing pages offer it: the plan
 * card that /plans and /for-practitioners both show and both describe in their
 * structured data, and the paid-plan answer that /for-practitioners and /faq
 * both carry. Each is used in more than one place, so it is written once here.
 *
 * Taken from plan-specs/growth/dentists-landing-copy.json (otherPages) by a
 * script rather than typed, like growth-landing/landings/dentists.ts. Edit
 * wording there first and here second, so the two agree.
 *
 * Kept out of growth-landing/: the sitemap dates /for-dentists by the last
 * change under that directory, and this is not that page's text.
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
