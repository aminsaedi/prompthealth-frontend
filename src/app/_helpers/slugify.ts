/**
 * Converts a display string (e.g. "Acupuncturist") to a URL-friendly slug
 * (e.g. "acupuncturist"). Handles multi-word names like "Massage Therapist"
 * → "massage-therapist". Returns empty string if input is falsy or
 * produces no URL-safe characters.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
