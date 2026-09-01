/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
import 'zone.js/dist/zone-node';

/** If third party module is not compatible with universal, try to add global variable here */
(global as any)['MouseEvent'] = {};
(global as any)['HTMLElement'] = {};
(global as any)['HTMLAnchorElement'] = {prototype: {}}; // for datebook


import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import * as proxy from 'http-proxy-middleware';
import { join } from 'path';
import * as compression from 'compression';

import { existsSync } from 'fs';
import * as domino from 'domino';
// import * as helmet from 'helmet';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { routerSitemap } from './src/app/app.server.sitemap.module';
import { environment } from 'src/environments/environment';
import { routerRedirectForMagazine } from 'src/app/app.server.redirect.module';
import { routerRedirectForTypeOfProvider } from 'src/app/app.server.redirect-type.module';
import { routerRedirectForProfile } from 'src/app/app.server.redirect-profile.module';
import { routerRedirectForContent } from 'src/app/app.server.redirect-content.module';
import { routerRedirectForCategory } from 'src/app/app.server.redirect-category.module';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  server.use(compression());
  
  const isProductionMode = !!(server.get('env') == 'production');
  const distFolder = join(process.cwd(), './dist/wellness-frontend/browser');

  // const distFolder = isProductionMode ?
  //   join(process.cwd(), '../browser') :
  //   join(process.cwd(), './dist/wellness-frontend/browser');

  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  /** If third party module is not compatible with universal, try to add global variable above instead of here */
  /** following variables are working only for this project. */
  const template = join(distFolder, 'index.html');
  const win = domino.createWindow(template);
  (global as any)['window'] = win;
  (global as any)['document'] = win.document;
  (global as any)['navigator'] = win.navigator;
  (global as any)['location'] = win.location;


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
  server.get('/sockjs-node/iframe.html', (res, req) => { express.static(distFolder, {maxAge: '1y'}); }); /** nothing to do, but it's nessesary not to try SSR because this file doesn't exist. */
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  /** api proxy */
  const apiProxy = proxy('/api', {target: environment.config.BACKEND_BASE, changeOrigin: false});
  server.use('/api', apiProxy);

  /** stripe proxy */
  const stripeProxy = proxy('/stripe', {target: environment.config.BACKEND_BASE, changeOrigin: false});
  server.use('/stripe', stripeProxy);

  /** out proxy — built-in link tracker redirects (/out/<code>) must reach the
   *  backend instead of being SSR-rendered by the Universal catch-all below.
   *  Targets the public backend because BACKEND_BASE (127.0.0.1:3001) is not
   *  reachable from this SSR container in the split-host deployment. */
  const outTarget = environment.config.API_URL.replace(/\/api\/v1\/?$/, '');
  /* xfwd forwards the reader's address. Without it every /out click reached the
   * backend as this container, so every one of them shared a single hashed
   * address: unique-visitor counts on the busiest click channel were counting
   * one visitor, and all of them sat in one rate-limit bucket. */
  const outProxy = proxy('/out', { target: outTarget || 'https://ocean.prompthealth.ca', changeOrigin: true, xfwd: true });
  server.use('/out', outProxy);


  /** Serve llms.txt for AI crawlers at well-known path */
  server.get('/.well-known/llms.txt', (req, res) => {
    res.sendFile(join(distFolder, 'llms.txt'));
  });

  /** redirect for SEO */
  server.use('/magazines', routerRedirectForMagazine);
  server.use('/practitioners/type', routerRedirectForTypeOfProvider);
  server.use('/practitioners/category', routerRedirectForCategory);
  server.use('/community/profile', routerRedirectForProfile);
  server.use('/community/content', routerRedirectForContent);

  // SEO-064: 301 redirects for legacy / SEO-friendly aliases so Google
  // consolidates signals to the canonical /policy, /terms, and
  // /medical-disclaimer URLs instead of treating the alias paths as 404.
  server.get('/privacy-policy',     (req, res) => { res.redirect(301, '/policy'); });
  server.get('/privacy-policy/',    (req, res) => { res.redirect(301, '/policy'); });
  server.get('/terms-of-service',   (req, res) => { res.redirect(301, '/terms'); });
  server.get('/terms-of-service/',  (req, res) => { res.redirect(301, '/terms'); });
  server.get('/terms-and-conditions', (req, res) => { res.redirect(301, '/terms'); });
  server.get('/disclaimer',         (req, res) => { res.redirect(301, '/medical-disclaimer'); });

  /** client side rendering */
  server.use('/auth',                  (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/dashboard',             (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  /* Behind a login guard, so a server render produces an empty shell at the
     cost of a full Angular render per request. Measured against production:
     1.02 s for /link-admin/overview against 0.086 s for /dashboard, which is
     already on this list. */
  server.use('/link-admin',            (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/dashboard-old',         (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/personal-match',        (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/compare-practitioners', (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/unsubscribe',           (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/404',                   (req, res) => { res.status(404).sendFile(join(distFolder, 'index.html')); })
  server.use('/thankyou',              (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/join-team',             (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  
  server.use('/community/drafts',      (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/community/editor',      (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/community/followings',  (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/community/followers',   (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
  server.use('/community/notification',(req, res) => { res.sendFile(join(distFolder, 'index.html')); })

  
  // create sitemap dynamically (SSR)
  server.use('/sitemap', routerSitemap);

  // All other routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(
      indexHtml,
      { req, providers: [ { provide: APP_BASE_HREF, useValue: req.baseUrl } ]},
      (err, html) => {
        if(err){
          console.log('SSR error for ' + req.url + ':');
          console.log(err.message || err);
          // Fall back to client-side rendering on SSR error
          return res.sendFile(join(distFolder, 'index.html'));
        }
        if (html) {
          html = injectPaginationLinks(req, html);
        }
        // Only return 404 if the page explicitly rendered as Not Found
        // (not due to transient API failures like 429)
        if (html && html.includes('<title>Not Found | PromptHealth</title>')) {
          res.status(404).send(html);
        } else {
          res.send(html);
        }
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

function injectPaginationLinks(req: any, html: string): string {
  // Only inject pagination links for community feed pages
  const feedPattern = /^\/community\/(feed|article|media|event|note|voice|promotion)(\/[a-f0-9]{24})?$/;
  const pathWithoutQuery = req.path;
  if (!feedPattern.test(pathWithoutQuery)) {
    return html;
  }

  const page = parseInt(req.query.page, 10) || 1;
  const baseUrl = 'https://www.prompthealth.ca' + pathWithoutQuery;
  let links = '';

  if (page > 1) {
    const prevPage = page - 1;
    const prevUrl = prevPage === 1 ? baseUrl : `${baseUrl}?page=${prevPage}`;
    links += `<link rel="prev" href="${prevUrl}">`;
  }

  // Always add next link (crawlers will stop when they get empty pages)
  const nextUrl = `${baseUrl}?page=${page + 1}`;
  links += `<link rel="next" href="${nextUrl}">`;

  if (links) {
    html = html.replace('</head>', links + '</head>');
  }

  return html;
}

function showMeta(url: string, html: string) {
  console.log('=============== SHOW META START');
  console.log(url);
  console.log(html.match(/<title>(.*)<\/title>/)[1]);
  var meta = [
    'og:title','twitter:title',
    'keyword',
    'description', 
    'og:description', 'twitter:description',
    'og:site_name', 'twitter:site',
    'og:url',
    'og:type',
    'twitter:card',
    'og:image', 'twitter:image',
    'robots'
  ];
  meta.forEach(m=>{
    var regEx = new RegExp(`<meta name="${m}" content="(.*?)">`);
    var match = html.match(regEx);
    if(match){ console.log(m, ': ', match[1]); }
  });
  console.log('=============== SHOW META END');
}