import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { Blog } from 'src/app/models/blog';
import { IBlogCategory } from 'src/app/models/blog-category';
import { BlogSearchQuery } from 'src/app/models/blog-search-query';
import { IUserDetail } from 'src/app/models/user-detail';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { PostManagerService } from '../post-manager.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  private user: IUserDetail;
  public posts: Blog[];
  public catIdSelected: string = null;
  public statusSelected: Blog['status'] | 'ALL' = null;
  public order: 'asc' | 'desc' = 'desc';

  public postsTotal: number = 0;
  public pageCurrent: number = 1;
  
  get countPerPage() { return this._postsService.countPerPage; }
  
  get categories() {
    return this._postsService.categories || [];
  }
  get categoryNameSelected() {
    return this._postsService.categoryNameOf(this.catIdSelected) || 'All';
  }

  get statuses() { 
    return this._postsService.statuses; 
  }
  get statusNameSelected() {
    return this._postsService.statusNameOf(this.statusSelected);
  }
  statusNameOf(status: Blog['status']) {
    return this._postsService.statusNameOf(status);
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _postsService: PostManagerService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit() {
    this._route.params.subscribe(async (params: {page: number}) => {
      this._sharedService.loader('show');
      this.pageCurrent = params.page || 1;

      const userLS = this._uService.localStorage.getItem('user');
      if(userLS) {
        this.user = await this._profileService.getProfileDetail(JSON.parse(userLS));
        await this.initCategories();
        await this.initPosts();
      }
      this._sharedService.loader('hide');
    });
  }

  initCategories(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._postsService.categories) {
        resolve(true);
      } else {
        const path = `category/get-all`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this._postsService.saveCacheCategories(res.data.data);
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

  initPosts() {
    return new Promise((resolve, reject) => {
      const posts = this._postsService.postsPerPageOf(this.catIdSelected, this.pageCurrent);
      this.setPosts();
      resolve(true);
      if(!posts) {
        const path = 'blog/get-by-author/' + this.user._id;
        const query = new BlogSearchQuery();
        this._sharedService.get(path + query.queryParams).subscribe((res: any) => {
          if(res.statusCode === 200) {
            console.log(res);
            this._postsService.saveCache(res.data);
            this.setPosts();
            resolve(true)
          } else {
            console.log(res.message);
            this._toastr.error(res.message);
            reject(res.message);
          }
        }, (err) => {
          console.log(err);
          this._toastr.error(err);
          reject(err);
        });
      }
    });
  }


  setPosts() {
    const postsAll = this._postsService.postsAllOf(this.catIdSelected, this.statusSelected, this.order);
    this.postsTotal = postsAll ? postsAll.length : 0;

    this.posts = this._postsService.postsPerPageOf(this.catIdSelected, this.pageCurrent, this.statusSelected, this.order);
  }

  onChangePage(e: any) {
    this._router.navigate(['../', e], {relativeTo: this._route});
  }

  onChangeFilterCategory(category: IBlogCategory = null) {
    this.catIdSelected = category ? category._id : null;
    this.setPosts();
  }

  onChangeFilterStatus(status: Blog['status'] | 'ALL' = null) {
    this.statusSelected = status;
    this.setPosts();
  } 

  toggleOrder() {
    this.order = (this.order == 'asc') ? 'desc' : 'asc';
    this.setPosts()
  }


  hidePost(post: Blog) {
    const data = {
      id: post._id,
      status: 'HIDDEN',
    }
    const path = '/blog/updateStatus';
    this._sharedService.loader('show');
    this._sharedService.put(data, path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if(res.statusCode === 200) {
        this._toastr.success('Deleted successfully.');
        post.hide();
      }
    });
  }
}
