/*
 * Random identifiers made in the browser. Browser only: the server render has
 * no crypto, and domino's window would let a typeof check pass and the next line
 * throw.
 *
 * crypto.randomUUID is reached through `any` because TypeScript 3.7's DOM
 * library does not declare it, and it exists only in secure contexts and in
 * browsers from 2021 on. getRandomValues is everywhere this site runs.
 */

function cryptoSource(): any {
  const w: any = window;
  return w.crypto || w.msCrypto || null;
}

function randomBytes(count: number): Uint8Array {
  const bytes = new Uint8Array(count);
  const c = cryptoSource();
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes);
  } else {
    /* No platform source at all, which no browser this site supports lacks.
     * Weak, but these ids only need to be unlikely to collide; the one that
     * guards anything (the schedule secret) authorizes nothing more than
     * marking the visitor's own request as booked. */
    for (let i = 0; i < count; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

function hex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += ('0' + bytes[i].toString(16)).slice(-2);
  }
  return out;
}

/* A version 4 UUID, which the backend checks for (Joi guid uuidv4). */
export function uuidV4(): string {
  const c = cryptoSource();
  try {
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID();
    }
  } catch (e) {
    /* an insecure context can expose it and still throw */
  }
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = hex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/* `byteCount` random bytes as lowercase hex, twice as many characters. */
export function randomHex(byteCount: number): string {
  return hex(randomBytes(byteCount));
}
