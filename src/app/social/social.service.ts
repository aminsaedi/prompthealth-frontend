import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { Professional } from '../models/professional';
import { ISocialArticle, ISocialEvent, ISocialNote, SocialArticle, SocialEvent, SocialNote } from '../models/social-note';
import { ISocialPost, SocialPost } from '../models/social-post';
@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private postCache: PostCache;
  private _selectedProfile: Professional = null;

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
    this.postCache = new PostCache();
  }

  filterOf(taxonomy: SocialPostTaxonomyType) {
    const cache = this.postCache.dataPerTaxonomy[taxonomy];
    return cache ? cache.filter : null;
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

  postsOfUser(userId: string): (SocialPost|SocialNote|SocialArticle|SocialEvent)[] {
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

  disposeCacheOf(taxonomy: SocialPostTaxonomyType = 'feed') {
    this.postCache.dataPerTaxonomy[taxonomy] = {data: null};
    console.log('cache reset', taxonomy);
  }

  saveCache(data: ISocialPost[] = [], taxonomy: SocialPostTaxonomyType = 'feed', topic: string = null): SocialPost[] {
    this.postCache.dataPerTaxonomy[taxonomy].filter = {
      topic: topic,
    }
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

  saveCachePostsOfUser(data: ISocialPost[], userId: string): (SocialPost|SocialNote|SocialArticle|SocialEvent)[] {

    const cache = this.postCache.dataPerTaxonomy.users[userId];
    if (!cache) {
      this.postCache.dataPerTaxonomy.users[userId] = {
        userdata: null,
        postdata: [],
      }
    } else if(!cache.postdata) {
      cache.postdata = [];
    }

    const returnData = [];

    for(let d of data) {
      let idInMap = null;
      for(let id in this.postCache.dataMap) {
        if(d._id == id) {
          idInMap = id;
          break;
        }
      }
      if(!idInMap) {
        this.saveCacheSingle(d);
        idInMap = d._id;
      }

      this.postCache.dataPerTaxonomy.users[userId].postdata.push(this.postOf(idInMap));
      returnData.push(this.postOf(idInMap));
    }
    return returnData;
  }


  saveCacheSingle(data: ISocialPost) {
    if(!this.postCache.dataMap[data._id]) {
      const content = 
        data.contentType == 'NOTE' ? new SocialNote(data as ISocialNote) : 
        data.contentType == 'ARTICLE' ? new SocialArticle(data as ISocialArticle) :
        data.contentType == 'EVENT' ? new SocialEvent(data as ISocialEvent) :
        new SocialPost(data);

      content.setSanitizedDescription(this._sanitizer.bypassSecurityTrustHtml(content.description));
      this.postCache.dataMap[data._id] = content;
    }
  }

  saveCacheProfile(data: Professional) {
    const cache = this.postCache.dataPerTaxonomy.users[data._id];
    if(!cache) {
      this.postCache.dataPerTaxonomy.users[data._id] = {
        userdata: data,
        postdata: null,
      }
    }
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