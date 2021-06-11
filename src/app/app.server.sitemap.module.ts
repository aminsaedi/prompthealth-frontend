import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { locations } from 'src/app/_helpers/location-data';

const apiURL = environment.config.API_URL;
const baseURL = environment.config.BASE_URL;

import { default as axios } from 'axios';
import { IUserDetail } from './models/user-detail';
const rSitemap = Router();

rSitemap.get('/main', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(sitemapMain);
});

rSitemap.get('/practitioners', async (req, res) => {
  let xml = await getSitemapPractitioners(); 
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});


rSitemap.get('/products', async (req, res) => {
  let xml = await getSitemapProducts();
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

rSitemap.get('/blogs', async (req, res) => {
  let xml = await getSitemapBlogs();
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

rSitemap.get('/', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(sitemapRoot);
});

const sitemapRoot = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>${baseURL}sitemap/main</loc>
    </sitemap>
    <sitemap>
      <loc>${baseURL}sitemap/practitioners</loc>
    </sitemap>
    <sitemap>
      <loc>${baseURL}sitemap/products</loc>
    </sitemap>
    <sitemap>
      <loc>${baseURL}sitemap/blogs</loc>
    </sitemap>        
  </sitemapindex>
`;

const sitemapMain = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
    <url>
      <loc>${baseURL}</loc>
    </url>
    <url>
      <loc>${baseURL}plans</loc>
    </url>
    <url>
      <loc>${baseURL}plans/product</loc>
    </url>
    <url>
      <loc>${baseURL}ambassador-program</loc>
    </url>
    <url>
      <loc>${baseURL}faq</loc>
    </url>       
    <url>
      <loc>${baseURL}subscribe/newsletter</loc>
    </url>   
    <url>
      <loc>${baseURL}contact-us</loc>
    </url>          
    <url>
      <loc>${baseURL}policy</loc>
    </url>              
    <url>
      <loc>${baseURL}terms</loc>
    </url>
  </urlset>   
`;

function getSitemapPractitioners(): Promise<string> {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
      <url>
        <loc>${baseURL}practitioners</loc>
      </url>
  `;

  return new Promise( async (resolve) => {

    const areas = getAllAreas();
    Promise.all([getAllCategoryIds(), getAllPractitionerIds()]).then(vals => {
      const categoryIds = vals[0];
      const practitionerIds = vals[1];

      areas.forEach(area => {
        /** listing by area */
        xml += `
          <url>
            <loc>${baseURL}practitioners/area/${area}</loc>
          </url>
        `;
      });

      categoryIds.forEach(category => {
        /** listing by category */
        xml += `
          <url>
            <loc>${baseURL}practitioners/category/${category}</loc>
          </url>
        `;

        areas.forEach(area => {
          /** listing by category + area */
          xml += `
            <url>
              <loc>${baseURL}practitioners/category/${category}/${area}</loc>
            </url>
          `;
        });
      });

      practitionerIds.forEach(id => {
        /** profile page */
        xml += `
          <url>
            <loc>${baseURL}practitioners/${id}</loc>
          </url>
        `;
      });
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      xml += '</urlset>';
      resolve(xml);
    });
  });
};

function getSitemapProducts(): Promise<string> {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
      <url>
        <loc>${baseURL}products</loc>
      </url>
  `;

  return new Promise(async (resolve) => {
    try {
      const productIds = await getAllProductIds();
      productIds.forEach(id => {
        xml += `
          <url>
            <loc>${baseURL}products/${id}</loc>
          </url>
        `;
      });  
    }catch(error) {
      console.log(error);
    }finally {
      xml += '</urlset>';
      resolve(xml);
    }
  });
}

function getSitemapBlogs(): Promise<string> {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
      <url>
        <loc>${baseURL}blogs</loc>
      </url>
  `;

  return new Promise(async (resolve) => {
    Promise.all([getAllBlogCategoryIds(), getAllBlogEntrySlugs()]).then((vals) => {
      const categoryIds = vals[0];
      const entrySlugs = vals[1];

      categoryIds.forEach(category => {
        xml += `
          <url>
            <loc>${baseURL}blogs/category/${category}</loc>
          </url>
        `;
      });

      entrySlugs.forEach(entry => {
        xml += `
          <url>
            <loc>${baseURL}blogs/${entry}</loc>
          </url>
        `;
      });
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      xml += '</urlset>';
      resolve(xml);
    })
  }); 
}

function getAllCategoryIds(): Promise<String[]> {
  return new Promise((resolve) => {
    const categoryIds: string[] = [];

    axios.get(apiURL + 'questionare/get-service').then(res => {
      if(res.status == 200) {
        for(let data of res.data.data) {
          if(data.category_type.toLowerCase() == 'goal') {
            const cats = data.category;
            cats.forEach((c: any) => {
              categoryIds.push(c._id);
              c.subCategory.forEach((cSub: any) => {
                categoryIds.push(cSub._id);
              });
            });
            break;
          }
        }
      }
      resolve(categoryIds);
    }).catch(error => {
      console.log(error);
      resolve(categoryIds);
    });
  });
}

function getAllAreas(): string[] {
  const areas = [];
  Object.keys(locations).forEach(area => {
    areas.push(area);
  })
  return areas;
}

function getAllPractitionerIds(): Promise<String[]> {
  return new Promise((resolve) => {
    const practitionerIds: string[] = [];

    axios.post(apiURL + 'user/filter', {}).then(res => {
      if(res.status == 200) {
        res.data.data.forEach((d: {userId: string}) => {
          practitionerIds.push(d.userId);
        });
      }
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      resolve(practitionerIds);
    });
  });
}

function getAllProductIds(): Promise<string[]> {
  return new Promise((resolve) => {
    const productIds: string[] = [];

    axios.post(apiURL + 'partner/get-all', {}).then(res => {
      if(res.status == 200) {
        res.data.data.data.forEach((d: IUserDetail) => {
          productIds.push(d._id);
        });
      }
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      resolve(productIds);
    });
  });
}

function getAllBlogCategoryIds(): Promise<string[]> {
  return new Promise((resolve) => {
    const blogCategoryIds: string[] = []
    axios.get(apiURL + 'category/get-categories').then(res => {
      if(res.status == 200) {
        for(let d of res.data.data) {
          blogCategoryIds.push(d._id)
        }
      }
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      resolve(blogCategoryIds);
    });  
  });
}

function getAllBlogEntrySlugs(): Promise<string[]> {
  return new Promise((resolve) => {
    const blogEntrySlugs: string[] = []

    axios.get(apiURL + 'blog/get-all?frontend=1').then(res => {
      if(res.status == 200) {
        for(let d of res.data.data.data) {
          blogEntrySlugs.push(d.slug)
        }
      }
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      resolve(blogEntrySlugs);
    });  
  });
}

export const routerSitemap = rSitemap;