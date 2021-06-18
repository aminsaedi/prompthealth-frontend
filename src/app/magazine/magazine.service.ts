import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Blog, IBlog } from '../models/blog';
import { IBlogCategory } from '../models/blog-category';

@Injectable({
  providedIn: 'root'
})
export class MagazineService {

  private categoryCache: IBlogCategory[];
  private postCache: PostCache;

  private countPerPage = 12;

  get categories(): any[] {
    return this.categoryCache;
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

  postsOf(catId: string = null, page: number = 1, from: number = 0, count: number = this.countPerPage): Blog[] {
    const cat = catId ? catId : 'all';
    if(this.postCache.dataPerCategory[cat] && this.postCache.dataPerCategory[cat].dataPerPage[page]) {
      const posts = [];
      const data = this.postCache.dataPerCategory[cat].dataPerPage[page];
      console.log(data)
      const max = data.length > from + count ? from + count : data.length;
      for(let i=from; i<max; i++) {
        posts.push(data[i]);
      }
      return posts;
    } else {
      return null;
    }
  }

  constructor() { 
    this.categoryCache = null;
    this.postCache = {
      dataMapById: {},
      dataPerCategory: {}
    }
  }

  // fetchPosts(params: IBlogSearchQuery = {}): Promise<Blog[]> {
  //   return new Promise((resolve, reject) => {
  //     const query = new BlogSearchQuery(params);
  //     const cat = query.categoryId ? query.categoryId : 'all';
  //     const data = this.postCache.dataPerCategory[cat].dataPerPage[query.page]
  //     if(data) {
  //       resolve(data);
  //     }else {
  //       let path = 'blog/get-all' + query.toString();
  //       this._sharedService.getNoAuth(path).subscribe((res: any) => { 

  //       setTimeout(()=> {
  //         const data: IBlog[] = [];
  //         for(let i=0; i<query.limit; i++) {
  //           data.push(postDummy);
  //         }
      
  //         const posts = [];
  //         data.forEach(d => {
  //           posts.push(new Blog(d));
  //         });
 
  //         this.saveCache(posts, 10, query.page, cat);
  //         resolve(this.postCache.dataPerCategory[cat].dataPerPage[query.page]);
  
  //       }, 10000);    
  //     }
  //   });
  // }

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
        console.log(d)
        this.postCache.dataMapById[d._id] = new Blog(d, this.categoryCache);
        idInMap = d._id;
      }
      dataPerPage.push(this.postCache.dataMapById[idInMap]);
    }

    const targetCategory = catId ? catId : 'all';
    if(!this.postCache.dataPerCategory[targetCategory]) {
      this.postCache.dataPerCategory[targetCategory] = { pageTotal: pageTotal, dataPerPage: {} };
    }
    this.postCache.dataPerCategory[targetCategory].dataPerPage[page] = dataPerPage;
    return dataPerPage;
  }

  saveCacheSingle(data: IBlog) {
    if(!this.postCache.dataMapById[data._id]) {
      this.postCache.dataMapById[data._id] = new Blog(data, this.categories);
    }
  }

  saveCacheCategories(data: IBlogCategory[]) {
    this.categoryCache = data;
  }

  createDummyArray(count: number) {
    const data = [];
    for(let i=0; i<count; i++) {
      data.push(null);
    }
    return data;
  }
}
type PostCache = {
  dataMapById: {
    [k: string]: Blog;
  },
  dataPerCategory : {
    [k: string] : { // k is categoryId or 'all'
      pageTotal: number,
      dataPerPage: {
        [k: number]: Blog[] // k is page number
      }
    };    
  }
}




