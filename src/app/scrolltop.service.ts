
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, ActivationStart, NavigationStart } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'src/environments/environment';

declare let gtag: Function;
declare let fbq: Function;

@Injectable()
export class ScrollTopService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router) {
  }

  private isInitial = true;
  private urlPrev: string = '';
  private disableAnalytics: boolean = environment.config.disableAnalytics;

  setScrollTop() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe((event: NavigationEnd) => {
        if (event instanceof ActivationStart) { 
          this.isInitial = false; 
        }

        if (event instanceof NavigationEnd) {
          /** google analytics */
          if(!this.disableAnalytics){
            gtag('config', 'UA-192757039-1',{
              'page_path': event.urlAfterRedirects
            });

            if(!window.location.href.match(/keyword/)){
              fbq('track', 'PageView');  
            }            
          }

          const pathPrev = this.urlPrev.replace(/\?.*$/, '');
          const pathCurrent = event.url.replace(/\?.*$/, '');

          if (event.url.match(/#addon/)) {
            const timer = this.isInitial ? 1000 : 400;
            setTimeout(() => {
              const el = document.querySelector('#addon');
              window.scrollBy(0, el.getBoundingClientRect().top - 100);
            }, timer);
          } else if (event.url.match(/\/magazines\/(category|tag|video|podcast|event)(\/.+)?\/\d/) && !this.isInitial) {
            const el = document.querySelector('#archive');
            console.log('scroll to arhchive');
            window.scrollBy(0, el.getBoundingClientRect().top - 100);
          } else if (pathPrev != pathCurrent) { 
            window.scroll(0, 0); 
          }

          this.urlPrev = event.url;
        }
      });
    }
  }
}
