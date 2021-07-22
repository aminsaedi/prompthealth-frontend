import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BlogSearchQuery, IBlogSearchQuery, IBlogSearchResult } from 'src/app/models/blog-search-query';
import { SocialPost } from 'src/app/models/social-post';
import { ISocialPostResult } from 'src/app/models/social-post-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { slideVerticalAnimation } from 'src/app/_helpers/animations';
import { SocialPostTaxonomyType, SocialService } from '../social.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideVerticalAnimation],
})
export class ListComponent implements OnInit {

  public posts: SocialPost[] = null;
  public targetPostId: string = null;

  public countPerPage: number = 3;
  public selectedTopicId: string;
  public selectedTaxonomyType: SocialPostTaxonomyType;

  public isLoading: boolean = false;
  public isMorePosts: boolean = true;

  private initDone: boolean = false;

  @HostListener('window:scroll', ['$event']) async onWindowScroll(e: Event) {
    if(!this.isLoading && this.isMorePosts && document.body) {
      const startLoad = !!(document.body.scrollHeight < window.scrollY + window.innerHeight * 2);
      if(startLoad) {
        console.log('startLoad');
        this.isLoading = true;
        
        const page = Math.floor(this.posts.length / this.countPerPage) + 1 
        const params: IBlogSearchQuery = {page: page, count: this.countPerPage};
        const postsFetched = await this.fetchPosts(params);
        postsFetched.forEach(p => {
          this.posts.push(p);
        });
      }
    }
  }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }



  ngOnInit(): void {
    const match = this._location.path().match(/community\/(feed|article|media|event)/);
    if(match) {
      this.selectedTaxonomyType = match[1] as SocialPostTaxonomyType;
    } else {
      this.selectedTaxonomyType = 'feed';
    }

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

  async initPosts() {
    const posts = this._socialService.postsOf(this.selectedTaxonomyType);
    if(!!posts) {
      this.posts = posts;
    } else {

      const params: IBlogSearchQuery = {count: this.countPerPage};
      if(this.selectedTopicId) { params.tags = [this.selectedTopicId] };
      if(this.selectedTaxonomyType == 'media') {
      } else if (this.selectedTaxonomyType == 'event') {
        
      }

      try {
        this.posts = await this.fetchPosts(params); 
      } catch (error) {
        this.posts = [];
      }
    }
  }

  fetchPosts(params: IBlogSearchQuery): Promise<SocialPost[]> {
    return new Promise((resolve, reject) => {
      const query = new BlogSearchQuery(params);
      const path = `blog/get-all${query.queryParams}`;
      this.isLoading = true;
      this._sharedService.getNoAuth(path).subscribe((res: ISocialPostResult) => {
        this.isLoading = false;
        if(res.statusCode === 200) {
          const posts = this._socialService.saveCache(res.data.data);
          const count = posts.length + (this.posts ? this.posts.length : 0);
          this.isMorePosts = (count >= res.data.total) ? false : true;
          resolve(posts);
        } else {
          this.isMorePosts = false;
          reject(res.message)
        }
      }, error => {
        this.isLoading = false;
        this.isMorePosts = false;
        console.log(error);
        reject('Something went wrong. Please try again later');
      });
    });
  }

  onClickCardPost(e: Event, p: SocialPost) {
    e.preventDefault();
    e.stopPropagation();
    this._router.navigate(['./'], {queryParams: {post: p._id}, relativeTo: this._route, replaceUrl: (this.targetPostId ? true : false)});
  }
}
