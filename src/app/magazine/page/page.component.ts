import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Blog } from 'src/app/models/blog';
import { BlogSearchQuery } from 'src/app/models/blog-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MagazineService } from '../magazine.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  public data: Blog;
  public related: Blog[];

  constructor(
    private _mService: MagazineService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _route: ActivatedRoute,
  ) { }


  async ngOnInit() {
    try {
      await this.initCategories();
    } catch(err) {
      this._toastr.error('Something went wrong. Please try again later.');
    }

    this._route.params.subscribe(async (param: {slug: string}) => {
      await this.initPost(param.slug);
      this.initRelated();
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

  initPost(slug: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const post = this._mService.postOf(slug);
      if (post) {
        this.data = post;
        resolve(true);
      } else {
        const path = `blog/get-by-slug/${slug}`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if(res.statusCode === 200) {
            this._mService.saveCacheSingle(res.data);
            this.data = this._mService.postOf(slug);
            resolve(true);
          } else {
            console.log(res);
            reject(res.message);
          }
        }, err => {
          console.log(err);
          reject(err);
        });   
      }
    });
  }

  initRelated() {
    const catId = this.data.categoryId;
    const related = this._mService.postsOf(catId, 1, 0, 3);
    if (related) {
      this.related = related;
    } else {
      this.related = this._mService.createDummyArray(3);
      const query = new BlogSearchQuery({categoryId: catId});
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          this._mService.saveCache(res.data, 1);
          this.related = this._mService.postsOf(catId, 1, 0, 3);
        }
      });
    }
  }
}
