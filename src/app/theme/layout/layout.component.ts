import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, ActivationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SearchBarService } from 'src/app/shared/services/search-bar.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { expandVerticalAnimation, slideVerticalReverse100pcAnimation } from 'src/app/_helpers/animations';
import { getListedMenu } from 'src/app/_helpers/get-listed-menu';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  animations: [slideVerticalReverse100pcAnimation, expandVerticalAnimation]
})
export class LayoutComponent implements OnDestroy, OnInit {

  get isLoggedIn(): boolean { return !!this.user; }
  get user() { return this._profileService.profile; }
  get planMenuData() { return getListedMenu; }

  public showFooter = false;
  public isHeaderShown = false;
  public isMenuSmShown = false;
  public onHomepage: boolean;
  public disableHeaderAnimation = true;
  public isPlanMenuShown: boolean = false;

  private isInitial = true;
  private urlPrev: string = '';

  private routerEventSubscription: Subscription;

  constructor(
    private _router: Router,
    private _location: Location,
    private _headerService: HeaderStatusService,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
    private _modalService: ModalService,
    private _searchBarService: SearchBarService,
  ) {  }

  ngOnDestroy() {
    this.routerEventSubscription.unsubscribe();
  }

  ngOnInit() {
    this.isHeaderShown = true;

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

    this.onHomepage = this._location.path() == '';

    this.isMenuSmShown = !!this._location.path().match(/\?menu=show/);
  }

  onClickMenuItemSm(goto: string) {
    this.hideMenuSm([goto]);
  }

  onClickUserIcon() {
    this._modalService.show('user-menu', this.user);
  }

  onClickFindProviders() {
    this._searchBarService.dispose();
  }

  hideMenuSm(nextRoute: string[] = null) {
    if(nextRoute) {
      this._router.navigate(nextRoute, {replaceUrl: true});  
    } else {
      const state = this._location.getState() as any;
      if(state.navigationId == 1) {
        const [path, queryParams] = this._modalService.currentPathAndQueryParams;
        queryParams.menu = null;
        this._router.navigate([path], {queryParams: queryParams, replaceUrl: true});  
      } else {
        this._location.back();
      }  
    }
  }

  onClickGetListed() {
    this.isPlanMenuShown = !this.isPlanMenuShown;
  }

  hidePlanMenu() {
    this.isPlanMenuShown = false;
  }

  scrollToTop() {
    window.scroll(0, 0);
  }
}

