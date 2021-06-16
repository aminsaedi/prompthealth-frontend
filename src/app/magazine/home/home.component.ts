import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public videos: any = [];
  
  public idxCategoryActive: number = 0;
  public carouselStarted: boolean = false;
  public idxCurrentCarouselVideo: number = null;
  private timerCarouselVideo: any = null;

  @HostListener('window:resize') onWindowResize() {
    if(window.innerWidth && window.innerWidth >= 992) {
      this.stopCarousel();
    } else {
      this.startCarousel();
    }
  }

  @ViewChild('videosContainer') private videosContainer: ElementRef;
  
  constructor() { }

  ngOnInit(): void {
    this.videos = [null, null, null];
    this.onWindowResize();
  }

  onTapCategory(i: number) {
    this.idxCategoryActive = i;
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
      const dist = (w + 15) * i;
      el.scrollTo({left: dist, behavior: 'smooth'});
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
