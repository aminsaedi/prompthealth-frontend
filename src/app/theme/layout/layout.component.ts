import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, ActivationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnDestroy, OnInit {

  public showFooter = false;
  public onMagazine: boolean = false;

  private isInitial = true;
  private urlPrev: string = '';

  private routerEventSubscription: Subscription;

  constructor(
    private _router: Router,
    private _headerService: HeaderStatusService,
  ) {  }

  ngOnDestroy() {
    this.routerEventSubscription.unsubscribe();
  }

  ngOnInit() {
    this.routerEventSubscription = this._router.events.subscribe((event) => {
      if (event instanceof ActivationStart) { 
        this.isInitial = false; 
        this._headerService.showShadow();
      }

      if (event instanceof NavigationEnd) {
        const regexHideFooter = /(dashboard)|(page\/products)|(\/community)/;
        this.showFooter = !event.url.match(regexHideFooter);
  
        this.onMagazine = event.url.match(/magazines|blogs/) ? true : false;  

        if(event.url != '/' && event.url != '/auth/login') {
          setTimeout(()=> {
            this._headerService.showShadow();
          }, 0);
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
          window.scrollBy(0, el.getBoundingClientRect().top - 100);
        } else if (pathPrev != pathCurrent) {
          window.scroll(0, 0); 
        }
  
        this.urlPrev = event.url;

      }
    });
  }
}
