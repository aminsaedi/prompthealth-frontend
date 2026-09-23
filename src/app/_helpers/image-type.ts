/*
 * The MIME type of an image, from what a caller declared or else from its file
 * name, or null when neither says.
 *
 * The models used to build it as 'image/' + the extension, which gave
 * "image/jpg" for a .jpg (not a MIME type) and "" for an S3 key with no
 * extension, one ending in ?ver=2.3, or a .webp. Both went out as
 * og:image:type. One helper, so the meta tags and the models cannot disagree.
 */
export function imageTypeOf(url: string, declared?: string): string | null {
  const d = (declared || '').toLowerCase().replace('image/jpg', 'image/jpeg');
  if (/^image\/(jpeg|png|webp|gif)$/.test(d)) { return d; }
  const m = (url || '').split('#')[0].split('?')[0].match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? 'image/' + m[1].toLowerCase().replace('jpg', 'jpeg') : null;
}
