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

// Extract content from a meta tag by property or name
function extractMeta(html, attr) {
  // Try property first (og:*), then name
  const propRegex = new RegExp('<meta\\s+property="' + attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"\\s+content="([^"]*)"', 'i');
  const nameRegex = new RegExp('<meta\\s+name="' + attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"\\s+content="([^"]*)"', 'i');
  const match = html.match(propRegex) || html.match(nameRegex);
  return match ? match[1] : '';
}

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
        "description": "Your Wellness Navigator",
        "sameAs": [
          "https://www.facebook.com/PromptHealth/",
          "https://www.instagram.com/prompthealth/",
          "https://www.linkedin.com/company/prompthealth/",
          "https://www.youtube.com/channel/UCnMigPMOdit9i6koo3-VSMg",
          "https://twitter.com/PromptHealth"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "PromptHealth",
        "url": "https://www.prompthealth.ca"
      }
    ];
  }

  // FAQ page
  if (url === '/faq' || url.startsWith('/faq?')) {
    jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is PromptHealth?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PromptHealth is a network of holistic care practitioners. It empowers providers to showcase their knowledge in different formats for better online exposure and to educate the wellness community. They can also collaborate with other practitioners and with PromptHealth, itself. Wellness seekers can learn directly from the trusted sources and connect when the need arises."
            }
          },
          {
            "@type": "Question",
            "name": "How does PromptHealth work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can navigate PromptHealth based on your need or goal. You can search, compare options, learn from different options provided based on preferences, and ultimately connect and book with a provider fully informed. Navigating the site and learning from different practitioners is easy to do with no login required. The only time you need to sign up is at the time of booking on the site or when using the app."
            }
          },
          {
            "@type": "Question",
            "name": "How do I find a practitioner?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PromptHealth has a number of ways for you to find the right wellness provider. You can simply scroll through and browse the providers listed on the marketplace based on location or virtual options. You can start with the search bar and type in a practitioner type, condition, or search a specific practitioner. You can also use the personal match to help you filter options based on your specific needs."
            }
          },
          {
            "@type": "Question",
            "name": "How can I learn more about each service?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We are the first social platform in health and wellness that enables providers to create educational content in different formats so you can keep coming back to learn from them. You can follow different providers based on the category that you are most interested in and receive notification every time a new health information is shared in that category."
            }
          },
          {
            "@type": "Question",
            "name": "How do I book a practitioner?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Once you've found your provider out of the options you are provided, you can either directly book with them if they already have a direct booking system, or use our request booking form if they do not have a booking system. The payment process is handled by each provider directly as per their policy."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to enter any personal health information in?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. We do not require users to enter in any personal health information. Our personal match option that helps users filter care options asks for some basic demographic information but it is not mandatory."
            }
          },
          {
            "@type": "Question",
            "name": "How does PromptHealth verify its practitioners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We have done our due diligence by doing a qualitative review on each provider upon sign up to ensure credibility of information provided. The providers with a verified badge in the form of a blue check mark beside their names have provided proof of their certification."
            }
          },
          {
            "@type": "Question",
            "name": "I want my search to be even more personalized, but don't see a filter that applies. What can I do?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "If you have suggestions for new filters to help improve your search further, or you have a wish list, please contact us at info@prompthealth.ca. We would love your feedback and always strive to improve our platform to offer what you need."
            }
          }
        ]
      }
    ];
  }

  // Community content pages: /community/<mongoId>
  // The Angular SSR already renders a JSON-LD block with Article + BreadcrumbList.
  // We enhance it with missing fields rather than injecting a duplicate.
  // For event-type posts, we convert Article to Event schema.
  const communityMatch = url.match(/^\/community\/content\/([a-f0-9]{24})/);
  if (communityMatch) {
    const baseUrl = 'https://www.prompthealth.ca';
    const pageUrl = baseUrl + url;

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
            "logo": { "@type": "ImageObject", "url": baseUrl + "/assets/img/prompthealth.png" }
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

  if (jsonLd) {
    const script = '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>';
    html = html.replace('</head>', script + '</head>');
  }

  return html;
}

// No-op: script deferring removed to prevent hydration mismatch
function deferScripts(html) {
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
      body = deferScripts(body);
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
