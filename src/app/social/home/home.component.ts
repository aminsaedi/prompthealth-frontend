import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BlogSearchQuery, IBlogSearchQuery, IBlogSearchResult } from 'src/app/models/blog-search-query';
import { SocialPost } from 'src/app/models/social-post';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { SocialPostTaxonomyType, SocialService } from '../social.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [expandVerticalAnimation],
})
export class HomeComponent implements OnInit {

  public topics: Category[] = [];
  public posts: SocialPost[] = [];
  public targetPostId: string = null;

  public selectedTopicId: string;
  public selectedTaxonomyType: SocialPostTaxonomyType;

  constructor(
    private _catService: CategoryService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  ngOnInit(): void {
    this._catService.getCategoryAsync().then(cats => {
      this.topics = cats;
    });

    this._route.params.subscribe((param: {taxonomyType: SocialPostTaxonomyType, topicId: string}) => {
      this.selectedTopicId = param.topicId || null;
      this.selectedTaxonomyType = param.taxonomyType || 'all';

      this.initPosts();
    });

    this._route.queryParams.subscribe((param: {post: string}) => {
      this.targetPostId = param.post || null;
      this.initPosts();
    });
  }

  initPosts() {
    const posts = this._socialService.postsOf(this.selectedTaxonomyType);
    if(!!posts) {
      this.posts = posts;
    } else {
      this.posts = this._socialService.createDummyArray(3);

      const params: IBlogSearchQuery = {count: 24};
      if(this.selectedTopicId) { params.tags = [this.selectedTopicId] };

      const query = new BlogSearchQuery(params);
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: IBlogSearchResult) => {
        if (res.statusCode === 200) {
          this._socialService.saveCache(res.data.data);
          this.posts = this._socialService.postsOf(this.selectedTaxonomyType);
        } else {
          console.log(res.message);
          this._toastr.error(res.message);
        }
      }, error => {
        console.log(error);
        this._toastr.error('Something went wrong. Please try again later.');
      });
    }
  }

  onClickCardPost(e: Event, p: SocialPost) {
    if(window.innerWidth < 1200) {
      e.preventDefault();
      e.stopPropagation();
      this._router.navigate(['./'], {queryParams: {post: p._id}, relativeTo: this._route, replaceUrl: (this.targetPostId ? true : false)});
    }
  }
}
