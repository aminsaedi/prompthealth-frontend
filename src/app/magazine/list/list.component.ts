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

  public categoryName: string;
  public latest: Blog[];
  public archive: Blog[];

  public pageCurrent: number = 1;
  public paginators: number[][] = null;
  public pageTotal: number;
  public postTotal: number;

  public videos: any[];
  public podcasts;

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
    private _embedService: EmbedVideoService,
  ) { }

  async ngOnInit() {
    await this.initCategories();

    this._route.params.subscribe((param: {id: 'video' | 'podcast' | string}) => {
      if (param.id.match(/video|podcast/)) {
        this.categoryName = param.id;
      } else {
        this.categoryName = this._mService.categoryNameOf(param.id);
      }
      this.initPosts(param.id);
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

  initPosts(id: string) {

    const latest = this._mService.postsOf(id, 1, 0, 4);
    if(latest) {
        this.setPosts(id, 1);
      } else {
      this.latest = this._mService.createDummyArray(4);
      this.archive = this._mService.createDummyArray(8);

      const params: IBlogSearchQuery = {};
      if (id == 'video') {
        params.existVideo = true;
      } else if (id == 'podcast') {
        params.existPodcast = true;
      } else {
        params.categoryId = id;
      }
      const query = new BlogSearchQuery(params);
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          this._mService.saveCache(res.data, 1, id);
          this.setPosts(id, 1);
        }
      });
    }
  }

  setPosts(id: string, page: number = 1) {
    this.latest = this._mService.postsOf(id, 1, 0, 4);
    if(page == 1) {
      this.archive = this._mService.postsOf(id, 1, 4, 8);
    } else {
      this.archive = this._mService.postsOf(id, page, 0, 12);
    }

    this.pageTotal = this._mService.pageTotalOf(id);
    this.postTotal = this._mService.postTotalOf(id);
    this.setPaginators();
  }

  changePageTo(next: number) {
    this.pageCurrent = next;
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
