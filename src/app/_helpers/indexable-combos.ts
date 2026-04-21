// SEO-064: Allowlist of indexable city × (category|type) intersection pages.
//
// Why this exists: the directory generates ~2,625 programmatic
// /practitioners/area/:city/category/:slug and /practitioners/area/:city/type/:slug
// URLs (21 cities × ~125 categories/types). With <10% unique content per
// combo they look like a doorway cluster to Google. Default behaviour is
// therefore noindex for every intersection, with an explicit allowlist of
// high-value combos that are indexable.
//
// Keep the list small — under 50 combos — so the programmatic surface area
// stays well below the doorway-risk threshold.
//
// Entry format: `${city}/${slug}` where both sides are the same slug used
// in the URL (city segment as stored in locations, category/type slug as
// produced by slugify()).

const INDEXABLE_CITY_CATEGORY: ReadonlyArray<string> = [
  // seed with nothing — any city × category combo is noindex by default
];

const INDEXABLE_CITY_TYPE: ReadonlyArray<string> = [
  // seed with nothing — any city × type combo is noindex by default
];

const cityCategorySet = new Set(INDEXABLE_CITY_CATEGORY);
const cityTypeSet = new Set(INDEXABLE_CITY_TYPE);

export function isIndexableCityCategory(city: string, categorySlug: string): boolean {
  if (!city || !categorySlug) return true;
  return cityCategorySet.has(`${city}/${categorySlug}`);
}

export function isIndexableCityType(city: string, typeSlug: string): boolean {
  if (!city || !typeSlug) return true;
  return cityTypeSet.has(`${city}/${typeSlug}`);
}
