/*
 * The target of a server 301, carrying the query the request arrived with.
 *
 * Every SSR redirect built its Location from the path alone, so the utm_ tags
 * and click ids on a legacy or alias address were dropped before the browser
 * reached a page that could read them: /privacy-policy?utm_source=ig&fbclid=abc
 * answered Location: /policy, and the visit was recorded with no source. The
 * whole query is kept, tracking parameters included, because reading them is
 * the page's job (JourneyService, in the browser), not the redirect's.
 *
 * originalUrl, not url: inside a mounted router Express strips the mount path
 * from req.url, and the query has to come from the address as it was asked for.
 */
export function withQueryOf(originalUrl: string, target: string): string {
  const queryAt = originalUrl.indexOf('?');
  if (queryAt < 0 || queryAt === originalUrl.length - 1) { return target; }
  return target + (target.indexOf('?') >= 0 ? '&' : '?') + originalUrl.slice(queryAt + 1);
}
