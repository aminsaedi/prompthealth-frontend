import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { locations } from 'src/app/_helpers/location-data';
import { slugify } from 'src/app/_helpers/slugify';

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

// PH-021: Added lastmod and changefreq to static sitemap entries
const lastDeploy = new Date().toISOString().split('T')[0];
const sitemapMain = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <url>
      <loc>${baseURL}</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${baseURL}/about</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/about/partner</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/plans</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/plans/product</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/companies</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/ambassador-program</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/press-release</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/online-academy</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/testimonial</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/faq</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/subscribe/newsletter</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/contact-us</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/policy</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>yearly</changefreq>
    </url>
    <url>
      <loc>${baseURL}/terms</loc>
      <lastmod>${lastDeploy}</lastmod>
      <changefreq>yearly</changefreq>
    </url>
  </urlset>
`;

function getSitemapPractitioners(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <url>
        <loc>${baseURL}/practitioners</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
  `;

  return new Promise( async (resolve) => {

    const areas = getAllAreas();

    Promise.all([getAllCategorySlugs(), getAllTypeOfProviderSlugs(), getAllPractitionerIds()]).then(vals => {
      const categoryIds = vals[0];
      const typeOfProviderSlugs = vals[1];
      const practitioners = vals[2];

      areas.forEach(area => {
        xml += `
          <url>
            <loc>${baseURL}/practitioners/area/${area}</loc>
            <lastmod>${today}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>
        `;
      });

      categoryIds.forEach(category => {
        xml += `
          <url>
            <loc>${baseURL}/practitioners/category/${category}</loc>
            <lastmod>${today}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>
        `;

        areas.forEach(area => {
          xml += `
            <url>
              <loc>${baseURL}/practitioners/category/${category}/${area}</loc>
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
            <lastmod>${today}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>
        `;

        areas.forEach(area => {
          xml += `
            <url>
              <loc>${baseURL}/practitioners/type/${slug}/${area}</loc>
              <changefreq>weekly</changefreq>
              <priority>0.6</priority>
            </url>
          `;
        });
      });

      // SEO-043: City × Specialty intersection pages (area-first canonical URLs)
      typeOfProviderSlugs.forEach(slug => {
        areas.forEach(area => {
          xml += `
            <url>
              <loc>${baseURL}/practitioners/area/${area}/type/${slug}</loc>
              <changefreq>weekly</changefreq>
              <priority>0.7</priority>
            </url>
          `;
        });
      });

      practitioners.forEach(p => {
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
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    `;

  return new Promise((resolve) => {
    Promise.all([getAllCategorySlugs(true), getAllSocialContentIds()]).then(vals => {
      const categoryIds = vals[0];
      const contentIds = vals[1];
      const taxonomies = ['feed', 'article', 'media', 'event', 'note', 'voice', 'promotion'];

      taxonomies.forEach(type => {
        xml += `
          <url>
            <loc>${baseURL}/community/${type}</loc>
            <lastmod>${today}</lastmod>
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
        const loc = (item.contentType === 'ARTICLE' && item.slug)
          ? `${baseURL}/community/article/${item.slug}`
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

function getAllPractitionerIds(): Promise<{id: string, updatedAt?: string, slug?: string}[]> {
  return new Promise((resolve) => {
    const practitioners: {id: string, updatedAt?: string, slug?: string}[] = [];

    axios.post(apiURL + 'user/filter', {}, { timeout: 15000 }).then(res => {
      if(res.status == 200) {
        res.data.data.dataArr.forEach((d: {userId: string, userData?: {updatedAt?: string, slug?: string}}) => {
          practitioners.push({id: d.userId, updatedAt: d.userData?.updatedAt, slug: d.userData?.slug});
        });
      }
    }).catch(error => {
    }).finally(() => {
      resolve(practitioners);
    });
  });
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