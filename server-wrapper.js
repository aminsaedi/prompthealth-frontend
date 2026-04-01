// Stub browser globals
const noop = function() { return noop; };
noop.call = noop;
noop.apply = noop;
noop.bind = function() { return noop; };
global.fbq = noop;
global.ga = noop;
global.gtag = noop;
global.dataLayer = [];
global.FB = { init: noop, ui: noop, api: noop };
global.Stripe = noop;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection (caught):', reason && reason.message || String(reason).substring(0, 200));
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception (caught):', err.message);
});

const originalModule = require('./main.js');
const expressApp = originalModule.app();

// JSON-LD injection function
function injectJsonLd(url, html) {
  if (typeof html !== 'string') return html;
  let jsonLd = null;

  // Homepage
  if (url === '/' || url === '') {
    jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PromptHealth",
        "url": "https://www.prompthealth.ca",
        "logo": "https://www.prompthealth.ca/assets/img/prompthealth.png",
        "description": "Your Wellness Navigator"
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "PromptHealth",
        "url": "https://www.prompthealth.ca"
      }
    ];
  }

  // Community content pages: /community/<mongoId>
  // The Angular SSR already renders a JSON-LD block with Article + BreadcrumbList.
  // We enhance it with missing fields rather than injecting a duplicate.
  const communityMatch = url.match(/^\/community\/content\/([a-f0-9]{24})/);
  if (communityMatch) {
    const baseUrl = 'https://www.prompthealth.ca';
    const pageUrl = baseUrl + url;

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

        // Enrich Article schema
        article.url = pageUrl;
        article.mainEntityOfPage = pageUrl;
        article.publisher = {
          "@type": "Organization",
          "name": "PromptHealth",
          "logo": { "@type": "ImageObject", "url": baseUrl + "/assets/img/prompthealth.png" }
        };

        // dateModified = datePublished if not set
        if (article.datePublished && !article.dateModified) {
          article.dateModified = article.datePublished;
        }

        // Add author profile URL if author exists
        if (article.author && article.author.name) {
          // Extract authorId from the page HTML (Angular renders it in component state)
          const authorIdMatch = html.match(/community\/profile\/([a-f0-9]{24})/);
          if (authorIdMatch) {
            article.author.url = baseUrl + '/community/profile/' + authorIdMatch[1];
          }
        }

        // Ensure image is absolute URL
        if (article.image && !article.image.startsWith('http')) {
          article.image = baseUrl + (article.image.startsWith('/') ? '' : '/') + article.image;
        }
        if (!article.image) {
          article.image = baseUrl + '/assets/img/prompthealth.png';
        }

        // Fix BreadcrumbList: add URL to last item
        if (breadcrumb && breadcrumb.itemListElement) {
          const lastItem = breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1];
          if (lastItem && !lastItem.item) {
            lastItem.item = pageUrl;
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
    // Don't inject a second block for community pages
    return html;
  }

  if (jsonLd) {
    const script = '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>';
    html = html.replace('</head>', script + '</head>');
  }

  return html;
}

// Simple cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE = 200;

// Inject cache layer AFTER expressInit+compression (position 3) but before routes
const Layer = Object.getPrototypeOf(expressApp._router.stack[0]).constructor;

const cacheLayer = new Layer('/', { strict: false, end: false }, function ssrCache(req, res, next) {
  if (req.method !== 'GET' || req.url.includes('.') || req.url.startsWith('/api') || req.url.startsWith('/stripe') || req.url.startsWith('/sitemap')) {
    return next();
  }

  const key = req.url;
  const entry = cache.get(key);
  if (entry && (Date.now() - entry.time < CACHE_TTL)) {
    res.set('X-Cache', 'HIT');
    return res.send(entry.html);
  }
  if (entry) cache.delete(key);

  // Patch res.send once to capture SSR output and inject JSON-LD
  const _send = res.send.bind(res);
  res.send = function(body) {
    res.send = _send; // restore
    // Inject JSON-LD before caching
    if (typeof body === 'string' && body.length > 500) {
      body = injectJsonLd(req.originalUrl, body);
    }
    if (typeof body === 'string' && body.length > 500 && res.statusCode === 200) {
      if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
      cache.set(key, { html: body, time: Date.now() });
    }
    return _send(body);
  };

  next();
});
cacheLayer.route = undefined;

// Insert after query(0), expressInit(1), compression(2) = at index 3
expressApp._router.stack.splice(3, 0, cacheLayer);

const port = process.env.PORT || 4000;
expressApp.listen(port, () => {
  console.log(`SSR server (cached + stubs + JSON-LD) listening on http://localhost:${port}`);
});
