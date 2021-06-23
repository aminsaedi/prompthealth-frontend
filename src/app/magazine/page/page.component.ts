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

  get isEvent() { return (this.data && this.data.catTitle && this.data.catTitle.toLowerCase().match(/event/)); }
  
  public data: Blog;
  public related: Blog[];

  public isReview: boolean = false;

  constructor(
    private _mService: MagazineService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _route: ActivatedRoute,
  ) { }


  async ngOnInit() {
    this._route.data.subscribe(async (data: {mode: 'review' | 'view'}) => {
      this.isReview = data.mode == 'review' ? true : false;
    });

    this._route.params.subscribe(async (param: {slug: string, id: string}) => {
      if(this.isReview) {
        await this.initPostById(param.id);
      } else {
        await this.initPost(param.slug);
        this.initRelated();          
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

  initPostById(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `blog/get-by-id/${id}`;
      this._sharedService.get(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          console.log(res);
        }
      });
    });
  }

  initRelated() {
    const catId = this.data.catId;
    const related = this._mService.postsOf(catId, 1, 0, 3);
    if (related) {
      this.related = related;
    } else {
      this.related = this._mService.createDummyArray(3);
      const query = new BlogSearchQuery({categoryId: catId});
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          this._mService.saveCache(res.data, 1, catId);
          this.related = this._mService.postsOf(catId, 1, 0, 3);
        }
      });
    }
  }
}
