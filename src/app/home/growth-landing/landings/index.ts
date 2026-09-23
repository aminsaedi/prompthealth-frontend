import { IGrowthLanding } from '../growth-landing.model';
import { DENTISTS_LANDING } from './dentists';

/*
 * Every growth landing, by the key its route names in `data.landing`.
 *
 * Adding a practitioner type: a config file beside dentists.ts, an entry here
 * and in paths.ts, a route line in home-routing.module.ts, an entry in
 * scripts/generate-static-page-dates.js, and its poster and captions under
 * src/assets/video/ with the MP4 on S3. The marketing link rule (^/for-) already
 * covers its address.
 */
const GROWTH_LANDINGS: { [key: string]: IGrowthLanding } = {
  [DENTISTS_LANDING.key]: DENTISTS_LANDING,
};

export function growthLandingFor(key: string): IGrowthLanding | null {
  return Object.prototype.hasOwnProperty.call(GROWTH_LANDINGS, key) ? GROWTH_LANDINGS[key] : null;
}
