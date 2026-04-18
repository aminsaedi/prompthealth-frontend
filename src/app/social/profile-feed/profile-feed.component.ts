import { Component, HostListener, OnInit , OnDestroy } from '@angular/core';
import { Subscription , Subject } from 'rxjs';
import { IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { ISocialPostSearchQuery, SocialPostSearchQuery } from 'src/app/models/social-post-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { fadeAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';
import { ISocialPost } from 'src/app/models/social-post';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile-feed',
  templateUrl: './profile-feed.component.html',
  styleUrls: ['./profile-feed.component.scss'],
  animations: [fadeAnimation],
})
export class ProfileFeedComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get profile() { return this._socialService.selectedProfile; }

  public posts: ISocialPost[];
  private subscriptionCacheChange: Subscription;


  @HostListener('window:scroll', ['$event']) async onWindowScroll(e: Event) {
    if(!this.isLoading && this.isMorePosts && document.body && this.posts && this.posts.length > 0) {
      const startLoad = !!(document.body.scrollHeight < window.scrollY + window.innerHeight * 2);
      if(startLoad) {
        this.isLoading = true;
        const postsFetched = await this.fetchPosts();
        postsFetched.forEach(p => {
          this.posts.push(p);
        });
      }
    }
  }

  private countPerPage = 20;
  private isMorePosts = true;
  public isLoading = false;
  private subscription: Subscription;


  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();

    if(this.subscriptionCacheChange) {
      this.subscriptionCacheChange.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.onProfileChanged();
    this.subscription = this._socialService.selectedProfileChanged().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onProfileChanged();
    });

    this.observeCacheChange();
  }

  observeCacheChange() {
    this.subscriptionCacheChange = this._socialService.postCacheChanged().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.initPosts();
    });
  }

  onProfileChanged() {
    this.setMeta();
    if(this.profile) {
      const posts = this._socialService.postsOfUser(this.profile._id);
      if (posts) {
        this.posts = posts;
      } else {
        this.initPosts();
      }
    }
  }

  setMeta() {
    if(this.profile) {
      const contentType = this._route.snapshot.data.contentType;

      this._uService.setMeta(this._router.url, {
        title: (contentType == 'event' ? `Events` : `Contents`) + ` from ${this.profile.name} | PromptHealth Community`,
        description: `Read health articles, tips, and posts shared by ${this.profile.name} on PromptHealth.`,
        image: this.profile.imageFull,
        imageType: this.profile.imageType,
        imageAlt: this.profile.name,
      });  
    }
  }

  async initPosts() {
    const posts = this._socialService.postsOfUser(this.profile._id);
    if (posts) {
      setTimeout(() => {
        this.posts = posts;
      }, 100)
    } else {
      try {
        this.posts = await this.fetchPosts();
      } catch (error) {
        this.posts = [];
      }
    }
  }

  fetchPosts(): Promise<ISocialPost[]> {
    return new Promise((resolve, reject) => {
      const contentType = this._route.snapshot.data.contentType;
      const params: ISocialPostSearchQuery = {
        count: this.countPerPage,
        ... (this.posts && this.posts.length > 0) && {
          // page: (Math.ceil(this.posts.length / this.countPerPage) + 1),
          timestamp: this.posts[this.posts.length -1].createdAt,
        },
        ... (contentType) && { contentType: contentType.toUpperCase() },
        ... (contentType == 'event') && {
          sortBy: 'eventStartTime',
          order: 'asc',
          eventTimeRange: [new Date().toString()]
        }
      }
      const query = new SocialPostSearchQuery(params);


      this.isLoading = true;
      const path = 'note/get-by-author/' + this.profile._id + query.toQueryParams();
      this._sharedService.get(path).pipe(takeUntil(this.destroy$)).subscribe((res: IGetSocialContentsByAuthorResult) => {
        if(res.statusCode == 200) {
          this.isMorePosts = (res.data.length < this.countPerPage) ? false : true;
          const posts = this._socialService.saveCachePostsOfUser(res.data, this.profile._id);
          resolve(posts);
        } else {
          reject();
        }
      }, (error) => {
        reject();
      }, () => {
        this.isLoading = false;
      })
    });
  }

}
