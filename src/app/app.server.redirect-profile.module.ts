import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { getWithDeadline } from 'src/app/_helpers/get-with-deadline';
import { withQueryOf } from 'src/app/_helpers/with-query-of';

const apiURL = environment.config.API_URL;
const rProfileRedirect = Router();

// Match /community/profile/:id where :id is a 24-char MongoDB ObjectId
// Redirect to /practitioners/:slug with 301
const objectIdPattern = /^\/([a-f0-9]{24})(\/.*)?$/;

rProfileRedirect.use('/', async (req, res, next) => {
  const match = req.path.match(objectIdPattern);
  if (!match) {
    // Not an ObjectId path (could be a slug-based path) — let Angular handle it
    return next();
  }

  const id = match[1];
  const subpath = match[2] || '';

  try {
    const result = await getWithDeadline(apiURL + 'user/get-slug/' + id);
    if (result.data.statusCode === 200 && result.data.data.slug) {
      const slug = result.data.data.slug;
      const target = `/practitioners/${slug}${subpath}`;
      return res.redirect(301, withQueryOf(req.originalUrl, target));
    }
  } catch (err) {
    // If API fails, fall through to Angular SSR
  }

  // No slug found — let Angular handle it (renders the profile using the ObjectId)
  next();
});

export const routerRedirectForProfile = rProfileRedirect;
