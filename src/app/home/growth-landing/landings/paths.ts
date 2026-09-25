/*
 * The address of every growth landing, by registry key.
 *
 * Kept apart from the configs because AttributionService needs the addresses at
 * bootstrap on every page, from the main bundle, and a config is a landing's
 * whole copy: importing the registry there would ship every landing's text to
 * every page to learn a handful of paths. Each config takes its path from here,
 * so the two cannot disagree.
 */
export const GROWTH_LANDING_PATHS = {
  dentists: '/for-dentists',
};

const PATHS: string[] = Object.keys(GROWTH_LANDING_PATHS).map(key => GROWTH_LANDING_PATHS[key]);

/* A trailing slash reaches the same route, so it is the same landing. */
export function isGrowthLandingPath(path: string): boolean {
  const clean = String(path || '').replace(/\/+$/, '');
  return PATHS.indexOf(clean) >= 0;
}
