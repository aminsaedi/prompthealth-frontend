import { Observable, Subscription } from 'rxjs';

/*
 * Asks again every few seconds while a job is running, and stops when the
 * job is done or the page goes away. One request at a time: the next one is
 * timed from the end of the last, so a slow answer never piles requests up.
 * The Studio is browser-only (the dashboard guard turns the server away),
 * but the caller still passes whether this is a browser, so a stray render
 * on the server can never leave a timer behind.
 */
export class Poller {
  private timer: any = null;
  private sub: Subscription = null;
  private failures = 0;

  constructor(private readonly isBrowser: boolean, private readonly everyMs = 4500) {}

  get running(): boolean { return this.timer !== null || this.sub !== null; }

  /* tick answers true to keep going. Three failures in a row stop it: the
   * page says so rather than asking a broken API forever. */
  start(tick: () => Observable<boolean>, onGiveUp?: () => void): void {
    this.stop();
    if (!this.isBrowser) { return; }
    this.failures = 0;
    const schedule = () => {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.sub = tick().subscribe(keepGoing => {
          this.sub = null;
          this.failures = 0;
          if (keepGoing) { schedule(); }
        }, () => {
          this.sub = null;
          this.failures++;
          if (this.failures >= 3) {
            if (onGiveUp) { onGiveUp(); }
          } else {
            schedule();
          }
        });
      }, this.everyMs);
    };
    schedule();
  }

  stop(): void {
    if (this.timer !== null) { clearTimeout(this.timer); this.timer = null; }
    if (this.sub) { this.sub.unsubscribe(); this.sub = null; }
  }
}

/* Copies text, with the old textarea fallback for browsers without the
 * Clipboard API or outside a secure context. Browser only. */
export function copyText(text: string): Promise<boolean> {
  const nav: any = typeof navigator !== 'undefined' ? navigator : null;
  if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
    return nav.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
  }
  return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') { return false; }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(area);
  return ok;
}

/*
 * Saves an image under a sensible file name. The images live on S3, another
 * origin, where a link's download attribute is ignored, so the file is
 * fetched and saved from memory. If the bucket does not allow that (no CORS
 * header), the image opens in a new tab instead, where a long press or right
 * click saves it. Browser only.
 */
export function downloadImage(url: string, fileName: string): Promise<void> {
  if (!url || typeof window === 'undefined') { return Promise.resolve(); }
  const fallback = () => { window.open(url, '_blank', 'noopener'); };
  if (typeof fetch !== 'function' || typeof URL === 'undefined' || !URL.createObjectURL) {
    fallback();
    return Promise.resolve();
  }
  return fetch(url, { mode: 'cors' })
    .then(res => {
      if (!res.ok) { throw new Error(String(res.status)); }
      return res.blob();
    })
    .then(blob => {
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(href), 10000);
    })
    .catch(fallback);
}

/* A file name from a title: plain ASCII, dashes between words. */
export function fileNameFor(title: string, ext: string): string {
  const base = String(title || 'post')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'post';
  return base + '.' + ext;
}

/* The caption as it is pasted: the text, a blank line, the hashtags. */
export function fullCaption(caption: string, hashtags: string[]): string {
  const tags = (hashtags || []).filter(Boolean).join(' ');
  return [String(caption || '').trim(), tags].filter(Boolean).join('\n\n');
}

/* A colour picker answers "#rrggbb"; members may type "18427a" or "#18427A". */
export function normalizeHex(value: string): string {
  const text = String(value || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(text)) {
    return ('#' + text.split('').map(c => c + c).join('')).toUpperCase();
  }
  return /^[0-9a-f]{6}$/i.test(text) ? ('#' + text).toUpperCase() : '';
}

export function sameHex(a: string, b: string): boolean {
  return !!a && !!b && normalizeHex(a) === normalizeHex(b);
}
