import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { ISocialPostSearchQuery, SocialPostSearchQuery } from 'src/app/models/social-post-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';
import { fadeAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'app-profile-event-upcoming',
  templateUrl: './profile-event-upcoming.component.html',
  styleUrls: ['./profile-event-upcoming.component.scss'],
  animations: [fadeAnimation],
})
export class ProfileEventUpcomingComponent implements OnInit {

  get profile() { return this._socialService.selectedProfile; }
  
  public events: ISocialPost[];
  private isMorePosts = true;
  private countPerPage = 20;
  public isLoading = false;

  private subscriptionCacheChange: Subscription;
  private subscription: Subscription;


  @HostListener('window:scroll', ['$event']) async onWindowScroll(e: Event) {
    if(!this.isLoading && this.isMorePosts && document.body && this.events?.length > 0) {
      const startLoad = !!(document.body.scrollHeight < window.scrollY + window.innerHeight * 2);
      if(startLoad) {
        this.isLoading = true;
        const postsFetched = await this.fetchPosts();
        postsFetched.forEach(p => {
          this.events.push(p);
        });
      }
    }
  }

  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.subscriptionCacheChange?.unsubscribe();
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
    this.initPosts();
  }

  setMeta() {
    if(this.profile) {
      this._uService.setMeta(this._router.url, {
        title: 'Upcoming events' + ` from ${this.profile.name} | PromptHealth Community`,
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
        this.events = posts;
      })
    } else {
      try {
        this.events = await this.fetchPosts();
      } catch (error) {
        this.events = [];
      }
    }
  }

  fetchPosts(): Promise<ISocialPost[]> {
    return new Promise((resolve, reject) => {
      const timeRangeStart: Date = this.events?.length > 0 ? this.events[0].startAt : new Date();

      const params: ISocialPostSearchQuery = {
        count: this.countPerPage,
        contentType: 'EVENT',
        sortBy: 'eventStartTime',
        order: 'asc',
        eventTimeRange: [timeRangeStart.toISOString()],
        ... (this.events && this.events.length > 0) && {
          timestamp: this.events[this.events.length -1].createdAt,
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
