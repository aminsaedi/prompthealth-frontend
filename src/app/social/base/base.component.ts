import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ChildActivationStart, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {

  get userName() { return this.user ? this.user.name : ''; }
  get user() { return this._profileService.profile; }

  private isPopState: boolean = false;
  private onProfile: boolean = false;
  private countChildActivationStart: number = 0;
  private routerEventSubscription: Subscription; 
  
  private urlPrev: {
    path: string,
    query: string,
    full: string,
  };

  @ViewChild('modalUserMenu') private modalUserMenu: ModalComponent;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _profileService: ProfileManagementService,
  ) { }

  ngOnDestroy() {
    console.log('socialBase.destroy')
    this.routerEventSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.urlPrev = this.getURLset();
    console.log('socialBase.init');

    this._route.queryParams.subscribe((param: {modal: string}) => {
      console.log(param.modal);
    });

    this.routerEventSubscription = this._router.events.subscribe(e => {

      if(e instanceof NavigationStart) {
        this.isPopState = !!(e.navigationTrigger ==  'popstate');
      }

      if(e instanceof ChildActivationStart) {
        this.countChildActivationStart ++;
        this.onProfile = !!(e.snapshot.routeConfig && e.snapshot.routeConfig.path == ':userid');
      }

      if(e instanceof NavigationEnd) {
        const urlCurrent = this.getURLset();
        const routeChangedWithinProfile = !!(this.countChildActivationStart == 1 && this.onProfile);

        if(this.isPopState) {
          //do not scroll
          console.log('popState');
        } else if(urlCurrent.path.match(/community\/profile\/\w+\/post/)) {
          this.scrollToTop();
          console.log('scrollToTop (on post single page)');
        } else if(routeChangedWithinProfile) {
          //do not scroll
          console.log('routeChangedWithinProfile');
        } else if(urlCurrent.path == this.urlPrev.path) {
          console.log('pathNotChanged');
        } else {
          this.scrollToTop();
          console.log('scrollToTop');
        }

        this.urlPrev = this.getURLset();

        this.onProfile = false;
        this.countChildActivationStart = 0;
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

  hideUserMenu() {
    this.modalUserMenu.goBack();
  }
}
