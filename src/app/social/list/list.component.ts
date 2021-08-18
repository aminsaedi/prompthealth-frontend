import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { BlogSearchQuery, IBlogSearchQuery } from 'src/app/models/blog-search-query';
import { ISocialNote, SocialNote } from 'src/app/models/social-note';
import { ISocialPost, SocialPost } from 'src/app/models/social-post';
import { ISocialPostResult } from 'src/app/models/social-post-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation, fadeAnimation } from 'src/app/_helpers/animations';
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

  private initDone: boolean = false;

  @HostListener('window:scroll', ['$event']) async onWindowScroll(e: Event) {
    if(!this.isLoading && this.isMorePosts && document.body && this.posts && this.posts.length > 0) {
      const startLoad = !!(document.body.scrollHeight < window.scrollY + window.innerHeight * 2);
      if(startLoad) {
        console.log('startLoad');
        this.isLoading = true;
        
        const page = Math.ceil(this.posts.length / this.countPerPage) + 1 
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
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  // public notesTest = null;
  ngOnInit(): void {
    // const notepath = `note/get-by-author/610c12755096aa0b7cae6a4e`;
    // this._sharedService.getNoAuth(notepath).subscribe((res: any) => {
    //   const notes = [];
    //   res.data.forEach(data => {
    //     notes.push(new SocialPost(data));
    //   })
    //   console.log(notes);
    //   this.notesTest = notes;
    // })


    this._route.params.subscribe((param: {taxonomyType: SocialPostTaxonomyType, topicId: string}) => {
      this.selectedTopicId = param.topicId || null;
      this.selectedTaxonomyType = param.taxonomyType || 'feed';
      console.log(this.selectedTaxonomyType);

      if(this.initDone) {
        this.initPosts();
      }
    });

    this._route.queryParams.subscribe((param: {post: string}) => {
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
      setTimeout(() => {
        this.posts = posts;
        this._changeDetector.detectChanges();
        console.log('set posts from cache')
      }, 100);
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
          const posts = this._socialService.saveCache(res.data.data, this.selectedTaxonomyType);
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

  onPublishNewPost(data: ISocialNote) {
    data.authorId = this._profileService.user;

    this.newPosts.unshift(new SocialNote(data));
  }
}
