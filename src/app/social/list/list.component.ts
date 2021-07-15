import { Component, OnInit } from '@angular/core';
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

  public selectedTopicId: string;
  public selectedTaxonomyType: SocialPostTaxonomyType;

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
      if(this.selectedTaxonomyType == 'media') {
      } else if (this.selectedTaxonomyType == 'event') {
        
      }

      const query = new BlogSearchQuery(params);
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: ISocialPostResult) => {
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
    e.preventDefault();
    e.stopPropagation();
    this._router.navigate(['./'], {queryParams: {post: p._id}, relativeTo: this._route, replaceUrl: (this.targetPostId ? true : false)});
  }
}
