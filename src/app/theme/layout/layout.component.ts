import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, ActivationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { slideVerticalReverse100pcAnimation } from 'src/app/_helpers/animations';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  animations: [slideVerticalReverse100pcAnimation]
})
export class LayoutComponent implements OnDestroy, OnInit {

  public showFooter = false;
  public isHeaderShown = false;
  public onHomepage: boolean;
  public disableHeaderAnimation = true;

  private isInitial = true;
  private urlPrev: string = '';

  private routerEventSubscription: Subscription;

  constructor(
    private _router: Router,
    private _location: Location,
    private _headerService: HeaderStatusService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
  ) {  }

  ngOnDestroy() {
    this.routerEventSubscription.unsubscribe();
  }

  ngOnInit() {
    if(!this._uService.isServer) {
      this.scrollToTop();

      this._headerService.observeHeaderStatus().subscribe(([key, val, animate]: [string, any, boolean]) => {
        this.disableHeaderAnimation = !animate;

        if(!animate) {
          this[key] = val;
          this._changeDetector.detectChanges();
        } else {
          setTimeout(() => {
            this[key] = val;
            this._changeDetector.detectChanges();
          });
        }
        setTimeout(() => {
          this.disableHeaderAnimation = true;
        },500);
      });
    }

    this.changeStatusBasedOnPath();

    this.routerEventSubscription = this._router.events.subscribe((event) => {
      if (event instanceof ActivationStart) { 
        this.isInitial = false; 
        this._headerService.showShadow();
      }

      if (event instanceof NavigationEnd) {
        this.changeStatusBasedOnPath();

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
          this.scrollToTop()
        }
  
        this.urlPrev = event.url;

      }
    });
  }

  changeStatusBasedOnPath() {
    const regexHideFooter = /(dashboard)/;
    this.showFooter = !this._location.path().match(regexHideFooter);

    this.isHeaderShown = this._location.path() != '';
    this.onHomepage = this._location.path() == '';
  }

  scrollToTop() {
    window.scroll(0, 0);
  }
}
