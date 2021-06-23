import { Injectable, Sanitizer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EmbedVideoService } from 'ngx-embed-video';
import { Blog, IBlog } from '../models/blog';
import { IBlogCategory } from '../models/blog-category';

@Injectable({
  providedIn: 'root'
})
export class MagazineService {

  private categoryCache: IBlogCategory[];
  private tagCache: IBlogCategory[];
  private postCache: PostCache;

  private countPerPage = 12;

  get categories(): any[] {
    return this.categoryCache;
  }

  get tags(): any[] {
    return this.tagCache;
  };

  taxonomyNameOf(taxonomyId: string) {
    let name: string = null;
    if (taxonomyId.match(/video|podcast/)) {
      name = taxonomyId;
    } else {
      name = this.categoryNameOf(taxonomyId);
      if(!name) {
        name = this.tagNameOf(taxonomyId);
      }
    }
    return name;
  }

  tagNameOf(tagId: string) {
    let name: string = null;
    if(this.tagCache) {
      for(let tag of this.tagCache) {
        if(tag._id == tagId) {
          name = tag.title;
          break;
        }
      }
    }
    return name;
  }

  categoryNameOf(catId: string) {
    let name: string = null;
    if (this.categoryCache) {
      for(let cat of this.categoryCache) {
        if(cat._id == catId) {
          name = cat.title;
          break;
        }
      }
    }
    return name;
  }

  getCategoryBySlug(slug: string) {
    let category: IBlogCategory = null;
    if(this.categoryCache) {
      for(let cat of this.categoryCache) {
        if(cat.slug == slug) {
          category = cat;
          break;
        }
      }
    }
    return category;
  }

  getTagBySlug(slug: string) {
    let tag: IBlogCategory = null;
    if(this.tagCache) {
      for(let t of this.tagCache) {
        if(t.slug == slug) {
          tag = t;
          break;
        }
      }
    }
    return tag;
  }


  pageTotalOf(catId: string = null) {
    let pageTotal: number = null;

    const cat = catId ? catId : 'all';
    const data = this.postCache.dataPerTaxonomy[cat];
    if(data) {
      pageTotal = data.pageTotal;
    }
    return pageTotal;
  }

  postTotalOf(catId: string = null) {
    let pageTotal: number = null;

    const cat = catId ? catId : 'all';
    const data = this.postCache.dataPerTaxonomy[cat];
    if(data) {
      pageTotal = data.postTotal;
    }
    return pageTotal;
  }

  postOf(slug: string) {
    const data = this.postCache.dataMapById;
    if(!data) { 
      return null; 
    } else {
      let result = null;
      for(let id in data) {
        const d = data[id];
        if(d.slug == slug) {
          result = d;
          break;
        }
      }
      return result;
    }
  }

  postsOf(catId: string = null, page: number = 1, from: number = 0, count: number = this.countPerPage, option?: {excluded?: string}): Blog[] {
    const cat = catId ? catId : 'all';
    if(this.postCache.dataPerTaxonomy[cat] && this.postCache.dataPerTaxonomy[cat].dataPerPage[page]) {
      const posts = [];
      const data = this.postCache.dataPerTaxonomy[cat].dataPerPage[page];
      const max = data.length > from + count ? from + count : data.length;
      for(let i=from; i<max; i++) {
        posts.push(data[i]);
      }
      return posts;
    } else {
      return null;
    }
  }


  constructor(
    private _embedService: EmbedVideoService,
    private _sanitizer: DomSanitizer,
  ) { 
    this.categoryCache = null;
    this.postCache = {
      dataMapById: {},
      dataPerTaxonomy: {}
    }
  }

  saveCache(res: {data: IBlog[], total: number}, page: number, catId: string = null): Blog[] {
    const pageTotal = Math.ceil(res.total / this.countPerPage);
    const dataPerPage = [];

    for(let d of res.data) { 
      let idInMap = null;
      for(let id in this.postCache.dataMapById) {
        if(d._id == id) {
          idInMap = id
          break;
        }
      }
      if(!idInMap) {
        this.saveCacheSingle(d);
        idInMap = d._id;
      }
      dataPerPage.push(this.postCache.dataMapById[idInMap]);
    }

    const targetCategory = catId ? catId : 'all';
    if(!this.postCache.dataPerTaxonomy[targetCategory]) {
      this.postCache.dataPerTaxonomy[targetCategory] = { pageTotal: pageTotal, postTotal: res.total, dataPerPage: {} };
    }
    this.postCache.dataPerTaxonomy[targetCategory].dataPerPage[page] = dataPerPage;
    return dataPerPage;
  }

  saveCacheSingle(data: IBlog) {
    if(!this.postCache.dataMapById[data._id]) {
      const b = new Blog(data);
      b.videoLinks.forEach(v => { b.addEmbedVideo(this.embedVideo(v)); });
      b.podcastLinks.forEach(v => { b.addEmbedPodcast(this.embedPodcast(v)); });
      b.setSanitizedDescription(this._sanitizer.bypassSecurityTrustHtml(b.description));

      this.postCache.dataMapById[data._id] = b;
    }
  }

  saveCacheCategories(data: IBlogCategory[]) {
    this.categoryCache = data;
  }

  saveCacheTags(data: IBlogCategory[]) {
    this.tagCache = data;
  }

  createDummyArray(count: number) {
    const data = [];
    for(let i=0; i<count; i++) {
      data.push(null);
    }
    return data;
  }

  embedVideo(data: {title: string, url: string}) {
    const iframe = this._embedService.embed(data.url);
    iframe.title = data.title;
    return iframe;
  }

  embedPodcast(data: {title: string, url: string}) {
    let iframe = `<iframe src=${data.url} width="100%" height="232" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    return this._sanitizer.bypassSecurityTrustHtml(iframe);
  }
}

interface PostCache {
  dataMapById: {
    [k: string]: Blog;
  },
  dataPerTaxonomy : {
    [k: string] : { // k is categoryId or 'all'
      pageTotal: number;
      postTotal: number;
      filter?: any;
      dataPerPage: {
        [k: number]: Blog[] // k is page number
      }
    };    
  }
}