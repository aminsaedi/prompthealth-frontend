import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { default as axios } from 'axios';
import { slugify } from 'src/app/_helpers/slugify';
import { QuestionnaireAnswer } from './shared/services/questionnaire.service';

const apiURL = environment.config.API_URL;
const rTypeOfProvider = Router();

// Cache the id→slug map so we only fetch once
let idToSlugMap: { [id: string]: string } | null = null;

async function getIdToSlugMap(): Promise<{ [id: string]: string }> {
  if (idToSlugMap) return idToSlugMap;

  const map: { [id: string]: string } = {};
  try {
    const res = await axios.get(apiURL + 'questionare/get-questions?type=SP', { timeout: 10000 });
    if (res.status === 200) {
      const qs = res.data.data;
      for (const q of qs) {
        if (q.slug === 'providers-are-you') {
          q.answers.forEach((a: QuestionnaireAnswer) => {
            const s = slugify(a.item_text);
            if (s) map[a._id] = s;
          });
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

rTypeOfProvider.use('/', async (req, res, next) => {
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
      ? `/practitioners/type/${slug}/${city}`
      : `/practitioners/type/${slug}`;
    return res.redirect(301, target);
  }

  // Unknown ID — let Angular handle it
  next();
});

export const routerRedirectForTypeOfProvider = rTypeOfProvider;
