import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmbedVideoService } from 'ngx-embed-video';
import { ToastrService } from 'ngx-toastr';
import { Blog } from 'src/app/models/blog';
import { IBlogCategory } from 'src/app/models/blog-category';
import { BlogSearchQuery, IBlogSearchQuery } from 'src/app/models/blog-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MetaData, UniversalService } from 'src/app/shared/services/universal.service';
import { MagazineService } from '../magazine.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public taxonomyName: string; /** {categoryName} | {tagName} | video | podcast  */
  public taxonomySlug: string;
  public taxonomyId: string /** {categoryId} | {tagId} */
  public taxonomyType: TaxonomyType;

  public postType: string; /** news | video | podcast | post */
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
    private _router: Router,
    private _mService: MagazineService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
  ) { }

  async ngOnInit() {
    this._route.data.subscribe((data: {taxonomyType: TaxonomyType}) => {
      this.taxonomyType = data.taxonomyType;
    });

    this._route.params.subscribe( async (param: {
      slug: string, /** {categorySlug} | {tagSlug} */
      page: number,
    }) => {
      const meta: MetaData = {};
      this.taxonomySlug = param.slug;

      switch(this.taxonomyType) {
        case 'video' : 
          this.taxonomyName = 'video'; 
          this.taxonomyId = 'video';
          meta.title = 'Videos';
          meta.description = 'Check out our latest videos';
          break;
        case 'podcast' : 
          this.taxonomyName = 'podcast'; 
          this.taxonomyId = 'podcast';
          meta.title = 'Podcasts';
          meta.description = 'Check out our latest podcasts';
          break;
        case 'category' :
          await this.initCategories();
          const category = this._mService.getCategoryBySlug(param.slug);
          if(category) {
            this.taxonomyName = category.title;
            this.taxonomyId = category._id;
            meta.title = this.taxonomyName;
            meta.description = 'Check out our latest posts regarding to ' + this.taxonomyName;
          } else {
            console.error('cannot find category');
            this._router.navigate(['/magazines']);
            return;
          }
          break;
        case 'tag' :
          await this.initTags();
          const tag = this._mService.getTagBySlug(param.slug);
          if(tag) {
            this.taxonomyName = tag.title;
            this.taxonomyId = tag._id;
            meta.title = this.taxonomyName;
            meta.description = 'Check out our latest posts regarding to ' + this.taxonomyName;
          } else {
            console.error('cannot find tag');
            this._router.navigate(['/magazines']);
            return;
          }
          break;
      }

      this.pageCurrent = (param.page) ? param.page : 1;
      this.postType = this.taxonomyName.toLowerCase().match(/video|podcast|event|news/) ? this.taxonomyName : 'post';

      if(this.pageCurrent > 1) {
        meta.title += ` PAGE ${this.pageCurrent}`;
        meta.description += ` (page ${this.pageCurrent})`;
      }

      meta.title += ' | PromptHealth Magazines';
      this._uService.setMeta(this._router.url, meta);

      this.initPosts();
    });
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
      if (this._mService.tags) {
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

  initPosts() {
    this.setPosts(this.taxonomyId, this.pageCurrent);

    const promiseAll = [];
    if(!this.latest) {
      this.latest = this._mService.createDummyArray(4);
      promiseAll.push(this.fetchPosts(this.taxonomyType, this.taxonomyId, 1));
    }
    if(!this.archive) {
      this.archive = this._mService.createDummyArray((this.pageCurrent) == 1 ? 8 : 12);

      if(this.pageCurrent > 1) {
        promiseAll.push(this.fetchPosts(this.taxonomyType, this.taxonomyId, this.pageCurrent));
      }
    }

    Promise.all(promiseAll).then(() => {
      this.setPosts(this.taxonomyId, this.pageCurrent);
    });
  }

  fetchPosts(taxonomyType: TaxonomyType, id: string, page: number = 1): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const params: IBlogSearchQuery = {};
      if (taxonomyType == 'video') {
        params.existVideo = true;
      } else if (taxonomyType == 'podcast') {
        params.existPodcast = true;
      } else if (taxonomyType == 'tag') {
        params.tags = [id];
      } else if (taxonomyType == 'category') {
        params.categoryId = id;
      }

      if(page != 1) {
        params.page = page;
      }

      const query = new BlogSearchQuery(params);
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
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
      console.log(this.archive);
    } else {
      this.archive = this._mService.postsOf(id, page, 0, 12);
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
}

type TaxonomyType = 'category' | 'tag' | 'podcast' | 'video';
