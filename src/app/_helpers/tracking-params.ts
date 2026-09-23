/*
 * Query parameters that say how a reader got here, not which page they want.
 *
 * One list, shared by the server render (server.ts), the SSR cache key
 * (server-wrapper.js, through main.js's export) and, later, the canonical. An ad
 * click carries an id unique to that click, so keyed on the raw address every
 * one of them missed the cache, cost a full render on a 1-vCPU box and evicted a
 * page a crawler had warmed; rendered from the raw address, the canonical and
 * og:url carried the first clicker's fbclid to every crawler served that entry.
 *
 * Removing them server-side costs no attribution. JourneyService, GA and HubSpot
 * read window.location in the browser, which keeps the full address.
 *
 * The names come from the production nginx log (fbclid, igshid, utm_*, ref from
 * hediehsafiyari.com, LinkedIn's trk, gclid) plus the other platforms' click ids,
 * and ref_src for parity with the backend's own list (services/link.js). A name
 * must leave this list before the app starts reading it: the server render never
 * sees a parameter named here, so a feature built on ?ref= would render as if it
 * were absent.
 */
const TRACKING_PARAMS = [
  'fbclid', 'mibextid', 'igshid', 'igsh',                       // Meta
  'gclid', 'gclsrc', 'gbraid', 'wbraid', 'dclid', 'gad_source', 'gad_campaignid', 'srsltid', '_gl', '_ga', // Google
  'msclkid', 'ttclid', 'twclid', 'li_fat_id', 'trk', 'rdt_cid', 'epik', 'sccid', 'yclid', 'ref_src',
  '_hsenc', '_hsmi', '__hstc', '__hssc', '__hsfp', 'hsctatracking', 'mc_cid', 'mc_eid', // HubSpot, Mailchimp
  'ref',  // hediehsafiyari.com links here with ?ref=; the app reads no ref
];

export function isTrackingParam(name: string): boolean {
  let key = name;
  try { key = decodeURIComponent(name); } catch (e) { /* compared as written */ }
  key = key.toLowerCase();
  return key.indexOf('utm_') === 0 || TRACKING_PARAMS.indexOf(key) >= 0;
}

/* Every other parameter is kept as written and in order, and an address with
 * none comes back unchanged character for character, so nothing without a
 * tracking parameter renders or caches differently from before. */
export function stripTrackingParams(url: string): string {
  const hashAt = url.indexOf('#');
  const beforeHash = hashAt >= 0 ? url.slice(0, hashAt) : url;
  const fragment = hashAt >= 0 ? url.slice(hashAt) : '';
  const queryAt = beforeHash.indexOf('?');
  if (queryAt < 0) { return url; }
  const pairs = beforeHash.slice(queryAt + 1).split('&');
  const kept = pairs.filter(pair => !isTrackingParam(pair.split('=')[0]));
  if (kept.length === pairs.length) { return url; }
  const query = kept.filter(pair => pair !== '').join('&');
  return beforeHash.slice(0, queryAt) + (query ? '?' + query : '') + fragment;
}
