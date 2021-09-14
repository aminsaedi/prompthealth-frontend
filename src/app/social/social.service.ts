import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { ISocialNotification, SocialNotification } from '../models/notification';
import { Professional } from '../models/professional';
import { SocialArticle } from '../models/social-article';
import { SocialEvent } from '../models/social-event';
import { SocialNote } from '../models/social-note';
import { ISocialPost, SocialPostBase } from '../models/social-post';
@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private postCache: PostCache;
  private notificationCache: SocialNotification[];

  private _selectedProfile: Professional = null;

  get notifications(): SocialNotification[] { return this.notificationCache; }
  get doneInitNotification(): boolean { return !!this.notificationCache; }


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


  metadataOf(taxonomy: SocialPostTaxonomyType) {
    const cache = this.postCache.dataPerTaxonomy[taxonomy];
    return cache ? cache.metadata : null;
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
  ): ISocialPost[] {
    if(this.postCache.dataPerTaxonomy[taxonomy] && this.postCache.dataPerTaxonomy[taxonomy].data) {
      const data = this.postCache.dataPerTaxonomy[taxonomy].data;
 
      let from = offset;
      let to = offset + count;
      return data.slice(from, to);

    } else {
      return null;
    }
  }

  postsOfUser(userId: string): ISocialPost[] {
    const data = this.postCache.dataPerTaxonomy.users[userId];
    return data ? data.postdata : null;
  }

  profileOf(userId: string): Professional {
    const profile = this.postCache.dataPerTaxonomy.users[userId];
    return profile ? profile.userdata : null;
  }

  dispose() {
    this.postCache = new PostCache();
    this.notificationCache = null;
  }

  disposeCacheOf(taxonomy: SocialPostTaxonomyType = 'feed') {
    this.postCache.dataPerTaxonomy[taxonomy] = {data: null};
    console.log('cache reset', taxonomy);
  }

  saveCache(data: ISocialPost[] = [], taxonomy: SocialPostTaxonomyType = 'feed', metadata: IPostsPerTaxonomy['metadata']): ISocialPost[] {
    this.postCache.dataPerTaxonomy[taxonomy].metadata = metadata;
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

  saveCachePostsOfUser(data: ISocialPost[], userId: string): ISocialPost[] {

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
        data.contentType == 'NOTE' ? new SocialNote(data as ISocialPost) : 
        data.contentType == 'ARTICLE' ? new SocialArticle(data as ISocialPost) :
        data.contentType == 'EVENT' ? new SocialEvent(data as ISocialPost) :
        new SocialPostBase(data);

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

  saveNotifications(data: ISocialNotification[]) {
    if(!this.notificationCache) {
      this.notificationCache = [];
    }
    data.forEach(d => {
      this.saveNotificationSingle(d);
    });
    this.notificationCache.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log(this.notificationCache);

  }

  saveNotificationSingle(data: ISocialNotification, sort: boolean = false) {
    if(!this.notificationCache) {
      this.notificationCache = [];
    }
    this.notificationCache.push(new SocialNotification(data));
    if(sort) {
      this.notificationCache.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  removeNotificationsAll() {
    if(this.notificationCache) {
      this.notificationCache = [];
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
    [k: string]: ISocialPost;
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
      feed:    {metadata: null, data: null,},
      article: {metadata: null, data: null,},
      event:   {metadata: null, data: null,},
      media:   {metadata: null, data: null,},
      users: {},
    }
  }
}

interface IPostsPerTaxonomy {
  data: ISocialPost[];
  metadata?: {
    topic?: string;
    userId?: string;
    existMorePost?: boolean;
    eventTimeRange?: (string|Date)[];
  };
}

interface IProfileWithPosts {
  userdata: Professional,
  postdata: ISocialPost[]
}

export type SocialPostTaxonomyType = 'feed' | 'article' | 'event' | 'media';