import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { ISocialNotification, SocialNotification } from '../models/notification';
import { Professional } from '../models/professional';
import { SocialArticle } from '../models/social-article';
import { SocialEvent } from '../models/social-event';
import { SocialNote } from '../models/social-note';
import { ISocialPost, SocialPostBase } from '../models/social-post';
import { SocialPromo } from '../models/social-promo';
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

  private _selectedTaxonomyType: SocialPostTaxonomyType;
  get selectedTaxonomyType() { return this._selectedTaxonomyType; }
  setTaxonomyType(type: SocialPostTaxonomyType) {
    this._selectedTaxonomyType = type;
  }

  private _selectedTopicId: string;
  get selectedTopicId() { return this._selectedTopicId; }
  private _selectedTopicIdChanged = new Subject<string>();
  selectedTopicIdChanged(): Observable<string> {
    return this._selectedTopicIdChanged.asObservable();
  }
  setTopicId(id: string) {
    this._selectedTopicId = id;
    this._selectedTopicIdChanged.next(this._selectedTopicId);
  }

  /** CAUTION: THIS IS TEMPORARY SOLUTION */
  /** only when content is deleted, the change will be sent to listeners */
  private _postCacheChanged = new Subject<void>();
  postCacheChanged(): Observable<void> {
    return this._postCacheChanged.asObservable();
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
  postOf(id: string): ISocialPost {
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

  findPostsByUserId(userId: string): ISocialPost[] {
    const result = [];
    for(let id in this.postCache.dataMap) {
      const post = this.postCache.dataMap[id];
      if(post.authorId == userId) {
        result.push(post);
      }
    }
    return result;
  }

  promosOfUser(userId: string): ISocialPost[] {
    const data = this.postCache.dataPerTaxonomy.users[userId];
    return data? data.promodata : null;
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
        promodata: null
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

  saveCachePromosOfUser(data: ISocialPost[], userId: string): ISocialPost[] {

    const cache = this.postCache.dataPerTaxonomy.users[userId];
    if (!cache) {
      this.postCache.dataPerTaxonomy.users[userId] = {
        userdata: null,
        postdata: null,
        promodata: []
      }
    } else if(!cache.promodata) {
      cache.promodata = [];
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

      this.postCache.dataPerTaxonomy.users[userId].promodata.push(this.postOf(idInMap));
      returnData.push(this.postOf(idInMap));
    }
    return returnData;
  }


  saveCacheSingle(data: ISocialPost, userId?: string) {
    const content = 
      data.contentType == 'NOTE' ? new SocialNote(data as ISocialPost) : 
      data.contentType == 'ARTICLE' ? new SocialArticle(data as ISocialPost) :
      data.contentType == 'EVENT' ? new SocialEvent(data as ISocialPost) :
      data.contentType == 'PROMO' ? new SocialPromo(data) :
      new SocialPostBase(data);

    // if cache doesn't exist, add in map.
    if(!this.postCache.dataMap[content._id]) {
      content.setSanitizedDescription(this._sanitizer.bypassSecurityTrustHtml(content.description));
      this.postCache.dataMap[content._id] = content;
    }

    // if userId is provided, it means the user created new post.
    // add the post at first position of postdata | promodata
    if(userId) {
      const dataType = data.contentType == 'PROMO' ? 'promodata' : 'postdata';
      if(!this.postCache.dataPerTaxonomy.users[userId][dataType]) {
        this.postCache.dataPerTaxonomy.users[userId][dataType] = [];
      }
      this.postCache.dataPerTaxonomy.users[userId][dataType].unshift(content);
    }
  }

  removeCacheSingle(data: ISocialPost) {
    for(let key in this.postCache.dataPerTaxonomy) {
      if(key != 'users') {
        const cache: IPostsPerTaxonomy = this.postCache.dataPerTaxonomy[key];
        cache.data = cache.data ? cache.data.filter(item => item._id != data._id) : null;
      } else {
        const cache: IProfileWithPosts = this.postCache.dataPerTaxonomy.users[data.authorId];
        if(cache?.postdata) {
          cache.postdata = cache.postdata.filter(item => item._id != data._id);
        }
        if(cache?.promodata) {
          cache.promodata = cache.promodata.filter(item => item._id != data._id);
        }
      }
    }
    this._postCacheChanged.next();
  }

  saveCacheProfile(data: Professional) {
    const cache = this.postCache.dataPerTaxonomy.users[data._id];
    if(!cache) {
      this.postCache.dataPerTaxonomy.users[data._id] = {
        userdata: data,
        postdata: null,
        promodata: null
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
    promotion: IPostsPerTaxonomy;
    note: IPostsPerTaxonomy;
    voice: IPostsPerTaxonomy;
    users: {[k: string]: IProfileWithPosts}
  }
}

class PostCache implements IPostCache {
  public dataMap: IPostCache['dataMap'];
  public dataPerTaxonomy: IPostCache['dataPerTaxonomy'];

  constructor() {
    this.dataMap = {};
    this.dataPerTaxonomy = {
      feed:      {metadata: null, data: null,},
      article:   {metadata: null, data: null,},
      event:     {metadata: null, data: null,},
      media:     {metadata: null, data: null,},
      promotion: {metadata: null, data: null,},
      note:      {metadata: null, data: null,},
      voice:     {metadata: null, data: null,},
      users: {},
    }
  }
}

interface IPostsPerTaxonomy {
  data: ISocialPost[];
  metadata?: {
    topic?: string;
    userId?: string; // loggedinUserId
    existMorePost?: boolean;
    eventTimeRange?: Date[]; // not implemented yet. this is for date filter
    filterByFollowing?: boolean;
  };
}

interface IProfileWithPosts {
  userdata: Professional,
  postdata: ISocialPost[],
  promodata: ISocialPost[],
}

export type SocialPostTaxonomyType = 'feed' | 'article' | 'event' | 'media' | 'promotion' | 'note' | 'voice';