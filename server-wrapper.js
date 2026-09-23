// Stub browser globals
const noop = function() { return noop; };
noop.call = noop;
noop.apply = noop;
noop.bind = function() { return noop; };
global.FB = { init: noop, ui: noop, api: noop };
global.Stripe = noop;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection (caught):', reason && reason.message || String(reason).substring(0, 200));
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception (caught):', err.message);
});

const https = require('https');

const originalModule = require('./main.js');
const expressApp = originalModule.app();

/* The same function server.ts renders with, so the cache key and the render
 * cannot disagree about which parameters make a different page. A build that
 * lost the export falls back to caching on the raw URL, which is how this
 * worked before, rather than failing to start. */
const stripTrackingParams = typeof originalModule.stripTrackingParams === 'function'
  ? originalModule.stripTrackingParams : function(url) { return url; };
if (typeof originalModule.stripTrackingParams !== 'function') {
  console.error('[ssr-cache] stripTrackingParams missing from main.js; caching on the raw URL');
}

// --- SEO-021: Category page filtered ItemList JSON-LD ---

/* The slug every category and type URL on the site is built with
 * (src/app/_helpers/slugify.ts), taken from the bundle rather than copied. The
 * copy this file had turned "Stress/Anxiety" into stress-anxiety where the
 * site links stressanxiety: 14 of the 128 goals and provider types could never
 * be matched. A build without the export gets no slugs, and so no ItemList,
 * rather than wrong ones. */
const slugify = typeof originalModule.slugify === 'function'
  ? originalModule.slugify : function() { return ''; };
if (typeof originalModule.slugify !== 'function') {
  console.error('[SEO-021] slugify missing from main.js; no category slugs will load');
}

/* These calls run while a reader's request waits (categoryPreFetch), and
 * https has no timeout of its own. A backend that stops answering would
 * otherwise hold every directory page until nginx gives up at 60 s.
 *
 * The limit is on the whole call, connecting included. req.setTimeout is not
 * enough on Node 14: it arms only once the socket has connected, so a backend
 * that never answered the TCP handshake was waited on for the kernel's connect
 * timeout instead (136 s, logged by a local container). server.ts's render
 * timeout cannot help, because this runs before the render starts. */
const API_TIMEOUT_MS = 10000;

/* Fails the call and tears the request down once API_TIMEOUT_MS has passed,
 * whatever state it is in. Returns what stops the clock. */
function deadlineFor(req, reject) {
  const timer = setTimeout(function() {
    reject(new Error('timeout'));
    req.destroy(new Error('timeout'));
  }, API_TIMEOUT_MS);
  return function() { clearTimeout(timer); };
}

// Simple HTTPS GET returning parsed JSON
function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    let stopClock = function() {};
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        stopClock();
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', (e) => { stopClock(); reject(e); });
    stopClock = deadlineFor(req, reject);
  });
}

// Simple HTTPS POST returning parsed JSON
function httpsPostJson(url, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const postData = JSON.stringify(body);
    let stopClock = function() {};
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        stopClock();
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', (e) => { stopClock(); reject(e); });
    stopClock = deadlineFor(req, reject);
    req.write(postData);
    req.end();
  });
}

// slug -> { id, name }
let categorySlugMap = new Map();

async function fetchCategories(retries) {
  retries = retries || 5;

  // Step 1: Fetch health goal categories from get-service
  /* get-service answers { data: [{ category_type, category: [{ _id, item_text,
   * subCategory: [{ _id, item_text }] }] }] }, one group per category type. The
   * health goals are the 'Goal' group, the same one the category redirect
   * router reads (app.server.redirect-category.module.ts). This used to read
   * data[].item_text and subCategories, which do not exist, and logged "Loaded
   * 0 category slugs" on every start, so no health-goal page ever got its
   * ItemList.
   *
   * Three names occur under two goals each (Natural Remedies, Sexual Health,
   * Oral Care on 2026-09-23). The page resolves a slug to the first match in
   * this same order (CategoryService.categoryListFlatten), so the first one
   * wins here too; letting the last overwrite it listed another goal's
   * providers in the page's ItemList. */
  try {
    var resp = await httpsGetJson('https://ocean.prompthealth.ca/api/v1/questionare/get-service');
    var groups = (resp && Array.isArray(resp.data)) ? resp.data : [];
    var addGoal = function(item) {
      var slug = item.item_text ? slugify(item.item_text) : '';
      if (slug && !categorySlugMap.has(slug)) {
        categorySlugMap.set(slug, { id: item._id, name: item.item_text });
      }
    };
    groups.forEach(function(group) {
      if (String(group.category_type || '').toLowerCase() !== 'goal') return;
      (group.category || []).forEach(function(cat) {
        addGoal(cat);
        (cat.subCategory || []).forEach(addGoal);
      });
    });
    console.log('[SEO-021] Loaded', categorySlugMap.size, 'category slugs from get-service');
  } catch (e) {
    console.error('[SEO-021] fetchCategories get-service error:', e.message);
    if (retries > 0) {
      setTimeout(function() { fetchCategories(retries - 1); }, 2000);
      return;
    }
  }

  // Step 2: Fetch provider types from get-questions?type=SP
  try {
    var resp2 = await httpsGetJson('https://ocean.prompthealth.ca/api/v1/questionare/get-questions?type=SP');
    var questions = (resp2 && resp2.data) ? resp2.data : [];
    questions.forEach(function(q) {
      if (q.slug === 'providers-are-you' && q.answers) {
        q.answers.forEach(function(ans) {
          if (ans.item_text && ans._id) {
            var slug = slugify(ans.item_text);
            if (slug && !categorySlugMap.has(slug)) {
              categorySlugMap.set(slug, { id: ans._id, name: ans.item_text });
            }
          }
        });
      }
    });
    console.log('[SEO-021] Total slugs after provider types:', categorySlugMap.size);
  } catch (e) {
    console.error('[SEO-021] fetchCategories get-questions error:', e.message);
  }
}

/* A type or health-goal directory page without a city: /practitioners/type/<slug>
 * or /practitioners/category/<slug>, with an optional trailing slash. The
 * filtered list below is fetched without a location, so it describes only
 * these, never /practitioners/type/<slug>/<city>. */
const CATEGORY_PAGE = /^\/practitioners\/(?:category|type)\/([^?/#]+)\/?(?:[?#]|$)/;

/* JSON for a script element. Provider names and image keys come from the API
 * and are written by providers, and a '</script>' in one would end the
 * element early and put the rest into the page as markup. Written as <,
 * '<' is the same character to a JSON reader. */
function ldJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function fetchFilteredPractitioners(categoryId) {
  return httpsPostJson('https://ocean.prompthealth.ca/api/v1/user/filter', {
    services: [categoryId],
    count: 20,
    page: 1,
    rating: 0,
    gender: [],
    languageId: [],
    typical_hours: [],
    price_per_hours: [],
    age_range: [],
    serviceOfferIds: [],
    latLong: '',
    miles: null,
  });
}

// Fetch categories at startup (non-blocking)
fetchCategories();

/* The schema goes in first thing in the head. It used to go before '</head>',
 * which String.replace finds at its first occurrence, and a head meta can hold
 * text a provider wrote (og:title carries their name). Domino escapes only &
 * and " in an attribute value, so a name holding '</head>' took the insertion:
 * the script's own quote ended the attribute, and the rest of the name was
 * read as markup, then cached and served to everyone for 30 minutes. Nothing a
 * provider writes can come before the opening tag. The charset is declared in
 * the Content-Type header, which a browser reads before any meta, so the
 * charset meta moving further down does not matter. */
function intoHead(html, script) {
  return html.replace(/<head(?:\s[^>]*)?>/i, function(tag) { return tag + script; });
}

// Extract content from a meta tag by property or name
function extractMeta(html, attr) {
  // Try property first (og:*), then name
  const propRegex = new RegExp('<meta\\s+property="' + attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"\\s+content="([^"]*)"', 'i');
  const nameRegex = new RegExp('<meta\\s+name="' + attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"\\s+content="([^"]*)"', 'i');
  const match = html.match(propRegex) || html.match(nameRegex);
  return match ? match[1] : '';
}

// JSON-LD injection function
function injectJsonLd(url, html, categoryPractitioners) {
  if (typeof html !== 'string') return html;
  let jsonLd = null;

  // SEO-064: Angular-rendered JSON-LD is now the source of truth for the
  // homepage (home.component.ts emits a @graph) and the FAQ page
  // (faq.component.ts emits FAQPage). This wrapper previously appended a
  // second <script id="json-ld-schema"> before </head> for both, which
  // produced two JSON-LD blocks (and duplicate DOM IDs) in SSR output.
  // Those static blocks are deliberately removed here.

  // Community content pages. PageComponent renders the page's JSON-LD (an
  // Article, or an Event for an event, with a BreadcrumbList); this never adds
  // a second block beside it.
  /* On the slug address (articles and events) the page's schema is left
   * exactly as PageComponent rendered it. An event's Event is built there from
   * the post itself. It used to be made here instead, by scraping the rendered
   * page for the first date, venue and Register link anywhere in it, so text an
   * author wrote into the title or summary in the head came first and could set
   * the dates, and one that was not a real date threw inside res.send and left
   * the request unanswered. The enrichment below was written for the id route
   * and would, for one, replace the author's /practitioners/<slug> link with
   * whichever profile id the page mentions first. */
  if (/^\/community\/article\/[^/?#]+/.test(url)) {
    return html;
  }

  // /community/content/<mongoId>: notes, promos, and posts without a slug.
  // Their Article is enriched with the fields PageComponent leaves out.
  const communityMatch = url.match(/^\/community\/content\/([a-f0-9]{24})/);
  if (communityMatch) {
    const baseUrl = 'https://www.prompthealth.ca';
    /* A page's own address in its schema is its canonical. Built from the
     * request, an ad click's ?utm_...&fbclid=... became this page's url and
     * mainEntityOfPage. Use the canonical the page rendered, and fall back to
     * the bare path. */
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    const pageUrl = canonical
      ? canonical[1].replace(/&amp;/g, '&')
      : baseUrl + url.split('#')[0].split('?')[0];

    // Find and parse the existing Angular-rendered JSON-LD
    const ldRegex = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g;
    let ldMatch;
    while ((ldMatch = ldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(ldMatch[1]);
        if (!Array.isArray(data)) continue;

        const article = data.find(d => d['@type'] === 'Article');
        const breadcrumb = data.find(d => d['@type'] === 'BreadcrumbList');
        if (!article) continue;

        article.url = pageUrl;
        article.mainEntityOfPage = pageUrl;
        article.publisher = {
          "@type": "Organization",
          "name": "PromptHealth",
          // The file is 800x350; 600 described an image that does not exist.
          "logo": { "@type": "ImageObject", "url": baseUrl + "/assets/img/prompthealth.png", "width": 800, "height": 350 }
        };

        if (article.datePublished && !article.dateModified) {
          article.dateModified = article.datePublished;
        }

        if (article.author && article.author.name) {
          const authorIdMatch = html.match(/community\/profile\/([a-f0-9]{24})/);
          if (authorIdMatch) {
            article.author.url = baseUrl + '/community/profile/' + authorIdMatch[1];
          }
        }

        if (article.image && !article.image.startsWith('http')) {
          article.image = baseUrl + (article.image.startsWith('/') ? '' : '/') + article.image;
        }
        if (!article.image) {
          article.image = baseUrl + '/assets/img/prompthealth.png';
        }

        if (breadcrumb && breadcrumb.itemListElement) {
          const lastItem = breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1];
          if (lastItem && !lastItem.item) {
            lastItem.item = pageUrl;
          }
        }

        // Replace the original JSON-LD block with enhanced version. ldJson,
        // because JSON.parse above turned the page's escaped '<' back into a
        // real one. Replaced through a function, so a '$' in the text is
        // written as it is rather than read as a replacement pattern.
        const enhanced = '<script type="application/ld+json">' + ldJson(data) + '</script>';
        html = html.replace(ldMatch[0], function() { return enhanced; });
        break; // Only enhance the first matching block
      } catch (e) {
        // Skip unparseable blocks
      }
    }
    // Don't inject a second block for community content pages
    return html;
  }

  // Profile pages: /community/profile/<mongoId>
  const profileMatch = url.match(/^\/community\/profile\/([a-f0-9]{24})/);
  if (profileMatch) {
    const baseUrl = 'https://www.prompthealth.ca';
    const pageUrl = baseUrl + '/community/profile/' + profileMatch[1];

    // Extract data from SSR-rendered meta tags
    const ogTitle = extractMeta(html, 'og:title');
    const ogDesc = extractMeta(html, 'og:description');
    const ogImage = extractMeta(html, 'og:image');

    // Parse name and location from title: "Name in City, State | PromptHealth Community"
    let profileName = '';
    let city = '';
    let region = '';
    if (ogTitle) {
      const titleMatch = ogTitle.match(/^(.+?)\s+in\s+(.*?),\s*(.*?)\s*\|/);
      if (titleMatch) {
        profileName = titleMatch[1].trim();
        city = titleMatch[2].trim();
        region = titleMatch[3].trim();
      } else {
        // Fallback: "Name | PromptHealth Community"
        const simpleMatch = ogTitle.match(/^(.+?)\s*\|/);
        if (simpleMatch) profileName = simpleMatch[1].trim();
      }
    }

    // Parse jobTitle from description: "Name is Specialty offering ..."
    let jobTitle = '';
    if (ogDesc && profileName) {
      const descMatch = ogDesc.match(new RegExp('^' + profileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+is\\s+(.+?)\\s+offering'));
      if (descMatch) jobTitle = descMatch[1].trim();
    }

    if (profileName) {
      const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': profileName,
        'url': pageUrl,
      };

      if (ogDesc) personSchema.description = ogDesc;

      // Use profile image if it's not the default
      if (ogImage && !ogImage.includes('/assets/img/prompthealth')) {
        personSchema.image = ogImage;
      }

      if (jobTitle) personSchema.jobTitle = jobTitle;

      // Add address if city or region available
      if (city || region) {
        const address = { '@type': 'PostalAddress' };
        if (city) address.addressLocality = city;
        if (region) address.addressRegion = region;
        personSchema.address = address;
      }

      // Check for organization in rendered HTML
      const orgMatch = html.match(/<[^>]*class="[^"]*organization[^"]*"[^>]*>([^<]+)/i);
      if (orgMatch && orgMatch[1].trim()) {
        personSchema.worksFor = {
          '@type': 'Organization',
          'name': orgMatch[1].trim()
        };
      }

      jsonLd = [personSchema];
    }
  }

  // Category listing pages: /practitioners/category/:slug or /practitioners/type/:slug (SEO-021)
  /* A fallback, not a replacement. ExpertFinderComponent renders its own
   * ItemList from the listing the reader sees, in one script with the page's
   * BreadcrumbList and FAQPage. This used to swap that whole script for the
   * list below, which deleted the breadcrumb and the FAQ from every type page,
   * and would have from every goal page once their slugs loaded; the browser
   * never puts them back, because JsonLdService keeps what the server rendered.
   * It also replaced the page's list (rating, phone, price, the results on
   * screen) with one from a different call. So a page that has its own
   * ItemList is left alone, and this list is added only when it has none, as
   * when its listing call failed, into the page's script when there is one so
   * the breadcrumb and FAQ stay beside it.
   *
   * City pages (/practitioners/type/<type>/<city>) never get it: the list is
   * fetched without a location, so it named the city and listed providers from
   * across the country. CATEGORY_PAGE matches no city segment. */
  const categoryMatch = url.match(CATEGORY_PAGE);
  if (categoryMatch && categoryPractitioners && categoryPractitioners.length > 0) {
    const baseUrl = 'https://www.prompthealth.ca';
    var catSlug = categoryMatch[1];
    var catInfo = categorySlugMap.get(catSlug);
    var specialist = catInfo ? catInfo.name : catSlug.split('-').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
    var listName = 'Find Best ' + specialist + ' in Canada';
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': listName,
      'numberOfItems': categoryPractitioners.length,
      'itemListElement': categoryPractitioners.map(function(p, i) {
        // Each element is { userId, userData: IUserDetail, ans: [...] }
        var ud = p.userData || {};
        const item = {
          '@type': 'ProfessionalService',
          'name': [ud.firstName, ud.lastName].filter(Boolean).join(' ') || 'Practitioner',
          'url': baseUrl + '/practitioners/' + (ud.slug || p.userId),
        };
        if (ud.profileImage) {
          var img = ud.profileImage;
          if (img && !img.startsWith('http')) {
            img = baseUrl + (img.startsWith('/') ? '' : '/') + img;
          }
          item.image = img;
        }
        if (ud.city || ud.state) {
          item.address = { '@type': 'PostalAddress', 'addressCountry': 'CA' };
          if (ud.city) item.address.addressLocality = ud.city;
          if (ud.state) item.address.addressRegion = ud.state;
        }
        return { '@type': 'ListItem', 'position': i + 1, 'item': item };
      }),
    };

    var ldRegex = /(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/g;
    var pageScript = null;
    var ldMatch;
    while ((ldMatch = ldRegex.exec(html)) !== null) {
      var parsed;
      try { parsed = JSON.parse(ldMatch[2]); } catch (e) { continue; }
      var blocks = Array.isArray(parsed) ? parsed : [parsed];
      if (blocks.some(function(d) { return d && d['@type'] === 'ItemList'; })) {
        return html;
      }
      if (!pageScript) pageScript = { whole: ldMatch[0], open: ldMatch[1], blocks: blocks, close: ldMatch[3] };
    }
    /* Replaced through a function, so a '$' in a name or a price is written
     * as it is rather than read as a replacement pattern. */
    if (pageScript) {
      var merged = pageScript.open + ldJson([itemList].concat(pageScript.blocks)) + pageScript.close;
      return html.replace(pageScript.whole, function() { return merged; });
    }
    return intoHead(html, '<script type="application/ld+json">' + ldJson(itemList) + '</script>');
  }

  if (jsonLd) {
    const script = '<script type="application/ld+json" id="json-ld-schema">' + ldJson(jsonLd) + '</script>';
    html = intoHead(html, script);
  }

  return html;
}

/* Schema improves a page; it is never a reason to lose one. injectJsonLd runs
 * inside res.send, so a throw there rejected the render's promise, and
 * ngExpressEngine called server.ts's callback a second time with the error.
 * That callback had already marked the request answered, so nothing ever
 * answered it: nginx waited out its limit and then answered 502 for every page
 * for ten seconds, and since the page was never cached, every request for it
 * did the same. So a failure here sends, and caches, the page as rendered. Only
 * the path is logged: a query can carry a token. */
function withJsonLd(key, html, categoryPractitioners) {
  try {
    return injectJsonLd(key, html, categoryPractitioners);
  } catch (e) {
    console.error('[json-ld] skipped for ' + key.split('?')[0] + ': ' + (e && e.message || e));
    return html;
  }
}

// No-op: script deferring removed to prevent hydration mismatch
function deferScripts(html) {
  return html;
}

// SSR cache.
//
// One entry per page, keyed on the address without tracking parameters, kept
// for 30 minutes. Entries leave oldest first: a Map keeps insertion order, and
// storeEntry always removes a key before setting it again, so insertion order
// is also age order. Everything that removes an entry goes through dropEntry,
// or the byte count drifts.
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE = 500;
/* The container was OOM-killed about every 90 minutes (anon-rss 505 MB against a
 * 512 MB limit), and every kill dropped the requests in flight and emptied this
 * cache. Capped only by count, 500 pages of 50 to 270 kB could hold 250 MB, and
 * an expired page stayed until its own address was asked for again. So the
 * budget is in bytes, counted as the heap holds them, and expired pages leave
 * whenever anything is stored. */
const MAX_CACHE_BYTES = 64 * 1024 * 1024;
let cacheBytes = 0;

/* V8 keeps a string at one byte a character only while every character is
 * Latin-1. One curly quote or dash puts the whole page at two, and every page
 * measured on 2026-09-23 had some. */
function heapBytesOf(html) {
  return /[^\u0000-\u00ff]/.test(html) ? html.length * 2 : html.length;
}

function freshEntry(key) {
  const entry = cache.get(key);
  return (entry && (Date.now() - entry.time < CACHE_TTL)) ? entry : null;
}

function dropEntry(key) {
  const entry = cache.get(key);
  if (!entry) return;
  cacheBytes -= entry.bytes;
  cache.delete(key);
}

function storeEntry(key, html) {
  dropEntry(key);
  const bytes = heapBytesOf(html);
  if (bytes > MAX_CACHE_BYTES) return;
  const now = Date.now();
  for (const [oldKey, oldEntry] of cache) {
    if (now - oldEntry.time < CACHE_TTL) break;
    dropEntry(oldKey);
  }
  while (cache.size > 0 && (cache.size >= MAX_CACHE || cacheBytes + bytes > MAX_CACHE_BYTES)) {
    dropEntry(cache.keys().next().value);
  }
  cache.set(key, { html: html, time: now, bytes: bytes });
  cacheBytes += bytes;
}

// Inject cache layer AFTER expressInit+compression (position 3) but before routes
const Layer = Object.getPrototypeOf(expressApp._router.stack[0]).constructor;

const cacheLayer = new Layer('/', { strict: false, end: false }, function ssrCache(req, res, next) {
  if (req.method !== 'GET' || req.url.startsWith('/api') || req.url.startsWith('/stripe') || req.url.startsWith('/sitemap')) {
    return next();
  }

  /* Every ad click carries an id unique to that click, so keyed on the raw URL
   * each one missed, cost a full render on a 1-vCPU box and evicted a page a
   * crawler had warmed. server.ts renders from this same stripped address, so
   * what is stored is exactly what a request without the parameters gets, and
   * an ad click now warms the cache instead of emptying it.
   *
   * The dot test is on the key, after the tracking parameters are gone. On the
   * whole URL it also skipped every page whose query had a dot in it
   * (utm_source=chatgpt.com, l.facebook.com), so those rendered on every
   * request. A dot anywhere else still bypasses the cache, as before: static
   * files, and queries such as ?url=http://... that no page needs cached. */
  const key = stripTrackingParams(req.url);
  if (key.includes('.')) {
    return next();
  }

  const entry = freshEntry(key);
  if (entry) {
    res.set('X-Cache', 'HIT');
    return res.send(entry.html);
  }
  dropEntry(key);

  // Patch res.send once to capture SSR output and inject JSON-LD
  const _send = res.send.bind(res);
  res.send = function(body) {
    res.send = _send; // restore
    const isPage = typeof body === 'string' && body.length > 500;
    // Inject JSON-LD before caching
    if (isPage) {
      body = withJsonLd(key, body, req._categoryPractitioners);
      body = deferScripts(body);
    }
    if (isPage && res.statusCode === 200) {
      storeEntry(key, body);
    }
    /* Sent only on a hit, a miss and a bypass looked the same to anyone
     * checking whether a page was cached. */
    if (isPage && !res.headersSent) {
      res.set('X-Cache', 'MISS');
    }
    return _send(body);
  };

  /* server.ts answers a render still running at its timeout with the client
   * shell, and the render's page arrives later with no response left to go
   * in. It is kept here instead, unless a fresher copy got there first. Thrown
   * away, a page that renders slowly under load could never be cached: every
   * request for it paid for a full render nobody saw, on a 1-vCPU box. */
  req._ssrStoreLate = function(html) {
    if (typeof html !== 'string' || html.length <= 500 || freshEntry(key)) return;
    storeEntry(key, deferScripts(withJsonLd(key, html, req._categoryPractitioners)));
  };

  next();
});
cacheLayer.route = undefined;

// Insert after query(0), expressInit(1), compression(2) = at index 3
expressApp._router.stack.splice(3, 0, cacheLayer);

// SEO-021: Pre-fetch filtered practitioners for category pages before caching
const categoryLayer = new Layer('/', { strict: false, end: false }, function categoryPreFetch(req, res, next) {
  var catMatch = req.url.match(CATEGORY_PAGE);
  if (!catMatch) return next();

  var slug = catMatch[1];
  var catInfo = categorySlugMap.get(slug);
  if (!catInfo) return next();

  /* A page the cache layer is about to serve needs nothing fetched. This used
   * to delete the entry on every request instead, so type and category pages
   * were never served from the cache (5 to 7 s each, measured on
   * /practitioners/type/dentist), and every render still stored an entry that
   * nothing would read, evicting pages that would have been. The ItemList is
   * built at render time and ages with its page, on the same 30 minutes as
   * every other page. */
  if (freshEntry(stripTrackingParams(req.url))) return next();

  fetchFilteredPractitioners(catInfo.id)
    .then(function(resp) {
      // API returns { data: { dataArr: [...], total: N } } — extract the array
      req._categoryPractitioners = (resp && resp.data && resp.data.dataArr) ? resp.data.dataArr : [];
      next();
    })
    .catch(function() {
      // Graceful degradation — leave HTML unchanged
      next();
    });
});
categoryLayer.route = undefined;
// Insert at index 3 (pushes cacheLayer to index 4) so categories are pre-fetched before cache check
expressApp._router.stack.splice(3, 0, categoryLayer);

const port = process.env.PORT || 4000;
expressApp.listen(port, () => {
  console.log(`SSR server (cached + stubs + JSON-LD) listening on http://localhost:${port}`);
});
