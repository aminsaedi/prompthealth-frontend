import { Component, HostListener, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Professional } from 'src/app/models/professional';
import { IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { ISocialPostSearchQuery, SocialPostSearchQuery } from 'src/app/models/social-content-search-query';
import { ISocialArticle, ISocialEvent, ISocialNote, SocialArticle, SocialEvent, SocialNote } from 'src/app/models/social-note';
import { ISocialPost, SocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { fadeAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-feed',
  templateUrl: './profile-feed.component.html',
  styleUrls: ['./profile-feed.component.scss'],
  animations: [fadeAnimation],
})
export class ProfileFeedComponent implements OnInit {

  public profile: Professional;
  public posts: (SocialPost|SocialNote|SocialArticle|SocialEvent)[];

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

  private countPerPage = 20;
  private isMorePosts = true;
  private isLoading = false;
  private subscription: Subscription;


  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    const profile = this._socialService.selectedProfile;
    this.onProfileChanged(profile);

    this.subscription = this._socialService.selectedProfileChanged().subscribe(p => {
      this.onProfileChanged(p);
    });
  }

  onProfileChanged(p: Professional) {
    if(p && (!this.profile || this.profile._id != p._id)) {
      this.profile = p;
      const posts = this._socialService.postsOfUser(p._id);
      if (posts) {
        this.posts = posts;
      } else {
        this.initPosts()
      }
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

  fetchPosts(): Promise<(SocialPost|SocialNote|SocialArticle|SocialEvent)[]> {
    console.log('fetch')
    return new Promise((resolve, reject) => {
      const params: ISocialPostSearchQuery = {
        count: this.countPerPage,
        ... (this.posts && this.posts.length > 0) && {
          page: (Math.ceil(this.posts.length / this.countPerPage) + 1),
          timestamp: this.posts[0].createdAt,
        },
      }
      const query = new SocialPostSearchQuery(params);

      this.isLoading = true;
      const path = 'note/get-by-author/' + this.profile._id + query.toQueryParams();
      this._sharedService.getNoAuth(path).subscribe((res: IGetSocialContentsByAuthorResult) => {
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
