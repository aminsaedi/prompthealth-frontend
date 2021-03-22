
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, ActivationStart } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

declare let gtag: Function;

@Injectable()
export class ScrollTopService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router) {
  }

  private isInitial = true;

  setScrollTop() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe((event: NavigationEnd) => {
        if (event instanceof ActivationStart) { this.isInitial = false; }

        if (event instanceof NavigationEnd) {
          /** google analytics */
          gtag('config', 'UA-192757039-1',{
            'page_path': event.urlAfterRedirects
          });


          if (event.url.match(/#addon/)) {
            const timer = this.isInitial ? 1000 : 400;
            setTimeout(() => {
              const el = document.querySelector('#addon');
              window.scrollBy(0, el.getBoundingClientRect().top - 100);
            }, timer);
          } else { window.scroll(0, 0); }
        }
      });
    }
  }
}
