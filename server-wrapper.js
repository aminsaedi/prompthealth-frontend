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
 * otherwise hold every directory page until nginx gives up at 60 s. */
const API_TIMEOUT_MS = 10000;

// Simple HTTPS GET returning parsed JSON
function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(API_TIMEOUT_MS, () => { req.destroy(new Error('timeout')); });
  });
}

// Simple HTTPS POST returning parsed JSON
function httpsPostJson(url, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const postData = JSON.stringify(body);
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
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(API_TIMEOUT_MS, () => { req.destroy(new Error('timeout')); });
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
   * ItemList. */
  try {
    var resp = await httpsGetJson('https://ocean.prompthealth.ca/api/v1/questionare/get-service');
    var groups = (resp && Array.isArray(resp.data)) ? resp.data : [];
    groups.forEach(function(group) {
      if (String(group.category_type || '').toLowerCase() !== 'goal') return;
      (group.category || []).forEach(function(cat) {
        var slug = cat.item_text ? slugify(cat.item_text) : '';
        if (slug) {
          categorySlugMap.set(slug, { id: cat._id, name: cat.item_text });
        }
        (cat.subCategory || []).forEach(function(sub) {
          var subSlug = sub.item_text ? slugify(sub.item_text) : '';
          if (subSlug) {
            categorySlugMap.set(subSlug, { id: sub._id, name: sub.item_text });
          }
        });
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

  // Community content pages: /community/<mongoId>
  // The Angular SSR already renders a JSON-LD block with Article + BreadcrumbList.
  // We enhance it with missing fields rather than injecting a duplicate.
  // For event-type posts, we convert Article to Event schema.
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

    // Detect if this is an event post by looking for event-specific HTML
    // The event card renders dates like "yyyy/MM/dd hh:mm AM/PM - yyyy/MM/dd hh:mm AM/PM (your local time)"
    const isEventPost = /class="status-indicator[\s\S]*?\(your local time\)/.test(html);

    // Extract event details from rendered HTML if this is an event
    let eventStartDate = null;
    let eventEndDate = null;
    let eventLocation = null;
    let isVirtualEvent = false;
    let eventLink = null;

    if (isEventPost) {
      // Extract dates: "2024/03/15 02:00 PM - 2024/03/15 04:00 PM (your local time)"
      const dateMatch = html.match(/(\d{4}\/\d{2}\/\d{2}\s+\d{1,2}:\d{2}\s+[AP]M)\s*-\s*(\d{4}\/\d{2}\/\d{2}\s+\d{1,2}:\d{2}\s+[AP]M)\s*\(your local time\)/);
      if (dateMatch) {
        eventStartDate = new Date(dateMatch[1]).toISOString();
        eventEndDate = new Date(dateMatch[2]).toISOString();
      }

      // Check if virtual: icon "video-camera" means online
      isVirtualEvent = /iconPh="video-camera"/.test(html) || /Virtual event/.test(html);

      // Extract venue/location text
      if (isVirtualEvent) {
        const venueMatch = html.match(/iconPh="video-camera"[\s\S]*?<span[^>]*>\s*(?:<ng-container[^>]*>)?\s*(?:On\s+)?(\w[\w\s]*?)(?:<\/ng-container>)?\s*<\/span>/);
        if (venueMatch) {
          eventLocation = { '@type': 'VirtualLocation', 'url': '' };
        } else {
          eventLocation = { '@type': 'VirtualLocation', 'name': 'Online Event' };
        }
      } else {
        const addressMatch = html.match(/iconPh="pin"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
        if (addressMatch) {
          const addr = addressMatch[1].replace(/<[^>]+>/g, '').replace(/At\s+/i, '').trim();
          if (addr) {
            eventLocation = { '@type': 'Place', 'name': addr, 'address': addr };
          }
        }
      }

      // Extract registration link
      const linkMatch = html.match(/href="(https?:\/\/[^"]+)"[^>]*>\s*Register\s*<\/a>/i);
      if (linkMatch) {
        eventLink = linkMatch[1];
        if (isVirtualEvent && eventLocation && eventLocation['@type'] === 'VirtualLocation') {
          eventLocation.url = linkMatch[1];
        }
      }
    }

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

        if (isEventPost) {
          // Convert Article to Event schema
          const eventSchema = {
            '@context': 'https://schema.org',
            '@type': 'Event',
            'name': article.headline || '',
            'description': article.description || '',
            'url': pageUrl,
            'image': article.image || '',
          };

          if (eventStartDate) eventSchema.startDate = eventStartDate;
          if (eventEndDate) eventSchema.endDate = eventEndDate;

          if (eventLocation) {
            eventSchema.location = eventLocation;
          }

          // Organizer from author
          if (article.author && article.author.name) {
            eventSchema.organizer = { '@type': 'Person', 'name': article.author.name };
            const authorIdMatch = html.match(/community\/profile\/([a-f0-9]{24})/);
            if (authorIdMatch) {
              eventSchema.organizer.url = baseUrl + '/community/profile/' + authorIdMatch[1];
            }
          }

          // Ensure image is absolute
          if (eventSchema.image && !eventSchema.image.startsWith('http')) {
            eventSchema.image = baseUrl + (eventSchema.image.startsWith('/') ? '' : '/') + eventSchema.image;
          }
          if (!eventSchema.image) {
            eventSchema.image = baseUrl + '/assets/img/prompthealth.png';
          }

          // Replace Article with Event in the data array
          const articleIdx = data.indexOf(article);
          data[articleIdx] = eventSchema;

          // Fix BreadcrumbList
          if (breadcrumb && breadcrumb.itemListElement) {
            const lastItem = breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1];
            if (lastItem && !lastItem.item) {
              lastItem.item = pageUrl;
            }
          }
        } else {
          // Enrich Article schema (non-event posts)
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
        }

        // Replace the original JSON-LD block with enhanced version
        const enhanced = '<script type="application/ld+json">' + JSON.stringify(data) + '</script>';
        html = html.replace(ldMatch[0], enhanced);
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
  const categoryMatch = url.match(/^\/practitioners\/(?:category|type)\/([^?/]+)(?:\/([^?/]+))?/);
  if (categoryMatch && categoryPractitioners && categoryPractitioners.length > 0) {
    const baseUrl = 'https://www.prompthealth.ca';
    // Build dynamic ItemList name from slug + optional city (SEO-029)
    var catSlug = categoryMatch[1];
    var citySlug = categoryMatch[2];
    var catInfo = categorySlugMap.get(catSlug);
    var specialist = catInfo ? catInfo.name : catSlug.split('-').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
    var cityName = citySlug ? citySlug.split('-').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ') : 'Canada';
    var listName = 'Find Best ' + specialist + ' in ' + cityName;
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

    // Replace existing Angular-rendered ItemList JSON-LD if present
    var ldRegex = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g;
    var ldMatch;
    var replaced = false;
    while ((ldMatch = ldRegex.exec(html)) !== null) {
      try {
        var parsed = JSON.parse(ldMatch[1]);
        var isItemList = (parsed && parsed['@type'] === 'ItemList') ||
          (Array.isArray(parsed) && parsed.some(function(d) { return d['@type'] === 'ItemList'; }));
        if (isItemList) {
          html = html.replace(ldMatch[0], '<script type="application/ld+json">' + JSON.stringify(itemList) + '</script>');
          replaced = true;
          break;
        }
      } catch (e) { /* skip unparseable */ }
    }
    if (!replaced) {
      html = html.replace('</head>', '<script type="application/ld+json">' + JSON.stringify(itemList) + '</script></head>');
    }
    return html;
  }

  if (jsonLd) {
    const script = '<script type="application/ld+json" id="json-ld-schema">' + JSON.stringify(jsonLd) + '</script>';
    html = html.replace('</head>', script + '</head>');
  }

  return html;
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
      body = injectJsonLd(key, body, req._categoryPractitioners);
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

  next();
});
cacheLayer.route = undefined;

// Insert after query(0), expressInit(1), compression(2) = at index 3
expressApp._router.stack.splice(3, 0, cacheLayer);

// SEO-021: Pre-fetch filtered practitioners for category pages before caching
const categoryLayer = new Layer('/', { strict: false, end: false }, function categoryPreFetch(req, res, next) {
  var catMatch = req.url.match(/^\/practitioners\/(?:category|type)\/([^?/]+)/);
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
