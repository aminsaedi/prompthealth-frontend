#!/usr/bin/env node

/**
 * Writes src/app/static-page-dates.ts: every static page in sitemap/main, with
 * the date its source last changed on master as its <lastmod> (SEO-044).
 *
 * The dates come from git, and the production image is built where there is
 * none: .dockerignore drops .git and node:14-alpine has no git binary. This
 * script used to fall back to the build date there, so every deploy told
 * crawlers that every static page had just changed, and a lastmod that keeps
 * claiming changes that did not happen is one crawlers learn to ignore. CI now
 * runs it with --strict on a full-history checkout before `docker build`, and
 * the prebuild:ssr run inside the image finds no git and keeps what CI wrote.
 *
 * So a page's date is, in order: git; else the date already in the file; else
 * none, and the sitemap leaves <lastmod> out. Never the day of the build.
 *
 * --strict (CI) fails instead of guessing: no usable history, or a page whose
 * paths do not exist or have no commits, stops the deploy.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'src', 'app', 'static-page-dates.ts');

// Every static URL in sitemap/main, in the order it is listed there.
// app.server.sitemap.module.ts renders this list and has none of its own, so a
// page is added to or removed from the sitemap here and only here: the two
// lists used to drift, and /medical-disclaimer got a date that changed on
// every restart because it was in one and not the other.
//
// `paths` are git pathspecs, relative to the repo root, for the source that
// renders the page. Keep them to the page's own component. The homepage used
// to be all of src/app/home, which holds every page in this list, so an edit
// to the privacy policy moved the homepage's date.
const STATIC_PAGES = [
  { route: '/', changefreq: 'weekly', priority: '1.0', paths: [
    'src/app/home/home.component.html',
    'src/app/home/home.component.ts',
    'src/app/home/home.component.scss',
  ] },
  { route: '/about',                     changefreq: 'monthly', paths: ['src/app/home/about'] },
  { route: '/about/partner',             changefreq: 'monthly', paths: ['src/app/home/about-partner'] },
  { route: '/about/editorial-standards', changefreq: 'monthly', paths: ['src/app/home/editorial-standards'] },
  { route: '/plans',                     changefreq: 'monthly', paths: ['src/app/home/about-practitioner'] },
  { route: '/for-practitioners',         changefreq: 'monthly', paths: ['src/app/home/for-practitioners'] },
  { route: '/for-dentists',              changefreq: 'monthly', paths: ['src/app/home/growth-landing'] },
  { route: '/plans/product',             changefreq: 'monthly', paths: ['src/app/home/about-company'] },
  { route: '/companies',                 changefreq: 'monthly', paths: ['src/app/home/listing-company'] },
  { route: '/ambassador-program',        changefreq: 'monthly', paths: ['src/app/home/landing-ambassador'] },
  { route: '/press-release',             changefreq: 'monthly', paths: ['src/app/home/press-release'] },
  { route: '/online-academy',            changefreq: 'monthly', paths: ['src/app/home/online-academy'] },
  { route: '/testimonial',               changefreq: 'monthly', paths: ['src/app/home/testimonial'] },
  { route: '/faq',                       changefreq: 'monthly', paths: ['src/app/home/faq'] },
  { route: '/subscribe/newsletter',      changefreq: 'monthly', paths: ['src/app/home/landing-clubhouse'] },
  { route: '/contact-us',                changefreq: 'monthly', paths: ['src/app/home/contact-us'] },
  { route: '/policy',                    changefreq: 'yearly',  paths: ['src/app/home/privacy-policy'] },
  { route: '/terms',                     changefreq: 'yearly',  paths: ['src/app/home/terms-conditions'] },
  { route: '/medical-disclaimer',        changefreq: 'yearly',  paths: ['src/app/home/medical-disclaimer'] },
];

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

// False where the history cannot date anything: no git binary, no .git, or a
// shallow clone. A shallow clone is the quiet one. Its oldest commit looks as
// if it added every file, so every page would get the date of the commit being
// built, which is the bug this script exists to avoid, just by another route.
function hasFullHistory() {
  try {
    return git(['rev-parse', '--is-shallow-repository']) === 'false';
  } catch (e) {
    return false;
  }
}

// --first-parent dates a change by when it reached master, which is when the
// live page changed, rather than when it was first committed: a branch can sit
// for days before its merge deploys it.
function lastChanged(paths) {
  try {
    const iso = git(['log', '-1', '--first-parent', '--format=%cI', '--'].concat(paths));
    return iso ? new Date(iso).toISOString().split('T')[0] : null;
  } catch (e) {
    return null;
  }
}

// The dates this file already holds, by route. Reads the current format and
// the flat { route: date } map it had before, so the first build after this
// change keeps its dates whichever copy it is handed.
function existingDates() {
  const dates = {};
  let text = '';
  try {
    text = fs.readFileSync(OUT_PATH, 'utf-8');
  } catch (e) {
    return dates;
  }
  [/route: '([^']+)', lastmod: '(\d{4}-\d{2}-\d{2})'/g, /'(\/[^']*)': '(\d{4}-\d{2}-\d{2})'/g].forEach(re => {
    let m;
    while ((m = re.exec(text)) !== null) {
      dates[m[1]] = m[2];
    }
  });
  return dates;
}

function fail(message) {
  console.error(`[SEO-044] ${message}`);
  process.exit(1);
}

const strict = process.argv.indexOf('--strict') !== -1;
const history = hasFullHistory();
if (strict && !history) {
  fail('--strict needs full git history, and there is none here (no git, no .git, or a shallow clone). In CI, check out with fetch-depth: 0.');
}

const kept = existingDates();
const undatable = [];
const counts = { git: 0, kept: 0, none: 0 };

const pages = STATIC_PAGES.map(page => {
  // A path that is gone still has history (the commit that deleted it), so
  // a page removed from the app but not from this list would keep a date.
  const absent = page.paths.filter(p => !fs.existsSync(path.join(ROOT, p)));
  let lastmod = history ? lastChanged(page.paths) : null;
  if (absent.length) {
    undatable.push(`${page.route} (${absent.join(', ')} does not exist)`);
  } else if (history && !lastmod) {
    undatable.push(`${page.route} (no commit touches ${page.paths.join(', ')})`);
  }
  if (lastmod) {
    counts.git++;
  } else {
    lastmod = kept[page.route] || null;
    counts[lastmod ? 'kept' : 'none']++;
  }
  return { route: page.route, lastmod, changefreq: page.changefreq, priority: page.priority || null };
});

if (strict && undatable.length) {
  fail(`--strict cannot date ${undatable.join('; ')}. Fix its paths in STATIC_PAGES.`);
}

const str = v => (v === null ? 'null' : `'${v}'`);
const output = `// Generated by scripts/generate-static-page-dates.js, which lists the pages and
// says where each date comes from. Edit the list there: this file is rewritten
// on every build, and a page with no date gets no <lastmod>.
export interface IStaticPage {
  route: string;
  lastmod: string | null;
  changefreq: string;
  priority: string | null;
}

export const staticPages: IStaticPage[] = [
${pages.map(p => `  { route: ${str(p.route)}, lastmod: ${str(p.lastmod)}, changefreq: ${str(p.changefreq)}, priority: ${str(p.priority)} },`).join('\n')}
];
`;

fs.writeFileSync(OUT_PATH, output, 'utf-8');
console.log(
  `[SEO-044] static-page-dates.ts: ${pages.length} pages, ${counts.git} dated from git, ` +
  `${counts.kept} kept from the previous file, ${counts.none} undated` +
  (history ? '' : ' (no git history here, so no date was looked up)')
);
