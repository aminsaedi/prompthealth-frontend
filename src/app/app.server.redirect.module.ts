
import { Router } from 'express';
import { environment } from 'src/environments/environment';
import { default as axios } from 'axios';

const apiURL = environment.config.API_URL;
const rMagazine = Router();

rMagazine.use('/podcast', (req, res) => { res.redirect('/community/voice'); });
rMagazine.use('/event', (req, res) => { res.redirect('/community/event'); });
rMagazine.use('/category/knowledge', (req, res) => { res.redirect('/community/article'); });
rMagazine.use('/category/news', (req, res) => { res.redirect('/community/feed'); });
rMagazine.use('/tag', (req, res) => {
  const pathArray = req.path.split('/');
  const tag = pathArray[1];
  let id: string;
  switch(tag) {
    case 'mental-health': id = '5eb1a4e199957471610e6ce1'; break;
    case 'musculoskeletal-health': id = '5eb1a4e199957471610e6ce7'; break;
    case 'hormonal-health': id = '5eb1a4e199957471610e6ce8'; break;
    case 'primary-care': id = '5eb1a4e199957471610e6ce0'; break;
    case 'skin-health': id = '5eb1a4e199957471610e6ce5'; break;
    case 'fitness': id = '5eb1a4e199957471610e6ce3'; break;
    case 'sleep': id = '5eb1a4e199957471610e6ce4'; break;
    case 'immunity': id = '5eb1a4e199957471610e6ce6'; break;
    case 'nutrition': id = '5eb1a4e199957471610e6ce2'; break;
    default: id = null; break;
  }
  res.redirect('/community/feed' + (id ? '/' + id : ''));
});

rMagazine.use('/', (req, res) => {
  const slug = req.path.substr(1);
  if(slug) {
    axios.get(apiURL + 'blog/get-by-slug/' + slug).then(result => {
      if(result.data.statusCode == 200 && result.data.data.status == 'APPROVED') {
        res.redirect('/community/content/' + result.data.data._id);
      } else {
        res.redirect('/404');
      }
    }).catch(error => {
      res.redirect('/404');
    });
  } else {
    res.redirect('/community/feed');
  }
});

export const routerRedirectForMagazine= rMagazine;
