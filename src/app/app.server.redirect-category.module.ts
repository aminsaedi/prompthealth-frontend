import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { default as axios } from 'axios';
import { slugify } from 'src/app/_helpers/slugify';

const apiURL = environment.config.API_URL;
const rCategory = Router();

// Cache the id→slug map so we only fetch once
let idToSlugMap: { [id: string]: string } | null = null;

async function getIdToSlugMap(): Promise<{ [id: string]: string }> {
  if (idToSlugMap) return idToSlugMap;

  const map: { [id: string]: string } = {};
  try {
    const res = await axios.get(apiURL + 'questionare/get-service', { timeout: 10000 });
    if (res.status === 200) {
      for (const data of res.data.data) {
        if (data.category_type.toLowerCase() === 'goal') {
          for (const cat of data.category) {
            const s = slugify(cat.item_text);
            if (s) map[cat._id] = s;
            if (cat.subCategory) {
              for (const sub of cat.subCategory) {
                const ss = slugify(sub.item_text);
                if (ss) map[sub._id] = ss;
              }
            }
          }
          break;
        }
      }
    }
  } catch (err) {
    // If API fails, return empty map — the request will fall through to Angular
  }
  idToSlugMap = map;
  return map;
}

// Match MongoDB ObjectId pattern (24 hex chars)
const objectIdPattern = /^\/([a-f0-9]{24})(\/(.+))?$/;

rCategory.use('/', async (req, res, next) => {
  const match = req.path.match(objectIdPattern);
  if (!match) {
    return next();
  }

  const id = match[1];
  const city = match[3] || '';
  const map = await getIdToSlugMap();
  const slug = map[id];

  if (slug) {
    const target = city
      ? `/practitioners/category/${slug}/${city}`
      : `/practitioners/category/${slug}`;
    return res.redirect(301, target);
  }

  // Unknown ID — let Angular handle it
  next();
});

export const routerRedirectForCategory = rCategory;
