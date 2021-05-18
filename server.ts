/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { existsSync } from 'fs';
import * as domino from 'domino';
// import * as helmet from 'helmet';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { environment } from './src/environments/environment';
import { default as axios } from 'axios';

import { IUserDetail } from 'src/app/models/user-detail';
 
// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();

  const isProductionMode = !!(server.get('env') == 'production');
  const distFolder = join(process.cwd(), './dist/wellness-frontend/browser');

  // const distFolder = isProductionMode ?
  //   join(process.cwd(), '../browser') :
  //   join(process.cwd(), './dist/wellness-frontend/browser');

  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  const template = join(distFolder, 'index.html');
  const win = domino.createWindow(template)
  global['window'] = win;
  global['document'] = win.document;
  global['navigator'] = win.navigator;
  global['location'] = win.location;

  // if(server.get('env') == 'production'){
  //   server.set('trust proxy', 1);
  //   server.use(helmet());
  // }

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('/bootstrap.min.css.map', (res, req) => { express.static(distFolder, {maxAge: '1y'}); }); /** nothing to do, but it's nessesary not to try SSR because this file doesn't exist. */
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  /** client side rendering */
  server.use('/auth',                  (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/dashboard',             (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/personal-match',        (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/compare-practitioners', (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/unsubscribe',           (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/404',                   (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/thankyou',              (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  
  // create sitemap dynamically (SSR)
  server.get('/sitemap', async (req, res) => { 
    const sitemap = await getSitemap(server.get('env') == 'production');
    res.set('Content-Type', 'text/xml');
    res.send(sitemap);
  });

  // All other routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(
      indexHtml, 
      { req, providers: [ { provide: APP_BASE_HREF, useValue: req.baseUrl } ]},
      (err, html) => {
        if(err){
          console.log('SSR error. something went wrong: ');
          console.log(err)
        }
        // showMeta(req.originalUrl, html);
        res.send(html);
      }
    );
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4200 ;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';

function showMeta(url: string, html: string) {
  console.log('=============== SHOW META START');
  console.log(url);
  console.log(html.match(/<title>(.*)<\/title>/)[1]);
  var meta = [
    // 'og:title','twitter:title',
    // 'keyword',
    'description', 
    // 'og:description', 'twitter:description',
    // 'og:site_name', 'twitter:site',
    // 'og:url',
    // 'og:type',
    // 'twitter:card',
    // 'og:image', 'twitter:image',
    'robots'
  ];
  meta.forEach(m=>{
    var regEx = new RegExp(`<meta name="${m}" content="(.*?)">`);
    var match = html.match(regEx);
    if(match){ console.log(m, ': ', match[1]); }
  });
  console.log('=============== SHOW META END');
}

function getSitemap(isProductionMode: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const promiseAll = [
      getCategories(),
      getAllPractitioners(),
      getAllProducts(),
      getBlogCategories(),
      getBlogEntries(),
    ];
    Promise.all(promiseAll).then(vals => {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
          <url>
            <loc>https://prompthealth.ca</loc>
          </url>
          <url>
            <loc>https://prompthealth.ca/practitioners</loc>
          </url>
          <url>
            <loc>https://prompthealth.ca/products</loc>
          </url>
          <url>
            <loc>https://prompthealth.ca/plans</loc>
          </url>
          <url>
            <loc>https://prompthealth.ca/plans/product</loc>
          </url>
          <url>
            <loc>https://prompthealth.ca/blogs</loc>
          </url>
          <url>
            <loc>https://prompthealth.ca/ambassador-program</loc>
          </url>
          <url>
            <loc>https://prompthealth.ca/clubhouse</loc>
          </url>
          <url>
            <loc>https://prompthealth.ca/faq</loc>
          </url>       
          <url>
            <loc>https://prompthealth.ca/subscribe-email</loc>
          </url>   
          <url>
            <loc>https://prompthealth.ca/contact-us</loc>
          </url>          
          <url>
            <loc>https://prompthealth.ca/policy</loc>
          </url>              
          <url>
            <loc>https://prompthealth.ca/terms</loc>
          </url>     
      `;

      vals.forEach(vs => {
        vs.data.forEach(v => {
          xml += `
            <url>
              <loc>https://prompthealth.ca/${vs.type}/${v}</loc>
            </url>
          `
        });
      });

      xml += '</urlset>'
      resolve(xml);
    })
  })
}

function getCategories(): Promise<{type: string, data: string[]}> {
  return new Promise((resolve) => {
    const result = {
      type: 'practitioners/category',
      data: [],
    };
    const root = environment.config.API_URL;
    axios.get(root + 'questionare/get-service').then(res => {
      if(res.status == 200) {
        for(let data of res.data.data) {
          if(data.category_type.toLowerCase() == 'goal') {
            const cats = data.category;
            cats.forEach(c => {
              result.data.push(c._id);
              c.subCategory.forEach(cSub => {
                result.data.push(cSub._id);
              });
            })
            break;
          }
        }
      }
      resolve(result);
    }).catch(error => {
      console.log(error);
      resolve(result);
    });  
  });
}

function getAllPractitioners(): Promise<{type: string, data: string[]}> {
  return new Promise((resolve) => {
    const result = {
      type: 'practitioners',
      data: []
    }
    const root = environment.config.API_URL;
    axios.post(root + 'user/filter', {}).then(res => {
      if(res.status == 200) {
        res.data.data.forEach((d: {userId: string, userData: IUserDetail}) => {
          result.data.push(d.userId);
        });
      }
      resolve(result);
    }).catch(error => {
      console.log(error);
      resolve(result);
    });
  });
}

function getAllProducts(): Promise<{type: string, data: string[]}> {
  return new Promise((resolve) => {
    const result = {
      type: 'products',
      data: []
    }
    const root = environment.config.API_URL;
    axios.post(root + 'partner/get-all', {}).then(res => {
      if(res.status == 200) {
        res.data.data.data.forEach((d: IUserDetail) => {
          result.data.push(d._id);
        });
      }
      resolve(result);
    }).catch(error => {
      console.log(error);
      resolve(result);
    });
  });
}

function getBlogCategories(): Promise<{type: string, data: string[]}>  {
  return new Promise((resolve) => {
    const result = {
      type: 'blogs/category',
      data: [],
    };
    const root = environment.config.API_URL;
    axios.get(root + 'category/get-categories').then(res => {
      if(res.status == 200) {
        for(let d of res.data.data) {
          result.data.push(d._id)
        }
      }
      resolve(result);
    }).catch(error => {
      console.log(error);
      resolve(result);
    });  
  });
}

function getBlogEntries(): Promise<{type: string, data: string[]}> {
  return new Promise((resolve) => {
    const result = {
      type: 'blogs',
      data: [],
    };
    const root = environment.config.API_URL;
    axios.get(root + 'blog/get-all?frontend=1').then(res => {
      if(res.status == 200) {
        for(let d of res.data.data.data) {
          result.data.push(d.slug)
        }
      }
      resolve(result);
    }).catch(error => {
      console.log(error);
      resolve(result);
    });  
  });
}