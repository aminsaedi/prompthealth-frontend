import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { BlogSearchQuery, IBlogSearchQuery, IBlogSearchResult } from 'src/app/models/blog-search-query';
import { Profile } from 'src/app/models/profile';
import { IGetSocialContentsResult } from 'src/app/models/response-data';
import { ISocialContentSearchQuery, SocialContentSearchQuery } from 'src/app/models/social-content-search-query';
import { ISocialNote, SocialNote } from 'src/app/models/social-note';
import { ISocialPost, SocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation, fadeAnimation } from 'src/app/_helpers/animations';
import { environment } from 'src/environments/environment';
import { SocialPostTaxonomyType, SocialService } from '../social.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [expandVerticalAnimation, fadeAnimation],
})
export class ListComponent implements OnInit {

  get isEligibleToPost() { return (this.user && this.user.role != 'U');}
  get user() { return this._profileService.profile; }

  public newPosts: SocialPost[] = [];

  public posts: SocialPost[] = null;

  public countPerPage: number = 20;
  public selectedTopicId: string;
  public selectedTaxonomyType: SocialPostTaxonomyType;

  public isLoading: boolean = false;
  public isMorePosts: boolean = true;

  private subscriptionLoginStatus: Subscription;

  @HostListener('window:scroll', ['$event']) async onWindowScroll(e: Event) {
    if(!this.isLoading && this.isMorePosts && document.body && this.posts && this.posts.length > 0) {
      const startLoad = !!(document.body.scrollHeight < window.scrollY + window.innerHeight * 2);
      if(startLoad) {
        console.log('startLoad');
        this.isLoading = true;
        const postsFetched = await this.fetchPosts();
        postsFetched.forEach(p => {
          this.posts.push(p);
        });
      }
    }
  }

  constructor(
    private _route: ActivatedRoute,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnDestroy() {
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
  }

  ngOnInit(): void {

    this._route.params.subscribe((param: {taxonomyType: SocialPostTaxonomyType, topicId: string}) => {
      this.selectedTaxonomyType = param.taxonomyType || 'feed';
      this.selectedTopicId = param.topicId;

      const currentFilter = this._socialService.filterOf(this.selectedTaxonomyType);
      const topicIdAsCurrentFilter = currentFilter ? currentFilter.topic : null;
      // console.log(this.selectedTopicId, topicIdAsCurrentFilter)

      if(this.selectedTopicId != topicIdAsCurrentFilter){
        this._socialService.disposeCacheOf(this.selectedTaxonomyType);
      }

      if(this.selectedTaxonomyType == 'feed') {
        this.subscribeLoginStatusAndInitPost()
      }
      else {
        console.log('start init post for article / media / event');
        this.initPosts();
      }
    });
  }

  subscribeLoginStatusAndInitPost() {
    const status = this._profileService.loginStatus;
    if(status == 'loggedIn' || status == 'notLoggedIn') {
      this.initPosts();
    }
    
    if(!this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe(res => {
        if(res == 'loggedIn' || res == 'notLoggedIn') {
          this._socialService.disposeCacheOf('feed');
          this.initPosts();
        }
      });
    }
  }


  async initPosts() {    
    this.posts = null;
    const posts = this._socialService.postsOf(this.selectedTaxonomyType);
    if(!!posts) {
      setTimeout(() => {
        this.posts = posts;
        this._changeDetector.detectChanges();
        console.log('set posts from cache')
      }, 100);
    } else {
      try {
        this.posts = await this.fetchPosts(); 
      } catch (error) {
        console.log(error)
        this.posts = [];
      }
    }
  }

  fetchPosts(): Promise<SocialPost[]> {
    return new Promise((resolve, reject) => {
      const tax = this.selectedTaxonomyType;
      
      const params: ISocialContentSearchQuery = {
        count: this.countPerPage,
        ... (this.selectedTopicId) && {tags: [this.selectedTopicId]},
        ... (this.posts && this.posts.length > 0) && {
          page: Math.ceil(this.posts.length / this.countPerPage) + 1,
          timestamp: this.posts[0].createdAt,
        },
      }

      let req: Observable<any>;
      if (tax == 'feed' && this.user) {
        const query = new SocialContentSearchQuery(params);
        console.log(query.toQueryParams());
        req = this._sharedService.get('note/get-feed' + query.toQueryParams());
      } else {
        if(tax == 'feed') {
          params.authorId = environment.config.idSA;
        } else if (tax == 'article') {
          params.contentType = 'ARTICLE';
        } else if(tax == 'media') {
          params.hasMedia = true;
        } else if(tax == 'event') {
          params.contentType = 'EVENT';
          params.sort = 'eventStartTime';
        }

        const query = new SocialContentSearchQuery(params);
        console.log(query.toQueryParams());
        req = this._sharedService.getNoAuth('note/filter' + query.toQueryParams());
      } 

      this.isLoading = true;
      req.subscribe((res: IGetSocialContentsResult) => {
        this.isLoading = false;
        if(res.statusCode === 200) {
          this.isMorePosts = (res.data.data.length < this.countPerPage) ? false : true;
          const posts = this._socialService.saveCache(res.data.data, this.selectedTaxonomyType, this.selectedTopicId);
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

  onPublishNewPost(data: ISocialNote) {
    data.authorId = this._profileService.user;

    this.newPosts.unshift(new SocialNote(data));
  }
}
