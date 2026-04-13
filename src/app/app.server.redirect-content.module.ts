import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { default as axios } from 'axios';

const apiURL = environment.config.API_URL;
const rContentRedirect = Router();

// Match /community/content/:id where :id is a 24-char MongoDB ObjectId
// Redirect to /community/article/:slug with 301
const objectIdPattern = /^\/([a-f0-9]{24})(\/.*)?$/;

rContentRedirect.use('/', async (req, res, next) => {
  const match = req.path.match(objectIdPattern);
  if (!match) {
    // Not an ObjectId path (could be a slug-based path) — let Angular handle it
    return next();
  }

  const id = match[1];
  const subpath = match[2] || '';

  try {
    const result = await axios.get(apiURL + 'blog/get-slug/' + id, { timeout: 10000 });
    if (result.data.statusCode === 200 && result.data.data.slug) {
      const slug = result.data.data.slug;
      const target = `/community/article/${slug}${subpath}`;
      return res.redirect(301, target);
    }
  } catch (err) {
    // If API fails, fall through to Angular SSR
  }

  // No slug found — let Angular handle it (renders the article using the ObjectId)
  next();
});

export const routerRedirectForContent = rContentRedirect;
