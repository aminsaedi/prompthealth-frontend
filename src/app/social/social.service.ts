import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { IBlogCategory } from '../models/blog-category';
import { Professional } from '../models/professional';
import { ISocialPost, SocialPost } from '../models/social-post';
@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private categoryCache: IBlogCategory[];
  private tagCache: IBlogCategory[];
  private postCache: PostCache;
  private _selectedProfile: Professional = null;

  get categories(): any[] {
    return this.categoryCache;
  }

  get tags(): any[] {
    return this.tagCache;
  };

  get selectedProfile() { return this._selectedProfile; }
  private _selectedProfileChanged = new Subject<Professional>();
  selectedProfileChanged(): Observable<Professional> {
    return this._selectedProfileChanged.asObservable();
  }
  setProfile(p: Professional) { 
    this._selectedProfile = p; 
    this._selectedProfileChanged.next(p);
  }
  disposeProfile() { 
    this._selectedProfile = null; 
    this._selectedProfileChanged.next(null);
  }

  constructor(
    private _sanitizer: DomSanitizer,
  ) { 
    this.categoryCache = null;
    this.postCache = new PostCache();
  }

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

  get categoryEvent() {
    let cat: IBlogCategory = null;
    if(this.categoryCache) {
      for (let c of this.categoryCache) {
        if(c.slug.match(/event/)) {
          cat = c;
          break;
        }
      }
    }
    return cat;
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

  postOf(id: string) {
    const data = this.postCache.dataMap;
    if(!data) { 
      return null; 
    } else {
      let result = null;
      for(let _id in data) {
        const d = data[_id];
        if(d._id == id) {
          result = d;
          break;
        }
      }
      return result;
    }
  }

  postOfSlug(slug: string) {
    const data = this.postCache.dataMap;
    let result = null;
    if(!!data) {
      for(let id in data) {
        if(data[id].slug == slug) {
          result = data[id];
          break;
        }
      }
    }
    return result;
  }

  postsOf(
    taxonomy: SocialPostTaxonomyType = 'feed',
    offset: number = 0, 
    count: number = 100000000, 
  ): SocialPost[] {
    if(this.postCache.dataPerTaxonomy[taxonomy] && this.postCache.dataPerTaxonomy[taxonomy].data) {
      const data = this.postCache.dataPerTaxonomy[taxonomy].data;
 
      let from = offset;
      let to = offset + count;
      return data.slice(from, to);

    } else {
      return null;
    }
  }

  postsOfUser(userId: string): SocialPost[] {
    const data = this.postCache.dataPerTaxonomy.users[userId];
    return data ? data.postdata : null;
  }

  profileOf(userId: string): Professional {
    const profile = this.postCache.dataPerTaxonomy.users[userId];
    return profile ? profile.userdata : null;
  }

  dispose() {
    this.postCache = new PostCache();
  }

  saveCache(data: ISocialPost[] = [], taxonomy: SocialPostTaxonomyType = 'feed'): SocialPost[] {
    if(!this.postCache.dataPerTaxonomy[taxonomy].data) {
      this.postCache.dataPerTaxonomy[taxonomy].data = [];
    }

    const returnData = [];
    
    for(let d of data) {
      let idInMap = null;
      for(let id in this.postCache.dataMap) {
        if(d._id == id) {
          idInMap = id
          break;
        }
      }
      if(!idInMap) {
        this.saveCacheSingle(d);
        idInMap = d._id;
      }

      this.postCache.dataPerTaxonomy[taxonomy].data.push(this.postOf(idInMap));
      returnData.push(this.postOf(idInMap));
    }

    return returnData;
  }

  saveCacheSingle(data: ISocialPost) {
    if(!this.postCache.dataMap[data._id]) {
      const b = new SocialPost(data);
      // b.videoLinks.forEach(v => { b.addEmbedVideo(this.embedVideo(v)); });
      // if(b.videoLinks && b.videoLinks.length > 0) {
      //   b.setEmbedVideoAsThumbnail(this.embedVideoAsThumbnail(b.videoLinks[0]));
      // }
      // b.podcastLinks.forEach(v => { b.addEmbedPodcast(this.embedPodcast(v)); });
      b.setSanitizedDescription(this._sanitizer.bypassSecurityTrustHtml(b.description));

      this.postCache.dataMap[data._id] = b;
    }
  }

  saveCacheProfile(data: Professional) {
    console.log(data);
    if(!this.postCache.dataPerTaxonomy.users[data._id]) {
      this.postCache.dataPerTaxonomy.users[data._id] = {
        userdata: data,
        postdata: null,
      }
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
}

interface IPostCache {
  dataMap: {
    [k: string]: SocialPost;
  },
  dataPerTaxonomy : {
    feed: IPostsPerTaxonomy;
    article: IPostsPerTaxonomy;
    event: IPostsPerTaxonomy;
    media: IPostsPerTaxonomy;
    users: {[k: string]: IProfileWithPosts}
  }
}

class PostCache implements IPostCache {
  public dataMap: IPostCache['dataMap'];
  public dataPerTaxonomy: IPostCache['dataPerTaxonomy'];

  constructor() {
    this.dataMap = {};
    this.dataPerTaxonomy = {
      feed:    {filter: null, data: null,},
      article: {filter: null, data: null,},
      event:   {filter: null, data: null,},
      media:   {filter: null, data: null,},
      users: {},
    }
  }
}

interface IPostsPerTaxonomy {
  data: SocialPost[];
  filter?: {
    topic?: string;
  };
}

interface IProfileWithPosts {
  userdata: Professional,
  postdata: SocialPost[]
}

export type SocialPostTaxonomyType = 'feed' | 'article' | 'event' | 'media';