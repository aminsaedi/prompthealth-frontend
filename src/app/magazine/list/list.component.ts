import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmbedVideoService } from 'ngx-embed-video';
import { Blog } from 'src/app/models/blog';
import { BlogSearchQuery, IBlogSearchQuery } from 'src/app/models/blog-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MagazineService } from '../magazine.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public taxonomyName: string;
  private taxonomyType: string;

  public postType: string;
  public latest: Blog[];
  public archive: Blog[];

  public pageCurrent: number = 1;
  public paginators: number[][] = null;
  public pageTotal: number;
  public postTotal: number;

  paginatorShown(page: number) {
    if(!this.paginators || this.paginators.length == 0) {
      return false;
    } else if(page <= 2 || page >= (this.paginators.length - 1)) {
      return true;
    } else {
      const dist = (this.pageCurrent == 1 || this.pageCurrent == this.paginators.length) ? 2 : 1;
      if(Math.abs(page - this.pageCurrent) > dist) {
        return false;
      } else {
        return true;
      }
    }
  }

  constructor(
    private _route: ActivatedRoute,
    private _mService: MagazineService,
    private _sharedService: SharedService,
  ) { }

  async ngOnInit() {
    await this.initTaxonomy();

    this._route.data.subscribe((data: {taxonomyType: string}) => {
      this.taxonomyType = data.taxonomyType;
    });

    this._route.params.subscribe((param: {
      id: 'video' | 'podcast' | string, 
      page: number,
    }) => {
      this.pageCurrent = (param.page) ? param.page : 1;
      this.taxonomyName = this._mService.taxonomyNameOf(param.id);
      this.postType = this.taxonomyName.toLowerCase().match(/video|podcast|event|news/) ? this.taxonomyName : 'post';
      this.initPosts(this.taxonomyType, param.id, this.pageCurrent);
    });
  }

  initTaxonomy(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let isTaxonomyReady = true;
      const promiseAll = [];
      if(!this._mService.categories) {
        isTaxonomyReady = false;
        promiseAll.push(this.initCategories());
      }
      if(!this._mService.tags) {
        isTaxonomyReady = false;
        promiseAll.push(this.initTags());
      }

      if (isTaxonomyReady) {
        resolve(true);
      } else {
        Promise.all(promiseAll).then(() => {
          resolve(true);
        })
      }
    })
  }

  initCategories(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._mService.categories) {
        resolve(true);
      } else {
        const path = `category/get-categories`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this._mService.saveCacheCategories(res.data);
            resolve(true);
          }else {
            console.log(res);
            reject(res.message);
          }
        }, (error) => {
          console.log(error);
          reject(error);
        });
      }  
    });
  }

  initTags(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._mService.categories) {
        resolve(true);
      } else {
        const path = `tag/get-all`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this._mService.saveCacheTags(res.data.data);
            resolve(true);
          }else {
            reject(res.message);
          }
        }, (error) => {
          console.log(error);
          reject(error);
        });
      }  
    });
  }

  initPosts(taxonomyType: string, id: string, page: number = 1) {
    const latest = this._mService.postsOf(id, 1, 0, 4);
    this.setPosts(id, page);

    const promiseAll = [];
    if(!this.latest) {
      this.latest = this._mService.createDummyArray(4);
      promiseAll.push(this.fetchPosts(taxonomyType, id, 1));
    }
    if(!this.archive) {
      this.archive = this._mService.createDummyArray((page) == 1 ? 8 : 12);
      promiseAll.push(this.fetchPosts(taxonomyType, id, page));
    }

    Promise.all(promiseAll).then(() => {
      this.setPosts(id, page);
    });
  }

  fetchPosts(taxonomyType: string, id: string, page: number = 1): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const params: IBlogSearchQuery = {};
      if (taxonomyType == 'media') {
        if (id == 'video') {
          params.existVideo = true;
        } else if (id == 'podcast') {
          params.existPodcast = true;
        }
      } else if (taxonomyType == 'tag') {
        params.tags = [id];
      } else if (taxonomyType == 'category') {
        params.categoryId = id;
      }

      if(page != 1) {
        params.page = page;
      }
      const query = new BlogSearchQuery(params);
      console.log(page);
      console.log(query);
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          console.log(res);
          this._mService.saveCache(res.data, page, id);
          resolve(true);
        }
      });
    });
  }

  setPosts(id: string, page: number = 1) {
    this.latest = this._mService.postsOf(id, 1, 0, 4);
    if(page == 1) {
      this.archive = this._mService.postsOf(id, 1, 4, 8);
    } else {
      this.archive = this._mService.postsOf(id, page, 0, 12);
      console.log(this.archive);
    }

    this.pageTotal = this._mService.pageTotalOf(id);
    this.postTotal = this._mService.postTotalOf(id);
    this.setPaginators();
  }

  setPaginators() {
    if(!this.pageTotal || this.pageTotal <= 1) {
      this.paginators = null;
    } else {
      const paginators: {page: number; shown: boolean;}[] = [];
      for(let i=1; i<=this.pageTotal; i++) {
        let shown = false;
        if(i == 1 || i == this.pageTotal) { 
          shown = true; 
        } else {
          const dist = (this.pageCurrent == 1 || this.pageCurrent == this.pageTotal) ? 2 : 1;
          if(Math.abs(i - this.pageCurrent) > dist) {
            shown = false;
          } else {
            shown = true;
          }
        }

        paginators.push({
          page: i,
          shown: shown,
        });
      }

      this.paginators = [[]];
      paginators.forEach(p => {
        if(p.shown) {
          this.paginators[this.paginators.length - 1].push(p.page);
        } else {
          if(this.paginators[this.paginators.length - 1].length > 0) {
            this.paginators.push([]);
          }
        }
      });
    }
  }

  changePageTo(next: number) {
    // this.initPosts(this.categoryId, next);
  }
}
