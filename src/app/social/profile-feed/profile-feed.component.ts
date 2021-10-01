import { Component, HostListener, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Professional } from 'src/app/models/professional';
import { IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { ISocialPostSearchQuery, SocialPostSearchQuery } from 'src/app/models/social-post-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { fadeAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';
import { ISocialPost } from 'src/app/models/social-post';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-feed',
  templateUrl: './profile-feed.component.html',
  styleUrls: ['./profile-feed.component.scss'],
  animations: [fadeAnimation],
})
export class ProfileFeedComponent implements OnInit {

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
  private isLoading = false;
  private subscription: Subscription;


  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    if(this.subscriptionCacheChange) {
      this.subscriptionCacheChange.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.onProfileChanged();
    this.subscription = this._socialService.selectedProfileChanged().subscribe(() => {
      this.onProfileChanged();
    });

    this.observeCacheChange();
  }

  observeCacheChange() {
    this.subscriptionCacheChange = this._socialService.postCacheChanged().subscribe(() => {
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
      this._uService.setMeta(this._router.url, {
        title: `Contents from ${this.profile.name}`,
        description: `Check out healthcare contents provided by ${this.profile.name}`,
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
      const params: ISocialPostSearchQuery = {
        count: this.countPerPage,
        ... (this.posts && this.posts.length > 0) && {
          page: (Math.ceil(this.posts.length / this.countPerPage) + 1),
          timestamp: this.posts[this.posts.length -1].createdAt,
        },
      }
      const query = new SocialPostSearchQuery(params);

      this.isLoading = true;
      const path = 'note/get-by-author/' + this.profile._id + query.toQueryParams();
      this._sharedService.get(path).subscribe((res: IGetSocialContentsByAuthorResult) => {
        if(res.statusCode == 200) {
          this.isMorePosts = (res.data.length < this.countPerPage) ? false : true;
          const posts = this._socialService.saveCachePostsOfUser(res.data, this.profile._id);
          resolve(posts);
        } else {
          console.log(res.message);
          reject();
        }
      }, (error) => {
        console.log(error);
        reject();
      }, () => {
        this.isLoading = false;
      })
    });
  }

}
