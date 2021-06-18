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
  public latestByCategory: Blog[] = null;
  public videos: Blog[] = null;
  public podcasts: Blog[] = null;

  public categories: {id: string, item_text: string}[] = null;
  public idxCategoryActive: number = 0;

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
      await this.initCategories();
    } catch(err) {
      this._toastr.error('Something went wrong. Please try again later.');
    }

    this.initLatest();
    this.initLatestVideo();
  }

  initCategories(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._mService.categories) {
        this.categories = this._mService.categories;
        resolve(true);
      } else {
        const path = `category/get-categories`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this._mService.saveCacheCategories(res.data);
            this.categories = res.data;
            resolve(true);
          }else {
            console.log(res);
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
    } else {
      this.latest = this._mService.createDummyArray(4);
      const query = new BlogSearchQuery();
      const path = `blog/get-all${query.queryParams}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200) {
          this._mService.saveCache(res.data, 1);
          this.latest = this._mService.postsOf(null, 1, 0, 4);
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

  onTapCategory(i: number) {
    this.idxCategoryActive = i;
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