import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { locations } from 'src/app/_helpers/location-data';
import { slugify } from 'src/app/_helpers/slugify';
import { isIndexableCityCategory, isIndexableCityType } from 'src/app/_helpers/indexable-combos';
import { staticPages } from 'src/app/static-page-dates';

const apiURL = environment.config.API_URL;
const baseURL = environment.config.FRONTEND_BASE;

import { default as axios } from 'axios';
import { QuestionnaireAnswer } from './shared/services/questionnaire.service';
const rSitemap = Router();

// Simple cache for expensive sitemaps (PH-022)
const sitemapCache: { [key: string]: { xml: string, time: number } } = {};
const SITEMAP_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCachedSitemap(key: string): string | null {
  const entry = sitemapCache[key];
  if (entry && (Date.now() - entry.time < SITEMAP_CACHE_TTL)) {
    return entry.xml;
  }
  return null;
}

rSitemap.get('/main', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(sitemapMain);
});

rSitemap.get('/practitioners', async (req, res) => {
  const cached = getCachedSitemap('practitioners');
  if (cached) {
    res.set('Content-Type', 'text/xml');
    return res.send(cached);
  }
  try {
    const xml = await getSitemapPractitioners();
    sitemapCache['practitioners'] = { xml, time: Date.now() };
    res.set('Content-Type', 'text/xml');
    res.send(xml);
  } catch (err) {
    console.error('Practitioners sitemap error:', err.message || err);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

rSitemap.get('/community', async (req, res) => {
  const cached = getCachedSitemap('community');
  if (cached) {
    res.set('Content-Type', 'text/xml');
    return res.send(cached);
  }
  try {
    const xml = await getSitemapSocial();
    sitemapCache['community'] = { xml, time: Date.now() };
    res.set('Content-Type', 'text/xml');
    res.send(xml);
  } catch (err) {
    console.error('Community sitemap error:', err.message || err);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
})


// rSitemap.get('/products', async (req, res) => {
//   let xml = await getSitemapProducts();
//   res.set('Content-Type', 'text/xml');
//   res.send(xml);
// });

// rSitemap.get('/magazines', async (req, res) => {
//   let xml = await getSitemapMagazines();
//   res.set('Content-Type', 'text/xml');
//   res.send(xml);
// });

rSitemap.get('/', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(sitemapRoot);
});

const sitemapRoot = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>${baseURL}/sitemap/main</loc>
    </sitemap>
    <sitemap>
      <loc>${baseURL}/sitemap/practitioners</loc>
    </sitemap>
    <sitemap>
      <loc>${baseURL}/sitemap/community</loc>
    </sitemap>
  </sitemapindex>
`;

// PH-021 + SEO-044: the static pages, and each one's lastmod, come from
// scripts/generate-static-page-dates.js, which dates a page by the last commit
// to its source; add or remove a page there, not here. A page it could not
// date gets no <lastmod>, as everywhere else in this file. The old fallback was
// the time this module loaded, which is every deploy and every restart, and a
// date that keeps announcing changes that never happened is one crawlers learn
// to ignore.
function buildSitemapMain(): string {
  const urls = staticPages.map(page => `
    <url>
      <loc>${baseURL}${page.route === '/' ? '' : page.route}</loc>${page.lastmod ? `
      <lastmod>${page.lastmod}</lastmod>` : ''}
      <changefreq>${page.changefreq}</changefreq>${page.priority ? `
      <priority>${page.priority}</priority>` : ''}
    </url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${urls}
  </urlset>`;
}
const sitemapMain = buildSitemapMain();

function getSitemapPractitioners(): Promise<string> {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  `;

  return new Promise( async (resolve) => {

    const areas = getAllAreas();

    Promise.all([getAllCategorySlugs(), getAllTypeOfProviderSlugs(), getAllPractitionerIds()]).then(async vals => {
      const categoryIds = vals[0];
      const typeOfProviderSlugs = vals[1];
      const practitioners = vals[2];

      // SEO-060: Generate slugs for practitioners that don't have one yet
      await generateMissingSlugs(practitioners);

      // SEO-044: Compute real lastmod dates from practitioner data
      const maxUpdatedByArea: { [area: string]: string } = {};
      let globalMaxUpdated = '';

      practitioners.forEach(p => {
        if (p.updatedAt) {
          if (!globalMaxUpdated || p.updatedAt > globalMaxUpdated) {
            globalMaxUpdated = p.updatedAt;
          }
          if (p.city) {
            const area = p.city.toLowerCase().replace(/\s+/g, '-');
            if (!maxUpdatedByArea[area] || p.updatedAt > maxUpdatedByArea[area]) {
              maxUpdatedByArea[area] = p.updatedAt;
            }
          }
        }
      });

      const globalLastmod = globalMaxUpdated
        ? new Date(globalMaxUpdated).toISOString().split('T')[0]
        : '';

      // Main practitioners listing page
      xml += `
      <url>
        <loc>${baseURL}/practitioners</loc>
        ${globalLastmod ? `<lastmod>${globalLastmod}</lastmod>` : ''}
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>${baseURL}/practitioners/cities</loc>
        ${globalLastmod ? `<lastmod>${globalLastmod}</lastmod>` : ''}
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      `;

      areas.forEach(area => {
        const areaLastmod = maxUpdatedByArea[area]
          ? new Date(maxUpdatedByArea[area]).toISOString().split('T')[0]
          : globalLastmod;
        xml += `
          <url>
            <loc>${baseURL}/practitioners/area/${area}</loc>
            ${areaLastmod ? `<lastmod>${areaLastmod}</lastmod>` : ''}
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>
        `;
      });

      // SEO-064: City × category/type intersection pages are excluded from
      // the sitemap unless they appear in the indexable-combos allowlist.
      // Single-dimension category/type/area pages stay in the sitemap.
      // The intersection routes still render (e.g. via internal links) but
      // serve a noindex meta tag when not allowlisted.
      categoryIds.forEach(category => {
        xml += `
          <url>
            <loc>${baseURL}/practitioners/category/${category}</loc>
            ${globalLastmod ? `<lastmod>${globalLastmod}</lastmod>` : ''}
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>
        `;

        areas.forEach(area => {
          if (!isIndexableCityCategory(area, category as string)) return;
          const areaLastmod = maxUpdatedByArea[area]
            ? new Date(maxUpdatedByArea[area]).toISOString().split('T')[0]
            : globalLastmod;
          xml += `
            <url>
              <loc>${baseURL}/practitioners/category/${category}/${area}</loc>
              ${areaLastmod ? `<lastmod>${areaLastmod}</lastmod>` : ''}
              <changefreq>weekly</changefreq>
              <priority>0.6</priority>
            </url>
          `;
        });
      });

      typeOfProviderSlugs.forEach(slug => {
        xml += `
          <url>
            <loc>${baseURL}/practitioners/type/${slug}</loc>
            ${globalLastmod ? `<lastmod>${globalLastmod}</lastmod>` : ''}
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>
        `;

        areas.forEach(area => {
          if (!isIndexableCityType(area, slug as string)) return;
          const areaLastmod = maxUpdatedByArea[area]
            ? new Date(maxUpdatedByArea[area]).toISOString().split('T')[0]
            : globalLastmod;
          xml += `
            <url>
              <loc>${baseURL}/practitioners/type/${slug}/${area}</loc>
              ${areaLastmod ? `<lastmod>${areaLastmod}</lastmod>` : ''}
              <changefreq>weekly</changefreq>
              <priority>0.6</priority>
            </url>
          `;
        });
      });

      // SEO-043 + SEO-064: City × Specialty intersection pages (area-first
      // canonical URLs). Only emitted for allowlisted combos.
      typeOfProviderSlugs.forEach(slug => {
        areas.forEach(area => {
          if (!isIndexableCityType(area, slug as string)) return;
          const areaLastmod = maxUpdatedByArea[area]
            ? new Date(maxUpdatedByArea[area]).toISOString().split('T')[0]
            : globalLastmod;
          xml += `
            <url>
              <loc>${baseURL}/practitioners/area/${area}/type/${slug}</loc>
              ${areaLastmod ? `<lastmod>${areaLastmod}</lastmod>` : ''}
              <changefreq>weekly</changefreq>
              <priority>0.7</priority>
            </url>
          `;
        });
      });

      practitioners.forEach(p => {
        // SEO-060: Include all practitioners with a slug (original or generated via get-slug endpoint)
        if (p.slug) {
          const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : '';
          xml += `
          <url>
            <loc>${baseURL}/practitioners/${p.slug}</loc>
            ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
          </url>
          `;
        }
      });
    }).catch(error => {
    }).finally(() => {
      xml += '</urlset>';
      resolve(xml);
    });
  });
};

// function getSitemapProducts(): Promise<string> {
//   let xml = `<?xml version="1.0" encoding="UTF-8"?>
//     <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
//       <url>
//         <loc>${baseURL}products</loc>
//       </url>
//   `;

//   return new Promise(async (resolve) => {
//     try {
//       const productIds = await getAllProductIds();
//       productIds.forEach(id => {
//         xml += `
//           <url>
//             <loc>${baseURL}products/${id}</loc>
//           </url>
//         `;
//       });  
//     }catch(error) {
//       console.log(error);
//     }finally {
//       xml += '</urlset>';
//       resolve(xml);
//     }
//   });
// }

// function getSitemapMagazines(): Promise<string> {
//   /** paginator is not added in sitemap yet. */
//   let xml = `<?xml version="1.0" encoding="UTF-8"?>
//     <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
//       <url>
//         <loc>${baseURL}magazines</loc>
//       </url>
//       <url>
//         <loc>${baseURL}magazines/video</loc>
//       </url>
//       <url>
//         <loc>${baseURL}magazines/podcast</loc>
//       </url>
//       <url>
//         <loc>${baseURL}magazines/event</loc>
//       </url>
//     `;

//   return new Promise(async (resolve) => {
//     Promise.all([getAllBlogCategorySlugs(), getAllBlogTagSlugs(), getAllBlogEntrySlugs()]).then((vals) => {
//       const categorySlugs = vals[0];
//       const tagSlugs = vals[1];
//       const entrySlugs = vals[2];

//       categorySlugs.forEach(category => {
//         xml += `
//           <url>
//             <loc>${baseURL}magazines/category/${category}</loc>
//           </url>
//         `;
//       });

//       tagSlugs.forEach(tag => {
//         xml += `
//           <url>
//             <loc>${baseURL}magazines/tag/${tag}</loc>
//           </url>
//         `;
//       });

//       entrySlugs.forEach(entry => {
//         xml += `
//           <url>
//             <loc>${baseURL}magazines/${entry}</loc>
//           </url>
//         `;
//       });
//     }).catch(error => {
//       console.log(error);
//     }).finally(() => {
//       xml += '</urlset>';
//       resolve(xml);
//     })
//   }); 
// }

function getSitemapSocial(): Promise<string> {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    `;

  return new Promise((resolve) => {
    Promise.all([getAllCategorySlugs(true), getAllSocialContentIds()]).then(vals => {
      const categoryIds = vals[0];
      const contentIds = vals[1];
      const taxonomies = ['feed', 'article', 'media', 'event', 'note', 'voice', 'promotion'];

      // SEO-044: Compute max updatedAt per content type for taxonomy pages
      const contentTypeMap: { [key: string]: string } = {
        'FEED': 'feed', 'ARTICLE': 'article', 'MEDIA': 'media',
        'EVENT': 'event', 'NOTE': 'note', 'VOICE': 'voice', 'PROMOTION': 'promotion',
      };
      const maxUpdatedByType: { [type: string]: string } = {};

      contentIds.forEach(item => {
        if (item.updatedAt && item.contentType) {
          const mapped = contentTypeMap[item.contentType] || item.contentType.toLowerCase();
          if (!maxUpdatedByType[mapped] || item.updatedAt > maxUpdatedByType[mapped]) {
            maxUpdatedByType[mapped] = item.updatedAt;
          }
        }
      });

      taxonomies.forEach(type => {
        const typeLastmod = maxUpdatedByType[type]
          ? new Date(maxUpdatedByType[type]).toISOString().split('T')[0]
          : '';
        xml += `
          <url>
            <loc>${baseURL}/community/${type}</loc>
            ${typeLastmod ? `<lastmod>${typeLastmod}</lastmod>` : ''}
            <changefreq>daily</changefreq>
            <priority>0.7</priority>
          </url>
        `;
      });

      xml += `
        <url>
          <loc>${baseURL}/community/profile/${environment.config.idSA}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>
        <url>
          <loc>${baseURL}/community/profile/${environment.config.idSA}/feed</loc>
          <changefreq>weekly</changefreq>
          <priority>0.5</priority>
        </url>
      `;

      contentIds.forEach(item => {
        const lastmod = item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : '';
        // SEO-064: article slugs may contain non-ASCII characters like
        // em-dash (—, U+2014). RFC 3986 requires sitemap <loc> URLs to be
        // ASCII, so encode the slug segment. Without this, any article
        // whose slug contains an em-dash 404s when crawlers normalise the
        // URL to percent-encoded form.
        const loc = (item.contentType === 'ARTICLE' && item.slug)
          ? `${baseURL}/community/article/${encodeURIComponent(item.slug)}`
          : `${baseURL}/community/content/${item._id}`;
        xml += `
          <url>
            <loc>${loc}</loc>
            ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
            <changefreq>monthly</changefreq>
            <priority>0.7</priority>
          </url>
        `;
      });
      xml += '</urlset>';
      resolve(xml);
    });
  });
}


function getAllCategorySlugs(onlyRoot: boolean = false): Promise<String[]> {
  return new Promise((resolve) => {
    const categorySlugs: string[] = [];

    axios.get(apiURL + 'questionare/get-service', { timeout: 10000 }).then(res => {
      if(res.status == 200) {
        for(let data of res.data.data) {
          if(data.category_type.toLowerCase() == 'goal') {
            const cats = data.category;
            cats.forEach((c: any) => {
              const s = slugify(c.item_text);
              if(s) categorySlugs.push(s);
              if(!onlyRoot) {
                c.subCategory.forEach((cSub: any) => {
                  const ss = slugify(cSub.item_text);
                  if(ss) categorySlugs.push(ss);
                });
              }
            });
            break;
          }
        }
      }
      resolve(categorySlugs);
    }).catch(error => {
      resolve(categorySlugs);
    });
  });
}

function getAllTypeOfProviderSlugs(): Promise<string[]> {
  return new Promise((resolve) => {
    const typeOfProviderSlugs: string[] = [];
    axios.get(apiURL + 'questionare/get-questions?type=SP', { timeout: 10000 }).then(res => {
      if(res.status == 200) {
        const qs = res.data.data;
        for(let q of qs) {
          if(q.slug == 'providers-are-you') {
            q.answers.forEach((a: QuestionnaireAnswer) => {
              const s = slugify(a.item_text);
              if (s) typeOfProviderSlugs.push(s);
            });
            break;
          }
        }
      }
      resolve(typeOfProviderSlugs);
    });
  })
}

function getAllAreas(): string[] {
  const areas = [];
  Object.keys(locations).forEach(area => {
    areas.push(area);
  })
  return areas;
}

function getAllPractitionerIds(): Promise<{id: string, updatedAt?: string, slug?: string, city?: string}[]> {
  return new Promise((resolve) => {
    const practitioners: {id: string, updatedAt?: string, slug?: string, city?: string}[] = [];

    axios.post(apiURL + 'user/filter', {}, { timeout: 15000 }).then(res => {
      if(res.status == 200) {
        res.data.data.dataArr.forEach((d: {userId: string, city?: string, userData?: {updatedAt?: string, slug?: string}}) => {
          practitioners.push({id: d.userId, updatedAt: d.userData?.updatedAt, slug: d.userData?.slug, city: d.city});
        });
      }
    }).catch(error => {
    }).finally(() => {
      resolve(practitioners);
    });
  });
}

// SEO-060: Generate missing slugs for practitioners that don't have one.
// Calls the existing user/get-slug/:id endpoint which generates and saves the slug on-demand.
// Processes in batches to avoid overwhelming the backend.

/* Practitioners the backend has answered "no slug" for, with when it said so.
 * About fifty listed providers have no name to make one from, and the backend
 * mints none for a clinic, so for them the answer is 404 and stays 404. Asked
 * again on every rebuild (hourly, and after every restart), they logged some
 * 830 failures a day and never changed an answer.
 *
 * Kept for a day, not for the life of the process, because a 404 is not always
 * that answer. getSlugForId catches every error, a database timeout or a
 * duplicate key after its retries included, and returns null, which the
 * controller sends as the same 404 "No slug found". Remembered for good, one
 * rebuild during a database hiccup would have left every slugless provider it
 * asked out of the sitemap until the next deploy. A day still turns hourly
 * asking into daily asking, and a provider who adds a name is picked up within
 * a day. A timeout, a network error, 408, 429 or a 5xx is not remembered at
 * all, and is asked again on the next rebuild. */
const SLUG_UNAVAILABLE_TTL_MS = 24 * 60 * 60 * 1000;
const slugUnavailableSince = new Map<string, number>();

function isSlugUnavailable(id: string, now: number): boolean {
  const since = slugUnavailableSince.get(id);
  if (since === undefined) { return false; }
  if (now - since < SLUG_UNAVAILABLE_TTL_MS) { return true; }
  slugUnavailableSince.delete(id);
  return false;
}

async function generateMissingSlugs(practitioners: {id: string, updatedAt?: string, slug?: string, city?: string}[]): Promise<void> {
  const now = Date.now();
  const withoutSlug = practitioners.filter(p => !p.slug && !isSlugUnavailable(p.id, now));
  if (withoutSlug.length === 0) return;

  const newlyUnavailable: string[] = [];
  const BATCH_SIZE = 5;
  for (let i = 0; i < withoutSlug.length; i += BATCH_SIZE) {
    const batch = withoutSlug.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(p =>
        Promise.resolve(
          axios.get(apiURL + 'user/get-slug/' + p.id, { timeout: 10000 })
            .then(res => {
              if (res.status === 200 && res.data?.data?.slug) {
                p.slug = res.data.data.slug;
              } else {
                newlyUnavailable.push(p.id);
              }
            })
        ).then(
          value => ({ status: 'fulfilled' as const, value }),
          reason => ({ status: 'rejected' as const, reason })
        )
      )
    );
    results.forEach((result, idx) => {
      if (result.status !== 'rejected') { return; }
      /* A 4xx is the backend's answer about this id, or its caught failure
       * dressed as one (see above), which is why it is kept only for a day.
       * 408 and 429 are about the moment, not the id. */
      const status = result.reason?.response?.status;
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        newlyUnavailable.push(batch[idx].id);
      } else {
        // Log failures but continue: don't break the sitemap for individual errors
        console.warn(`SEO-060: Failed to generate slug for practitioner ${batch[idx].id}:`, result.reason?.message || result.reason);
      }
    });
  }

  if (newlyUnavailable.length > 0) {
    const answeredAt = Date.now();
    newlyUnavailable.forEach(id => slugUnavailableSince.set(id, answeredAt));
    console.warn(`SEO-060: ${newlyUnavailable.length} listed practitioners have no slug and the backend made none; asking again in a day (${slugUnavailableSince.size} waiting in all)`);
  }
}

function getAllSocialContentIds(): Promise<{_id: string, updatedAt: string, contentType: string, slug?: string}[]> {
  return new Promise((resolve) => {
    const contents: {_id: string, updatedAt: string, contentType: string, slug?: string}[] = [];
    axios.get(apiURL + 'note/filter?count=10000', { timeout: 15000 }).then(res => {
      if(res.status == 200) {
        res.data.data.data.forEach((d: {_id: string, updatedAt: string, contentType: string, slug?: string}) => {
          contents.push({_id: d._id, updatedAt: d.updatedAt, contentType: d.contentType, slug: d.slug});
        });
      }
      resolve(contents);
    }).catch(error => {
      resolve(contents);
    });
  });
}

// function getAllProductIds(): Promise<string[]> {
//   return new Promise((resolve) => {
//     const productIds: string[] = [];

//     axios.post(apiURL + 'partner/get-all', {}).then(res => {
//       if(res.status == 200) {
//         res.data.data.data.forEach((d: IUserDetail) => {
//           productIds.push(d._id);
//         });
//       }
//     }).catch(error => {
//       console.log(error);
//     }).finally(() => {
//       resolve(productIds);
//     });
//   });
// }

// function getAllBlogCategorySlugs(excludeEvent: boolean = true): Promise<string[]> {
//   return new Promise((resolve) => {
//     const blogCategorySlugs: string[] = []
//     axios.get(apiURL + 'category/get-categories').then(res => {
//       if(res.status == 200) {
//         for(let d of res.data.data) {
//           if(!d.slug.match(/event/)) {
//             blogCategorySlugs.push(d.slug)
//           }
//         }
//       }
//     }).catch(error => {
//       console.log(error);
//     }).finally(() => {
//       resolve(blogCategorySlugs);
//     });  
//   });
// }

// function getAllBlogTagSlugs(): Promise<string[]> {
//   return new Promise((resolve) => {
//     const blogTagSlugs: string[] = [];
//     axios.get(apiURL + 'tag/get-all').then(res => {
//       if(res.status === 200) {
//         for(let d of res.data.data.data) {
//           blogTagSlugs.push(d.slug);
//         }
//       }
//     }).catch(error => {
//       console.log(error);
//     }).finally(() => {
//       resolve(blogTagSlugs);
//     })
//   })
// }

// function getAllBlogEntrySlugs(): Promise<string[]> {
//   return new Promise((resolve) => {
//     const blogEntrySlugs: string[] = []

//     axios.get(apiURL + 'blog/get-all?frontend=1').then(res => {
//       if(res.status == 200) {
//         for(let d of res.data.data.data) {
//           blogEntrySlugs.push(d.slug)
//         }
//       }
//     }).catch(error => {
//       console.log(error);
//     }).finally(() => {
//       resolve(blogEntrySlugs);
//     });  
//   });
// }

export const routerSitemap = rSitemap;