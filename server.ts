/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
import 'zone.js/dist/zone-node';

/** If third party module is not compatible with universal, try to add global variable here */
global['MouseEvent'] = {};  
global['HTMLElement'] = {};

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { existsSync } from 'fs';
import * as domino from 'domino';
// import * as helmet from 'helmet';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { routerSitemap } from './src/app/app.server.sitemap.module';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();

  const isProductionMode = !!(server.get('env') == 'production');
  const distFolder = join(process.cwd(), './dist/wellness-frontend/browser');

  // const distFolder = isProductionMode ?
  //   join(process.cwd(), '../browser') :
  //   join(process.cwd(), './dist/wellness-frontend/browser');

  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  /** If third party module is not compatible with universal, try to add global variable above instead of here */
  /** following variables are working only for this project. */
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
  server.get('/sockjs-node/iframe.html', (res, req) => { express.static(distFolder, {maxAge: '1y'}); }); /** nothing to do, but it's nessesary not to try SSR because this file doesn't exist. */
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
  
  server.use('/community/create',      (req, res) => { res.sendFile(join(distFolder, 'index.html')); })
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
          console.log('SSR error. something went wrong: ');
          console.log(err)
        }
        showMeta(req.originalUrl, html);
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