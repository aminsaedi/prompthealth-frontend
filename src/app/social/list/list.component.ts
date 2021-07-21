import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BlogSearchQuery, IBlogSearchQuery, IBlogSearchResult } from 'src/app/models/blog-search-query';
import { SocialPost } from 'src/app/models/social-post';
import { ISocialPostResult } from 'src/app/models/social-post-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SocialPostTaxonomyType, SocialService } from '../social.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {

  public posts: SocialPost[] = [];
  public targetPostId: string = null;

  public countPerPage: number = 3;
  public selectedTopicId: string;
  public selectedTaxonomyType: SocialPostTaxonomyType;

  public isLoading: boolean = false;
  public isMorePosts: boolean = true;

  private initDone: boolean = false;

  @HostListener('window:scroll', ['$event']) onWindowScroll(e: Event) {
    if(!this.isLoading && this.isMorePosts && document.body) {
      const startLoad = !!(document.body.scrollHeight < window.scrollY + window.innerHeight * 2);
      if(startLoad) {
        console.log('startLoad');
        this.isLoading = true;
        
        const page = Math.floor(this.posts.length / this.countPerPage) + 1 
        const params: IBlogSearchQuery = {page: page, count: this.countPerPage};
        this.fetchPosts(params);
      }
    }
  }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }



  ngOnInit(): void {
    this._route.params.subscribe((param: {taxonomyType: SocialPostTaxonomyType, topicId: string}) => {
      this.selectedTopicId = param.topicId || null;
      this.selectedTaxonomyType = param.taxonomyType || 'feed';

      if(this.initDone) {
        this.initPosts();
      }
    });

    this._route.queryParams.subscribe((param: {post: string}) => {
      this.targetPostId = param.post || null;
    
      if(this.initDone) {
        this.initPosts();
      }
    });

    this.initPosts();
    this.initDone = true;
  }

  initPosts() {
    const posts = this._socialService.postsOf(this.selectedTaxonomyType);
    if(!!posts) {
      this.posts = posts;
    } else {

      const params: IBlogSearchQuery = {count: this.countPerPage};
      if(this.selectedTopicId) { params.tags = [this.selectedTopicId] };
      if(this.selectedTaxonomyType == 'media') {
      } else if (this.selectedTaxonomyType == 'event') {
        
      }

      this.fetchPosts(params);
    }
  }

  fetchPosts(params: IBlogSearchQuery) {
    const query = new BlogSearchQuery(params);
    const path = `blog/get-all${query.queryParams}`;
    this.isLoading = true;
    this._sharedService.getNoAuth(path).subscribe((res: ISocialPostResult) => {
      this.isLoading = false;
      if(res.statusCode === 200) {
        this._socialService.saveCache(res.data.data);
        const posts = this._socialService.postsOf(this.selectedTaxonomyType, query.page);
        if(!this.posts) {
          this.posts = [];
        }
        posts.forEach(p => {
          this.posts.push(p);
        });
        this.isMorePosts = !!(this.posts.length < res.data.total);

      } else {
        console.log(res.message);
        this._toastr.error(res.message);
      }
    }, error => {
      console.log(error);
      this.isLoading = false;
      this.isMorePosts = false;
      this._toastr.error('Something went wrong. Please try again later.');
    });
  }

  onClickCardPost(e: Event, p: SocialPost) {
    e.preventDefault();
    e.stopPropagation();
    this._router.navigate(['./'], {queryParams: {post: p._id}, relativeTo: this._route, replaceUrl: (this.targetPostId ? true : false)});
  }
}
