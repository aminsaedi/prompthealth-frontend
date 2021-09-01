import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { locations } from 'src/app/_helpers/location-data';

const apiURL = environment.config.API_URL;
const baseURL = environment.config.BASE_URL;

import { default as axios } from 'axios';
import { IUserDetail } from './models/user-detail';
import { QuestionnaireAnswer } from './shared/services/questionnaire.service';
import { IGetSocialContentsResult } from './models/response-data';
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

rSitemap.get('/community', async (req, res) => {
  let xml = await getSitemapSocial();
  res.set('Content-Type', 'text/xml');
  res.send(xml);
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
      <loc>${baseURL}sitemap/main</loc>
    </sitemap>
    <sitemap>
      <loc>${baseURL}sitemap/practitioners</loc>
    </sitemap>
    <sitemap>
      <loc>${baseURL}sitemap/community</loc>
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
      <loc>${baseURL}products</loc>
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
    
    Promise.all([getAllCategoryIds(), getAllTypeOfProviderIds()]).then(vals => {
      const categoryIds = vals[0];
      const typeOfProviderIds = vals[1];

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

      typeOfProviderIds.forEach(id => {
        /** listing by type of provider */
        xml += `
          <url>
            <loc>${baseURL}practitioners/type/${id}</loc>
          </url>
        `;

        areas.forEach(area => {
          /** listing by type of provider + area */
          xml += `
            <url>
              <loc>${baseURL}practitioners/type/${id}/${area}</loc>
            </url>
          `;
        });
      });
    }).catch(error => {
      console.log(error);
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
    <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
    `;

  return new Promise((resolve) => {
    Promise.all([getAllCategoryIds(true), getAllPractitionerIds(), getAllSocialContentIds()]).then(vals => {
      console.log('koko');
      const categoryIds = vals[0];
      const practitionerIds = vals[1];
      const contentIds = vals[2];
      const taxonomies = ['feed', 'article', 'media', 'event'];

      taxonomies.forEach(type => {
        xml += `
          <url>
            <loc>${baseURL}community/${type}</loc>
          </url>
        `;
        categoryIds.forEach(id => {
          xml += `
            <url>
              <loc>${baseURL}community/${type}/${id}</loc>
            </url>
          `;
        });
      });

      xml += `
        <url>
          <loc>${baseURL}community/profile/${environment.config.idSA}</loc>
        </url>
        <url>
          <loc>${baseURL}community/profile/${environment.config.idSA}/feed</loc>
        </url>
      `;

      practitionerIds.forEach(id => {
        xml += `
          <url>
            <loc>${baseURL}community/profile/${id}</loc>
          </url>
          <url>
            <loc>${baseURL}community/profile/${id}/service</loc>
          </url>
          <url>
            <loc>${baseURL}community/profile/${id}/feed</loc>
          </url>
          <url>
            <loc>${baseURL}community/profile/${id}/review</loc>
          </url>
        `;
      });

      contentIds.forEach(id => {
        xml += `
          <url>
            <loc>${baseURL}community/content/${id}</loc>
          </url>
        `;
      });
      xml += '</urlset>';
      resolve(xml);  
    });
  });
}


function getAllCategoryIds(onlyRoot: boolean = false): Promise<String[]> {
  return new Promise((resolve) => {
    const categoryIds: string[] = [];

    axios.get(apiURL + 'questionare/get-service').then(res => {
      if(res.status == 200) {
        for(let data of res.data.data) {
          if(data.category_type.toLowerCase() == 'goal') {
            const cats = data.category;
            cats.forEach((c: any) => {
              categoryIds.push(c._id);
              if(!onlyRoot) {
                c.subCategory.forEach((cSub: any) => {
                  categoryIds.push(cSub._id);
                });  
              }
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

function getAllTypeOfProviderIds(): Promise<string[]> {
  return new Promise((resolve) => {
    const typeOfProviderIds: string[] = [];
    axios.get(apiURL + 'questionare/get-questions?type=SP').then(res => {
      if(res.status == 200) {
        const qs = res.data.data;
        console.log(res.data);
        for(let q of qs) {
          if(q.slug == 'providers-are-you') {
            q.answers.forEach((a: QuestionnaireAnswer) => {
              typeOfProviderIds.push(a._id);
            });
            break;  
          }
        }
      }
      resolve(typeOfProviderIds);
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

function getAllPractitionerIds(): Promise<String[]> {
  return new Promise((resolve) => {
    const practitionerIds: string[] = [];

    axios.post(apiURL + 'user/filter', {}).then(res => {
      if(res.status == 200) {
        res.data.data.dataArr.forEach((d: {userId: string}) => {
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

function getAllSocialContentIds(): Promise<string[]> {
  return new Promise((resolve) => {
    const contentIds = [];
    axios.get(apiURL + 'note/filter?count=100').then(res => {
      if(res.status == 200) {
        res.data.data.data.forEach((d: {_id: string}) => {
          contentIds.push(d._id);
        });
      }
      resolve(contentIds);
    }).catch(error => {
      resolve(contentIds);
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