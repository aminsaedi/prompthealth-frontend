import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { IFollowMultipleResult, IGetFollowingTopicsResult, IGetSocialContentsResult } from 'src/app/models/response-data';
import { ISocialPostSearchQuery, SocialPostSearchQuery } from 'src/app/models/social-post-search-query';
import { SocialNote } from 'src/app/models/social-note';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation, fadeAnimation } from 'src/app/_helpers/animations';
import { SocialPostTaxonomyType, SocialService } from '../social.service';
import { ISocialPost } from 'src/app/models/social-post';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormItemServiceComponent } from 'src/app/shared/form-item-service/form-item-service.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [expandVerticalAnimation, fadeAnimation],
})
export class ListComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get selectedTopicId() { return this._socialService.selectedTopicId; }
  get selectedTaxonomyType() { return this._socialService.selectedTaxonomyType; }
  get selectedFollowingTopicIds() { return this.formItemService?.getSelected() || []; }
  get isFilterByFollowingOn() { return !!(this.user && !this.selectedTopicId); }
  get noFollowings() { return (this.user?.numFollowing == 0 && this.user?.followingTopics?.length == 0); }

  @ViewChild('formItemService') private formItemService: FormItemServiceComponent;

  // get labels() {
  //   let ls = [];
  //   if(this.user && !this.selectedTopicId) {
  //     ls.push('feed');
  //   }

  //   if(this.selectedTaxonomyType != 'feed') {
  //     ls.push(this.selectedTaxonomyType); 
  //   }
  //   if(this.selectedTopicId) { ls.push('topic-' + this.selectedTopicId.substr(-5, 5)); }

  //   return ls;
  // }

  public newPosts: ISocialPost[] = [];

  public posts: ISocialPost[] = null;

  public countPerPage: number = 20;

  public isLoading: boolean = false;
  public isSelectTopicsUploading: boolean = false;
  public isSelectTopicsUploadDone: boolean = false;
  public isMorePosts: boolean = true;

  private subscriptionLoginStatus: Subscription;
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

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _changeDetector: ChangeDetectorRef,
    private _uService: UniversalService,
    private _catService: CategoryService,
    private _sanitizer: DomSanitizer,
    private _toastr: ToastrService,
  ) { }

  ngOnDestroy() {
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
    if(this.subscriptionCacheChange) {
      this.subscriptionCacheChange.unsubscribe();
    }
  }

  ngOnInit(): void {
    this._route.params.subscribe((param: {taxonomyType: SocialPostTaxonomyType, topicId: string}) => {
      this._socialService.setTaxonomyType(param.taxonomyType || 'feed');
      this._socialService.setTopicId(param.topicId || null);
      this.setMeta();
      this.checkLoginStatusAndInitPost();
    });

    this.observeCacheChange();
  }

  async setMeta() {
    const type = this.selectedTaxonomyType.charAt(0).toUpperCase() + this.selectedTaxonomyType.substr(1).toLowerCase();
    let topic = null;
    if(this.selectedTopicId) {
      const topics = await this._catService.getCategoryAsync();
      const topicData = topics.find(item => item._id == this.selectedTopicId);
      topic = topicData.item_text.toLowerCase();
    }

    let desc: string;
    switch(this.selectedTaxonomyType) {
      case 'feed': desc = `See what\'s happening in healthcare scene${topic ? ' about ' + topic : ''} around the world.`; break;
      case 'article': desc = `Larn about healthcare topics${topic ? ' about ' + topic : ''} and improve your health with us!`; break;
      case 'event': desc = `Find your favorite healthcare event${topic ? ' about ' + topic : ''} and join now!`; break;
      case 'media': desc = `Find your favorite quick tips${topic ? ' about ' + topic : ''} from best providers with voice, photos and media`; break;
      case 'note': desc = `Find latest update${topic ? ' about ' + topic : '' } from best providers`; break;
      case 'voice': desc = `Find latest update with voice note${topic ? ' about ' + topic : '' } from best providers`; break;
      case 'promotion': desc = `Find your favorite products`; break;
    } 

    this._uService.setMeta(this._router.url, {
      title: `PromptHealth Community | ${type == 'feed' ? 'Home' : (type + 's')}${topic ? (': collection of ' + topic) : ''}`,
      description: desc,
    });
  }

  checkLoginStatusAndInitPost() {
    const status = this._profileService.loginStatus;
    this.fetchFollowTopicsIfNotExist()
    if(status == 'loggedIn' || status == 'notLoggedIn') {
      this.initPosts();
    }
    
    if(!this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe(res => {
      this.fetchFollowTopicsIfNotExist()
        if(res == 'loggedIn' || res == 'notLoggedIn') {
          this.initPosts();
        }
      });
    }
  }

  observeCacheChange() {
    this.subscriptionCacheChange = this._socialService.postCacheChanged().subscribe(() => {
      this.initPosts();
    });
  }

  fetchFollowTopicsIfNotExist() {
    if(this.user && !this.user.followingTopics) {
      this._sharedService.get('/social/get-followed-topics').subscribe((res: IGetFollowingTopicsResult) => {
        if(res.statusCode == 200) {
          this.user.setFollowingTopics(res.data);
        } else {
          console.log(res.message);
        }
      }, error => {
        console.log(error);
      });
    }
  }


  async initPosts() {
    this.disposeCacheIfNeeded();
    this.posts = null;
    const posts = this._socialService.postsOf(this.selectedTaxonomyType);
    const metadata = this._socialService.metadataOf(this.selectedTaxonomyType);
    if(metadata) {
      this.isMorePosts = metadata.existMorePost;
    }
    if(!!posts) {
      setTimeout(() => {
        this.posts = posts;
        this._changeDetector.detectChanges();
      }, 100);
    } 
    // else if (this._profileService.loginStatus == 'loggedIn' && (!this.user.followingTopics || this.user.followingTopics.length == 0)) {
    //     // show modal and stop here
    // } 
    else {
      try {
        // if user is not logged in, get all contents base on selected taxonomy & category

        // if user is logged in, check follow-topics status & follow-users status
        //// if empty --> let user to select topics before fetch posts --> wait result and restart initPosts
        //// if not --> get feed based on selected taxonomy & category


        
        this.posts = await this.fetchPosts(); 
      } catch (error) {
        console.log(error)
        this.posts = [];
      }
    }
  }

  disposeCacheIfNeeded() {
    const meta = this._socialService.metadataOf(this.selectedTaxonomyType);

    const topicId = this.selectedTopicId ? this.selectedTopicId : null;
    const topicIdInMeta = meta && meta.topic ? meta.topic : null;

    const filterByFollowingInMeta = meta?.filterByFollowing || null;

    const needToDispose = (topicId != topicIdInMeta) || (filterByFollowingInMeta != this.isFilterByFollowingOn);
    if(needToDispose) {
      this._socialService.disposeCacheOf(this.selectedTaxonomyType);
    }
  }

  fetchPosts(): Promise<ISocialPost[]> {
    return new Promise((resolve, reject) => {
      const tax = this.selectedTaxonomyType;
      
      const params: ISocialPostSearchQuery = {
        count: this.countPerPage,
        ... (this.selectedTopicId) && { tags: [this.selectedTopicId] },
        ... (this.posts && this.posts.length > 0) && { timestamp: this.posts[this.posts.length - 1].createdAt },
      }

      switch(this.selectedTaxonomyType) {
        case 'feed':
          params.excludeExpiredPromo = true;
          break;
        case 'article':
          params.contentType = 'ARTICLE';
          break;
        case 'event':
          delete params.timestamp;

          params.contentType = 'EVENT';
          params.sortBy = 'eventStartTime';
          params.order = 'asc';
          
          const meta = this._socialService.metadataOf('event');
          if(meta && meta.eventTimeRange) {
            params.eventTimeRange = meta.eventTimeRange;
          } else if(this.posts?.length > 0) {
            params.eventTimeRange = [this.posts[this.posts.length - 1].startAt.toISOString()];
          } else {
            const now = new Date();
            params.eventTimeRange = [now.toISOString()];
          }
          break;
        case 'note':
          params.contentType = 'NOTE';
          break;
        case 'voice':
          params.contentType = 'NOTE';
          params.hasVoice = true;
          break;
        case 'media':
          params.contentType = 'NOTE';
          params.hasMedia = true;
          break;
        case 'promotion':
          params.contentType = 'PROMO';
          params.excludeExpiredPromo = true;
        default:
          console.log('oops. this taxonomy type is not implemented yet.: ', this.selectedTaxonomyType);
      }

      const query = new SocialPostSearchQuery(params).toQueryParams();
      const path = this.isFilterByFollowingOn ? 'note/get-feed' : 'note/filter';

      // console.log(path, query)

      this.isLoading = true;
      this._sharedService.get(path + query).subscribe((res: IGetSocialContentsResult) => {
        this.isLoading = false;
        if(res.statusCode === 200) {
          this.isMorePosts = (res.data.data.length < this.countPerPage) ? false : true;
          const posts = this._socialService.saveCache(
            res.data.data, 
            this.selectedTaxonomyType, 
            {
              userId: this.user ? this.user._id : null, 
              topic: this.selectedTopicId, 
              existMorePost: this.isMorePosts,
              filterByFollowing: this.isFilterByFollowingOn,
            }
          );
          resolve(posts);
        } else {
          this.isMorePosts = false;
          reject(res.message);
        }
      }, error => {
        this.isLoading = false;
        this.isMorePosts = false;
        console.log(error);
        reject('Something went wrong. Please try again later');
      });
    });
  }

  onPublishNewPost(data: ISocialPost) {
    data.author = this._profileService.user;
    const note = new SocialNote(data);
    note.setSanitizedDescription(this._sanitizer.bypassSecurityTrustHtml(note.description));
    this.newPosts.unshift(note);
  }

  onSubmitFollowTopics() {
    // this is used only when user doesn't follow any topics.
    // if the user already follow some topics, it doesn't work properly.
    if(this.user) {
      const followingTopics = this.selectedFollowingTopicIds.filter(id => {
        let notExist = true;
        if(this.user.followingTopics?.indexOf(id) >= 0) { 
          notExist = false; 
        }
        return notExist;
      });

      const data = {
        ids: followingTopics,
        type: 'topic',
      }

      this.isSelectTopicsUploading = true;
      this._sharedService.post(data, 'social/follow-multiple').subscribe((res: IFollowMultipleResult) => {
        this.isSelectTopicsUploading = false;

        if(res.statusCode == 200) {
          this.user.setFollowingTopics(followingTopics);

          this._socialService.dispose();
          this.initPosts();

          this.isSelectTopicsUploadDone = true;
          setTimeout(() => {
            this.isSelectTopicsUploadDone = false;
          }, 2000);

        } else {
          console.log(res.message);
          this._toastr.error('Something went wrong. Please try again');
        }
      }, error => {
        console.log(error);
        this.isSelectTopicsUploading = false;
        this._toastr.error('Something went wrong. Please try again');
      });
    }
  }

}
