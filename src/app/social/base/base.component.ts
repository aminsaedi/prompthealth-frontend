import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {

  get userId() { return this.user ? this.user._id : ''; }
  get userRole() { return this.user ? this.user.role : 'U'; }
  get userName() { return this.user ? this.user.name : ''; }
  get user() { return this._profileService.profile; }


  private isPopState: boolean = false;
  private subscriptionRouterEvent: Subscription; 
  
  private urlPrev: {
    path: string,
    query: string,
    full: string,
  };


  constructor(
    private _router: Router,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _modalService: ModalService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnDestroy() {
    this.subscriptionRouterEvent.unsubscribe();
  }

  ngOnInit(): void {

    this.urlPrev = this.getURLset();

    this.subscriptionRouterEvent = this._router.events.subscribe(e => {

      if(e instanceof NavigationStart) {
        this.isPopState = !!(e.navigationTrigger ==  'popstate');
      }

      if(e instanceof NavigationEnd) {
        const urlCurrent = this.getURLset();

        // if url has fragment (#), scroll-to-fragment is controlled by another component (ex: cardComponent)
        if(this.isPopState) {
          //do not scroll
          console.log('popState');
        } else if(urlCurrent.path.match(/community\/profile\/\w+\/post/)) {
          this.scrollToTop();
          console.log('scrollToTop (on post single page)');
        } else if(urlCurrent.path.match('profile') && this.urlPrev.path.match('profile')) {
          //do not scroll
          console.log('routeChangedWithinProfile');
        } else if(urlCurrent.path == this.urlPrev.path) {
          console.log('pathNotChanged');
        } else {
          this.scrollToTop();
          console.log('scrollToTop');
        }

        this.urlPrev = this.getURLset();
      }
    });
  }

  scrollToTop() {
    window.scroll(0,0);
  }

  getURLset() {
    const urlset = {
      path: null,
      query: null,
      full: null,
    };

    if(location) {
      urlset.path = location.pathname,
      urlset.query = location.search,
      urlset.full = location.pathname + location.search
    }  

    return urlset;
  }

  onClickUserMenuItem(route: string[]) {
    this._modalService.hide(true, route);
  }

  onClickUserMenuItemLogout() {
    this._sharedService.logout(false);
    this._modalService.hide();
  }

  onChangeLoginState(state: 'start'|'done') {
    if(state == 'done') {
      this._modalService.hide();        
    }
  }
}
