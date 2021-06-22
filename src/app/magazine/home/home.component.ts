import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { count } from 'rxjs/operators';
import { Blog, IBlog } from 'src/app/models/blog';
import { BlogSearchQuery } from 'src/app/models/blog-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { smoothHorizontalScrolling } from 'src/app/_helpers/smooth-scroll';
import { MagazineService } from '../magazine.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public latest: Blog[] = null; 
  public latestByTag: Blog[] = null;
  public videos: Blog[] = null;
  public podcasts: Blog[] = null;

  public tags: {_id: string, title: string}[] = null;
  public idxTagActive: number = null;

  public carouselStarted: boolean = false;
  public idxCurrentCarouselVideo: number = null;
  private timerCarouselVideo: any = null;

  @HostListener('window:resize') onWindowResize() {
    this.initCarousel();
  }

  @ViewChild('videosContainer') private videosContainer: ElementRef;
  
  constructor(
    private _mService: MagazineService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }


  async ngOnInit() {
    try {
      await this.initTags();
    } catch(err) {
      this._toastr.error('Something went wrong. Please try again later.');
    }

    this.initLatest();
    this.initLatestVideo();
    this.initLatestPodcast();
  }

  initTags(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._mService.categories) {
        this.tags = this._mService.tags;
        resolve(true);
      } else {
        const path = `tag/get-all`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this._mService.saveCacheTags(res.data.data);
            this.tags = res.data.data;
            resolve(true);
          }else {
            reject(res.message);
          }
        }, (error) => {
          console.log(error);
          reject(error);
        });
      }  
    });
  }

  initLatest(): void {
    const latest = this._mService.postsOf(null, 1, 0, 4);
    if (latest) {
      this.latest = latest;
      this.latestByTag = this._mService.postsOf(null, 1, 4, 7);
    } else {
      this.latest = this._mService.createDummyArray(4);
      const query = new BlogSearchQuery();
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          this._mService.saveCache(res.data, 1);
          this.latest = this._mService.postsOf(null, 1, 0, 4);
          this.latestByTag = this._mService.postsOf(null, 1, 4, 7);
        }
      });
    }
  }

  initLatestVideo() {
    const videos = this._mService.postsOf('video', 1, 0, 3);
    if (videos) {
      this.videos = videos;
    } else {
      this.videos = this._mService.createDummyArray(3);
      const query = new BlogSearchQuery({existVideo: true});
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          this._mService.saveCache(res.data, 1, 'video');
          this.videos = this._mService.postsOf('video', 1, 0, 3);
          this.initCarousel();
        }
      });
    }
  }

  initLatestPodcast() {
    const podcasts = this._mService.postsOf('podcast', 1, 0, 3);
    if (podcasts) {
      this.podcasts = podcasts;
    } else {
      this.podcasts = this._mService.createDummyArray(3);
      const query = new BlogSearchQuery({existPodcast: true});
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          this._mService.saveCache(res.data, 1, 'podcast');
          this.podcasts = this._mService.postsOf('podcast', 1, 0, 3);
        }
      });
    }
  }

  onTapTag(i: number = null) {
    this.idxTagActive = i;
    const tagId = (i === null) ? 'all' : this.tags[i]._id;

    const latestByTag = this._mService.postsOf(tagId, 1, 0, 7);
    if (latestByTag) {
      this.latestByTag = latestByTag;
    } else {
      this.latestByTag = this._mService.createDummyArray(7);

      const query = new BlogSearchQuery({tags: (i === null) ? null : [this.tags[i]._id]});
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          this._mService.saveCache(res.data, 1, tagId);
          this.latestByTag = this._mService.postsOf(tagId, 1, 0, 7);
        }
      });
    }
  }

  initCarousel() {
    if(!window.innerWidth || window.innerWidth >= 992) {
      this.stopCarousel();
    } else {
      this.startCarousel();
    }
  }

  stopCarousel() {
    this.carouselStarted = false;
    this.idxCurrentCarouselVideo = null;
    clearInterval(this.timerCarouselVideo);
  }

  startCarousel() {
    if(!this.carouselStarted) {
      this.carouselStarted = true;
      this.idxCurrentCarouselVideo = 0;
      this.setTimerCarouselVideo();
    } else {

    }
  }

  moveVideoCarouselTo(i: number, resetTimer: boolean = true){
    if(this.videosContainer) {
      const el: HTMLElement = this.videosContainer.nativeElement;
      const w = el.clientWidth;
      const start = el.scrollLeft;
      const to = (w + 15) * i;
      const amount = to - start;

      smoothHorizontalScrolling(el, 250, amount, start);
      this.idxCurrentCarouselVideo = i;

      if(resetTimer) {
        this.setTimerCarouselVideo();        
      }
    }
  }

  setTimerCarouselVideo() {
    clearInterval(this.timerCarouselVideo);

    this.timerCarouselVideo = setInterval(() => {
      const next = (this.idxCurrentCarouselVideo + 1) % this.videos.length;
      this.moveVideoCarouselTo(next);
    }, 8000);
  }
}