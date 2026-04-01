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
  const communityMatch = url.match(/^\/community\/content\/([a-f0-9]{24})/);
  if (communityMatch) {
    const titleMatch = html.match(/<meta property="og:title" content="(.*?)">/);
    const descMatch = html.match(/<meta (?:property|name)="(?:og:)?description" content="(.*?)">/);
    const imageMatch = html.match(/<meta property="og:image" content="(.*?)">/);
    const title = titleMatch ? titleMatch[1] : '';
    const description = descMatch ? descMatch[1] : '';
    const image = imageMatch ? imageMatch[1] : '';

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description
    };
    if (image) articleSchema.image = image;

    jsonLd = [
      articleSchema,
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.prompthealth.ca" },
          { "@type": "ListItem", "position": 2, "name": "Community", "item": "https://www.prompthealth.ca/community" },
          { "@type": "ListItem", "position": 3, "name": title }
        ]
      }
    ];
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
